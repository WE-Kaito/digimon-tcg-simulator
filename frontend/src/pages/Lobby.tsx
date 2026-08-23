import styled from "@emotion/styled";
import { ChangeEvent, MouseEvent as ReactMouseEvent, useCallback, useEffect, useState } from "react";
import {
    ErrorRounded as WarningIcon,
    HttpsOutlined as PrivateIcon,
    Rule as RestrictionsAppliedIcon,
    PeopleAlt as PopulationIcon,
    Search as SearchIcon,
    WifiOffRounded as OfflineIcon,
} from "@mui/icons-material";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import { DeckReadySate, useGeneralStates } from "../hooks/useGeneralStates.ts";
import useWebSocket from "react-use-websocket";
import { notifyWarning } from "../utils/toasts.ts";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { useSound } from "../hooks/useSound.ts";
import { useNavigate } from "react-router-dom";
import SoundBar from "../components/SoundBar.tsx";
import { DeckType } from "../utils/types.ts";
import DeckPanel from "../components/deckPanel/DeckPanel.tsx";
import axios from "axios";
import MenuDialog from "../components/MenuDialog.tsx";
import Chat, { ChatMessage } from "../components/lobby/Chat.tsx";
import { profilePicture } from "../utils/avatars.ts";
import {
    Checkbox,
    Dialog,
    DialogContent,
    FormControlLabel,
    IconButton,
    InputBase,
    Popover,
    useMediaQuery,
} from "@mui/material";
import crownSrc from "../assets/crown.webp";
import countdownAnimation from "../assets/lotties/countdown.json";
import DeckIcon from "@mui/icons-material/StyleTwoTone";
import ProfileIcon from "@mui/icons-material/ManageAccountsTwoTone";
import TestIcon from "@mui/icons-material/FitnessCenterRounded";

import Lottie from "lottie-react";
import LogoutButton from "../components/lobby/LogoutButton.tsx";
import { useDeckStates } from "../hooks/useDeckStates.ts";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";
import { Button } from "../components/Button.tsx";
import useQuery from "../hooks/useQuery.ts";
import PatchnotesLink from "../components/PatchnotesLink.tsx";
import ChatContextMenu from "../components/lobby/ChatContextMenu.tsx";
import { AppNotification, NotificationBell } from "./MainMenu.tsx";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import useInviteCooldowns from "../hooks/useInviteCooldowns.ts";
import { handleReconnectStatus } from "../utils/reconnectStatus.ts";

function ensureChatTimestamp(chatMessage: ChatMessage): ChatMessage {
    return {
        ...chatMessage,
        timestamp: chatMessage.timestamp ?? new Date().toISOString(),
    };
}

function parseChatMessage(messageJson: string): ChatMessage {
    try {
        return ensureChatTimestamp(JSON.parse(messageJson) as ChatMessage);
    } catch {
        const separatorIndex = messageJson.indexOf(":");
        const author = separatorIndex >= 0 ? messageJson.substring(0, separatorIndex) : "【SERVER】";
        const message = separatorIndex >= 0 ? messageJson.substring(separatorIndex + 1).trimStart() : messageJson;

        return {
            id: `${Date.now()}-${Math.random()}`,
            author,
            message,
            timestamp: new Date().toISOString(),
        };
    }
}

type LobbyPlayer = {
    name: string;
    avatarName: string;
    ready: boolean;
};

type OnlinePlayer = {
    name: string;
    status: string;
};

type Room = {
    id: string;
    name: string;
    hostName: string;
    hasPassword: boolean;
    restrictionsApplied: boolean;
    players: LobbyPlayer[];
};

export default function Lobby() {
    const websocketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const websocketURL = `${websocketProtocol}//${window.location.host}/api/ws/lobby`;

    const user = useGeneralStates((state) => state.user);
    const setActiveDeck = useGeneralStates((state) => state.setActiveDeck);
    const activeDeckId = useGeneralStates((state) => state.activeDeckId);
    const getActiveDeck = useGeneralStates((state) => state.getActiveDeck);
    const activeDeckReadyState = useGeneralStates((state) => state.activeDeckReadyState);

    const setIsRematch = useGameUIStates((state) => state.setIsRematch);

    const decks = useDeckStates((state) => state.decks);

    const gameId = useGameBoardStates((state) => state.gameId);
    const setGameId = useGameBoardStates((state) => state.setGameId);
    const setGameLobbyRoomId = useGameBoardStates((state) => state.setGameLobbyRoomId);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);

    const playJoinSfx = useSound((state) => state.playJoinSfx);
    const playKickSfx = useSound((state) => state.playKickSfx);
    const playCountdownSfx = useSound((state) => state.playCountdownSfx);

    const { data: isAdmin, isFetching: isFetchingIsAdmin } = useQuery<boolean>("/api/user/isAdmin");
    const { data: isBanned, isFetching: isFetchingIsBanned } = useQuery<boolean>("/api/user/isBanned");

    const [isAlreadyOpenedInOtherTab, setIsAlreadyOpenedInOtherTab] = useState<boolean>(false);

    const [userCount, setUserCount] = useState<number>(0);
    const [lobbyPlayers, setLobbyPlayers] = useState<OnlinePlayer[]>([]);
    const [onlineUsersAnchor, setOnlineUsersAnchor] = useState<HTMLButtonElement | null>(null);
    const [isPlayerSearchOpen, setIsPlayerSearchOpen] = useState(false);
    const [playerSearch, setPlayerSearch] = useState("");
    const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
    const [userCountQuickPlay, setUserCountQuickPlay] = useState<number>(0);
    const [isRejoinable, setIsRejoinable] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [deckObject, setDeckObject] = useState<DeckType | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [incomingGameInvites, setIncomingGameInvites] = useState<string[]>([]);
    const [pendingGameInvites, setPendingGameInvites] = useState<Set<string>>(() => new Set());
    const {
        getInviteCooldownSeconds,
        inviteCooldownPlayers,
        isInviteCoolingDown,
        startInviteCooldown,
    } = useInviteCooldowns();

    const [newRoomName, setNewRoomName] = useState<string>("");
    const [newRoomPassword, setNewRoomPassword] = useState<string>("");
    const [restrictionsApplied, setRestrictionsApplied] = useState<boolean>(false);

    const [roomToJoinId, setRoomToJoinId] = useState<string>(""); // for password protected rooms
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [isWrongPassword, setIsWrongPassword] = useState<boolean>(false);

    const [joinedRoom, setJoinedRoom] = useState<Room | null>(null);

    const [isSearchingGame, setIsSearchingGame] = useState<boolean>(false);

    const [showCountdown, setShowCountdown] = useState<boolean>(false);

    const navigate = useNavigate();

    function handleReturnToGame() {
        setIsOpponentOnline(true);
        setIsLoading(false);
        navigate("/game", { state: { gameEntryConfirmed: true } });
    }

    function handleOnlineUsersClick(event: ReactMouseEvent<HTMLButtonElement>) {
        const button = event.currentTarget;
        setOnlineUsersAnchor((anchor) => (anchor ? null : button));
    }

    function setIsLoadingWithDebounce() {
        setIsLoading(true);

        const timer = setTimeout(() => setIsLoading(false), 5000); // reset loading state after 5 seconds
        return () => clearTimeout(timer);
    }

    const websocket = useWebSocket(
        websocketURL,
        {
            shouldReconnect: () => true,

            onMessage: (event) => {
                if (event.data === "[SUCCESS]") {
                    setIsLoading(false);
                }

                if (event.data === "[NO_ACTIVE_DECK]") {
                    notifyWarning("No active deck not found! Please refresh if this error should not appear.");
                    setActiveDeck(decks[0].id);
                }

                if (event.data === "[BROKEN_DECK]") {
                    notifyWarning("Cards in your deck could not be found!");
                }

                if (event.data.startsWith("[USER_COUNT]:")) {
                    setUserCount(parseInt(event.data.substring("[USER_COUNT]:".length)));
                    websocket.sendMessage("/heartbeat/");
                }

                if (event.data.startsWith("[USER_COUNT_QUICK_PLAY]:")) {
                    setUserCountQuickPlay(parseInt(event.data.substring("[USER_COUNT_QUICK_PLAY]:".length)));
                }

                if (event.data === "[QUICK_PLAY_QUEUED]") {
                    setIsSearchingGame(true);
                }

                if (event.data === "[QUICK_PLAY_CANCELLED]") {
                    setIsSearchingGame(false);
                }

                if (event.data.startsWith("[LOBBY_PLAYERS]:")) {
                    setLobbyPlayers(JSON.parse(event.data.substring("[LOBBY_PLAYERS]:".length)) as OnlinePlayer[]);
                }

                if (event.data.startsWith("[ROOMS]:")) {
                    setRooms(JSON.parse(event.data.substring("[ROOMS]:".length)));
                }

                if (event.data === "[PROMPT_PASSWORD]") {
                    setIsWrongPassword(false);
                    setPassword("");
                    setIsPasswordDialogOpen(true);
                }

                if (event.data.startsWith("[JOIN_ROOM]:")) {
                    setJoinedRoom(JSON.parse(event.data.substring("[JOIN_ROOM]:".length)));
                    setIsLoading(false);
                    setNewRoomName("");
                    setNewRoomPassword("");
                    setIsPasswordDialogOpen(false);
                    setRestrictionsApplied(false);
                }

                if (event.data.startsWith("[ROOM_UPDATE]:")) {
                    setJoinedRoom(JSON.parse(event.data.substring("[ROOM_UPDATE]:".length)));
                }

                if (event.data === "[LEAVE_ROOM]") {
                    setJoinedRoom(null);
                    setGameLobbyRoomId("");
                    setPrivateMessages([]);
                    setIsLoading(false);
                    playJoinSfx(); // new sound?
                }

                if (event.data === "[KICKED]") {
                    setJoinedRoom(null);
                    setGameLobbyRoomId("");
                    setPrivateMessages([]);
                    playKickSfx();
                }

                if (event.data === "[PLAYER_JOINED]") {
                    playJoinSfx();
                }

                if (event.data === "[WRONG_PASSWORD]") {
                    setIsLoading(false);
                    setIsWrongPassword(true);
                }

                if (event.data.startsWith("[COMPUTE_GAME]:")) {
                    localStorage.setItem("isReported", JSON.stringify(false)); // see ReportButton.tsx
                    localStorage.removeItem("boardStore");
                    const gameId = event.data.substring("[COMPUTE_GAME]:".length);
                    setGameLobbyRoomId("");
                    startGameSequence(gameId);
                }

                if (event.data.startsWith("[COMPUTE_ROOM_GAME]:")) {
                    localStorage.setItem("isReported", JSON.stringify(false));
                    localStorage.removeItem("boardStore");
                    const [gameId, roomId] = event.data.substring("[COMPUTE_ROOM_GAME]:".length).split(":", 2);
                    setGameLobbyRoomId(roomId);
                    startGameSequence(gameId);
                }

                if (event.data.startsWith("[GAME_INVITE]:")) {
                    const inviter = event.data.substring("[GAME_INVITE]:".length);
                    setIncomingGameInvites((inviters) =>
                        inviters.includes(inviter) ? inviters : [...inviters, inviter]
                    );
                }

                if (event.data.startsWith("[GAME_INVITE_RESPONSE]:")) {
                    const [, invitedPlayer] = event.data.split(":");
                    setPendingGameInvites((players) => {
                        const nextPlayers = new Set(players);
                        nextPlayers.delete(invitedPlayer);
                        return nextPlayers;
                    });
                }

                if (event.data.startsWith("[GAME_INVITE_CANCELLED]:")) {
                    const inviter = event.data.substring("[GAME_INVITE_CANCELLED]:".length);
                    setIncomingGameInvites((inviters) => inviters.filter((name) => name !== inviter));
                }

                handleReconnectStatus(event.data, gameId, setIsRejoinable, setGameId);

                if (event.data === "[SESSION_ALREADY_CONNECTED]") {
                    setIsAlreadyOpenedInOtherTab(true);
                }

                if (event.data.startsWith("[GLOBAL_CHAT]:")) {
                    const messagesArray = JSON.parse(event.data.substring("[GLOBAL_CHAT]:".length)) as ChatMessage[];
                    setMessages(messagesArray.map(ensureChatTimestamp));
                }

                if (event.data.startsWith("[CHAT_MESSAGE]:") && !joinedRoom) {
                    const messageJson = event.data.substring("[CHAT_MESSAGE]:".length);
                    const chatMessage = parseChatMessage(messageJson);
                    setMessages((messages) => [...messages, chatMessage]);
                }

                if (event.data.startsWith("[CHAT_MESSAGE_ROOM]:")) {
                    const messageJson = event.data.substring("[CHAT_MESSAGE_ROOM]:".length);
                    const chatMessage = parseChatMessage(messageJson);
                    setPrivateMessages((messages) => [...messages, chatMessage]);
                }

                if (event.data.startsWith("[MESSAGE_DELETED]:")) {
                    const deletedMessageId = event.data.substring("[MESSAGE_DELETED]:".length);
                    setMessages((messages) => messages.filter((msg) => msg.id !== deletedMessageId));
                    setPrivateMessages((messages) => messages.filter((msg) => msg.id !== deletedMessageId));
                }
            },
        },
        !isFetchingIsBanned && !isBanned // connect only when not banned
    );

    function handleDeckChange(event: ChangeEvent<HTMLSelectElement>) {
        setActiveDeck(String(event.target.value)); // TODO: check if backend checks validity on each change:
    }

    function handleCreateRoom() {
        setIsLoadingWithDebounce();
        cancelQuickPlayQueue();
        const sanitizedNewRoomName = newRoomName.trim().replace(":", "∶"); // remove colons to avoid issues with message parsing
        websocket.sendMessage(
            "/createRoom:" + sanitizedNewRoomName + ":" + newRoomPassword + ":" + restrictionsApplied
        );
    }

    function handleJoinRoom(roomId: string) {
        setIsLoadingWithDebounce();
        cancelQuickPlayQueue();
        setPassword("");
        setRoomToJoinId(roomId);
        websocket.sendMessage("/joinRoom:" + roomId);
    }

    function handleJoinRoomWithPassword() {
        setIsLoadingWithDebounce();
        websocket.sendMessage("/password:" + roomToJoinId + ":" + password);
    }

    function handleToggleReady() {
        setIsLoadingWithDebounce();
        websocket.sendMessage("/toggleReady:" + joinedRoom?.id);
    }

    function handleLeaveRoom() {
        setIsLoadingWithDebounce();
        websocket.sendMessage("/leave:" + joinedRoom?.id + ":" + user + ":true");
    }

    function handleKickPlayer(userName: string) {
        setIsLoadingWithDebounce();
        websocket.sendMessage("/kick:" + joinedRoom?.id + ":" + userName);
        playKickSfx();
    }

    function handleStartGame() {
        setIsLoadingWithDebounce();
        cancelQuickPlayQueue();
        const newGameID = user + "‗" + joinedRoom?.players.find((p) => p.name !== user)?.name;
        websocket.sendMessage("/startGame:" + joinedRoom?.id + ":" + newGameID);
    }

    function startGameSequence(gameId: string) {
        playCountdownSfx();
        setShowCountdown(true);
        const timer = setTimeout(() => {
            setGameId(gameId); // maybe use the lobby id (at least when displayName != accountName)?
            setIsRematch(false);
            clearBoard();
            setIsLoading(false);
            setJoinedRoom(null);
            navigate("/game", { state: { gameEntryConfirmed: true } });
        }, 3150);
        return () => clearTimeout(timer);
    }

    function cancelQuickPlayQueue() {
        websocket.sendMessage("/cancelQuickPlay");
    }

    function handleQuickPlay() {
        if (isSearchingGame) {
            cancelQuickPlayQueue();
        } else {
            websocket.sendMessage("/quickPlay");
        }
    }

    function handleInviteSent(player: string) {
        setPendingGameInvites((players) => new Set(players).add(player));
    }

    function handleInviteCancelled(player: string) {
        setPendingGameInvites((players) => {
            const nextPlayers = new Set(players);
            nextPlayers.delete(player);
            return nextPlayers;
        });
        startInviteCooldown(player);
    }

    function handlePlayerInvite(player: string) {
        if (pendingGameInvites.has(player)) {
            websocket.sendMessage(`/cancelGameInvite:${player}`);
            handleInviteCancelled(player);
            return;
        }

        if (isInviteCoolingDown(player)) return;

        websocket.sendMessage(`/inviteToGame:${player}`);
        handleInviteSent(player);
    }

    function handleGameInviteResponse(inviter: string, accepted: boolean) {
        websocket.sendMessage(`/gameInviteResponse:${inviter}:${accepted}`);
        setIncomingGameInvites((inviters) => inviters.filter((name) => name !== inviter));
    }

    const initialFetch = useCallback(() => {
        getActiveDeck();
    }, [getActiveDeck]);
    useEffect(() => {
        initialFetch();
    }, [initialFetch]);

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedPlayerSearch(playerSearch), 250);
        return () => window.clearTimeout(timeout);
    }, [playerSearch]);

    useEffect(() => {
        if (!gameId) setIsRejoinable(false);
    }, [gameId]);

    useEffect(() => {
        if (!activeDeckId || activeDeckId.includes("<html")) return;
        axios
            .get(`/api/profile/decks/${activeDeckId}`)
            .then((res) => setDeckObject(res.data as DeckType))
            .catch(console.error);
    }, [activeDeckId]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (joinedRoom) websocket.sendMessage("/leave:" + joinedRoom.id + ":" + user + ":false");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [joinedRoom, user, websocket]);

    const meInRoom = joinedRoom?.players.find((p) => p.name === user);
    // Todo: add restriction to room creation and disable here if it matches
    const startGameDisabled =
        activeDeckReadyState === DeckReadySate.NOT_FULL ||
        (!!joinedRoom &&
            (isLoading ||
                !!joinedRoom.players.find((p) => !p.ready) ||
                joinedRoom.players.length < 2 ||
                (joinedRoom.restrictionsApplied && activeDeckReadyState === DeckReadySate.VIOLATES_RESTRICTIONS)));

    const isMobile = useMediaQuery("(max-width:499px)");
    const filteredLobbyPlayers = lobbyPlayers.filter((player) =>
        player.name.toLowerCase().includes(debouncedPlayerSearch.trim().toLowerCase())
    );
    const notifications: AppNotification[] = incomingGameInvites.map((inviter) => ({
        id: `game-invite:${inviter}`,
        title: inviter,
        message: `${inviter} is requesting for a match.`,
        actions: [
            {
                label: "Accept",
                ariaLabel: `Accept match request from ${inviter}`,
                icon: <CheckIcon fontSize="small" />,
                variant: "primary",
                onClick: () => handleGameInviteResponse(inviter, true),
            },
            {
                label: "Decline",
                ariaLabel: `Decline match request from ${inviter}`,
                icon: <CloseIcon fontSize="small" />,
                variant: "danger",
                onClick: () => handleGameInviteResponse(inviter, false),
            },
        ],
    }));

    return (
        <MenuBackgroundWrapper>
            {showCountdown && (
                <Dialog
                    open={true}
                    sx={{ background: "rgba(8,8,8,0.5)", pointerEvents: "none" }}
                    PaperProps={{ sx: { background: "none", overflow: "hidden", boxShadow: "none" } }}
                >
                    <Lottie animationData={countdownAnimation} />
                </Dialog>
            )}

            <MenuDialog onClose={() => setIsPasswordDialogOpen(false)} open={isPasswordDialogOpen}>
                <DialogContent>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            alignItems: "center",
                            width: 300,
                            maxWidth: "100vw",
                        }}
                    >
                        <Input
                            value={password}
                            error={isWrongPassword}
                            type={"password"}
                            style={{
                                width: "calc(100% - 1.5rem)",
                                border: `2px solid ${isWrongPassword ? "crimson" : "#1C7540FF"}`,
                            }}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setIsWrongPassword(false);
                            }}
                        />
                        <Button
                            disabled={!password}
                            onClick={handleJoinRoomWithPassword}
                            style={{ width: "50%", minWidth: 100, background: "#1C7540FF" }}
                        >
                            {isWrongPassword ? "wrong password" : "Submit"}
                        </Button>
                    </div>
                </DialogContent>
            </MenuDialog>

            <Header>
                <SoundBar opened />

                {/*TODO: Add own name plate here*/}

                <OnlineUsers
                    type="button"
                    onClick={handleOnlineUsersClick}
                    aria-haspopup="true"
                    aria-expanded={!!onlineUsersAnchor}
                >
                    {isAlreadyOpenedInOtherTab && <WarningIcon fontSize={"large"} color={"warning"} />}
                    {[0, 3].includes(websocket.readyState) && <OfflineIcon fontSize={"large"} color={"error"} />}
                    <PopulationIcon sx={{ color: "whitesmoke", opacity: 0.8 }} fontSize={"large"} />
                    <span style={{ color: "whitesmoke", opacity: 0.8, lineHeight: 1 }}>{userCount}</span>
                </OnlineUsers>
                <Popover
                    open={!!onlineUsersAnchor}
                    anchorEl={onlineUsersAnchor}
                    onClose={() => {
                        setOnlineUsersAnchor(null);
                        setIsPlayerSearchOpen(false);
                        setPlayerSearch("");
                        setDebouncedPlayerSearch("");
                    }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 220,
                                maxHeight: 320,
                                background: "#111",
                                border: "1px solid rgba(124, 124, 118, 0.45)",
                                color: "ghostwhite",
                            },
                        },
                    }}
                >
                    <LobbyPlayerList aria-label="Players Online">
                        <LobbyPlayerListHeading>
                            <span>Players Online</span>
                            <IconButton
                                size="small"
                                color="inherit"
                                aria-label={isPlayerSearchOpen ? "Close player search" : "Search players"}
                                aria-expanded={isPlayerSearchOpen}
                                onClick={() => {
                                    setIsPlayerSearchOpen((open) => !open);
                                    if (isPlayerSearchOpen) {
                                        setPlayerSearch("");
                                        setDebouncedPlayerSearch("");
                                    }
                                }}
                            >
                                <SearchIcon fontSize="small" />
                            </IconButton>
                            {isPlayerSearchOpen && (
                                <PlayerSearchInput
                                    autoFocus
                                    fullWidth
                                    value={playerSearch}
                                    placeholder="Search username"
                                    inputProps={{ "aria-label": "Search username" }}
                                    onChange={(event) => setPlayerSearch(event.target.value)}
                                />
                            )}
                        </LobbyPlayerListHeading>
                        {filteredLobbyPlayers.length ? (
                            filteredLobbyPlayers.map((player) => (
                                <LobbyPlayerListItem key={player.name}>
                                    <PlayerIdentity>
                                        <span>{player.name}</span>
                                        <PlayerStatus>{player.status}</PlayerStatus>
                                    </PlayerIdentity>
                                    {player.name !== user && (
                                        <PlayerInviteButton
                                            type="button"
                                            pending={pendingGameInvites.has(player.name)}
                                            disabled={isInviteCoolingDown(player.name)}
                                            onClick={() => handlePlayerInvite(player.name)}
                                        >
                                            {pendingGameInvites.has(player.name)
                                                ? "cancel invite"
                                                : isInviteCoolingDown(player.name)
                                                  ? `invite in ${getInviteCooldownSeconds(player.name)}s`
                                                  : "invite to play"}
                                        </PlayerInviteButton>
                                    )}
                                </LobbyPlayerListItem>
                            ))
                        ) : (
                            <LobbyPlayerListItem>
                                {lobbyPlayers.length ? "No matching players" : "No players online"}
                            </LobbyPlayerListItem>
                        )}
                    </LobbyPlayerList>
                </Popover>

                <HeaderActions>
                    {!isFetchingIsAdmin && isAdmin && (
                        <ButtonCard
                            style={{
                                width: "fit-content",
                                height: "38px",
                                padding: "0 1px 1px 6px",
                                fontSize: "22px",
                                fontFamily: "Pixel Digivolve, sans-serif",
                            }}
                            onClick={() => {
                                navigate("/administration");
                                setJoinedRoom(null);
                            }}
                            className={"button"}
                        >
                            <span>ADMIN⚙️</span>
                        </ButtonCard>
                    )}
                    <NotificationBell notifications={notifications} />
                    <LogoutButton />
                </HeaderActions>
            </Header>

            <ContentDiv>
                <LeftColumn>
                    <ListCard>
                        <Tile>
                            <CardTitle style={{ marginBottom: 0 }}>{joinedRoom?.name ?? "Room"}</CardTitle>
                            <CardTitle style={{ color: "var(--lobby-accent)" }}>{joinedRoom ? "" : "Host"}</CardTitle>
                            <CardTitle style={{ gridColumn: "span 2" }}>{joinedRoom ? "" : "Settings"}</CardTitle>
                            {isRejoinable ? (
                                <Button onClick={handleReturnToGame}>RETURN TO GAME</Button>
                            ) : joinedRoom ? (
                                user === joinedRoom.hostName ? (
                                    <Button disabled={startGameDisabled} onClick={handleStartGame}>
                                        START GAME
                                    </Button>
                                ) : (
                                    <QuickPlayButton
                                        // Todo: incorporate restriction check to disabled
                                        disabled={
                                            activeDeckReadyState === DeckReadySate.NOT_FULL ||
                                            (joinedRoom.restrictionsApplied &&
                                                activeDeckReadyState === DeckReadySate.VIOLATES_RESTRICTIONS)
                                        }
                                        isSearchingGame={!!meInRoom?.ready}
                                        onClick={handleToggleReady}
                                    >
                                        READY
                                    </QuickPlayButton>
                                )
                            ) : (
                                <QuickPlayButton
                                    disabled={isLoading || activeDeckReadyState === DeckReadySate.NOT_FULL}
                                    onClick={handleQuickPlay}
                                    isSearchingGame={isSearchingGame}
                                >
                                    {isSearchingGame ? "Finding Opponent..." : "Quick Play"} 👤{userCountQuickPlay}
                                </QuickPlayButton>
                            )}
                        </Tile>
                        <ScrollArea>
                            {joinedRoom ? (
                                <RoomList>
                                    {joinedRoom.players.map((player) => {
                                        const me = player.name === user;
                                        const host = player.name === joinedRoom.hostName;
                                        const amIHost = user === joinedRoom.hostName;

                                        return (
                                            <Tile key={player.name}>
                                                {/*TODO: Replace name and avatar by name plates later*/}
                                                <img
                                                    alt={player.name + "img"}
                                                    width={96}
                                                    height={96}
                                                    style={{ transform: "scaleX(-1)" }}
                                                    src={profilePicture(player.avatarName)}
                                                />

                                                <StyledSpan>{player.name}</StyledSpan>

                                                {host ? (
                                                    <img
                                                        alt={"HOST"}
                                                        width={36}
                                                        src={crownSrc}
                                                        style={{ justifySelf: "center", gridColumn: "span 2" }}
                                                    />
                                                ) : (
                                                    <StyledChip
                                                        ready={player.ready}
                                                        style={{ justifySelf: "center", gridColumn: "span 2" }}
                                                    >
                                                        {player.ready ? "READY" : "NOT READY"}
                                                    </StyledChip>
                                                )}

                                                {me && (
                                                    <Button disabled={isLoading} onClick={handleLeaveRoom}>
                                                        LEAVE
                                                    </Button>
                                                )}
                                                {!me && amIHost && (
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={() => handleKickPlayer(player.name)}
                                                    >
                                                        KICK
                                                    </Button>
                                                )}
                                            </Tile>
                                        );
                                    })}
                                </RoomList>
                            ) : (
                                <RoomList>
                                    {rooms
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((room) => (
                                            <RoomTile key={room.id}>
                                                <StyledSpan>{room.name}</StyledSpan>
                                                <StyledSpan>
                                                    <span>{room.hostName}</span>
                                                    <img
                                                        alt={"Host: "}
                                                        width={24}
                                                        height={24}
                                                        src={profilePicture(
                                                            room.players.find((p) => p.name === room.hostName)
                                                                ?.avatarName || ""
                                                        )}
                                                        style={{ marginLeft: "4px", transform: "translateY(-3px)" }}
                                                    />
                                                </StyledSpan>
                                                {room.restrictionsApplied ? <RestrictionsAppliedIcon /> : <div />}
                                                {room.hasPassword ? <PrivateIcon /> : <div />}
                                                <Button disabled={isLoading} onClick={() => handleJoinRoom(room.id)}>
                                                    Join
                                                </Button>
                                            </RoomTile>
                                        ))}
                                </RoomList>
                            )}
                        </ScrollArea>
                    </ListCard>

                    <div
                        style={{
                            display: "flex",
                            maxHeight: "100%",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "32px",
                        }}
                    >
                        {!joinedRoom && (
                            <MenuButtonContainerDiv>
                                <ButtonCard
                                    className={"button"}
                                    onClick={() => {
                                        navigate("/decks");
                                        setJoinedRoom(null);
                                    }}
                                >
                                    <DeckIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Decks</span>
                                </ButtonCard>
                                <ButtonCard
                                    className={"button"}
                                    onClick={() => {
                                        navigate("/test");
                                        setJoinedRoom(null);
                                    }}
                                >
                                    <TestIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Test </span>
                                </ButtonCard>
                                <ButtonCard
                                    className={"button"}
                                    onClick={() => {
                                        navigate("/profile");
                                        setJoinedRoom(null);
                                    }}
                                >
                                    <ProfileIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Profile</span>
                                </ButtonCard>
                            </MenuButtonContainerDiv>
                        )}

                        <Card style={isMobile ? { order: 99, width: "100%" } : {}}>
                            <Select
                                value={activeDeckId}
                                onChange={handleDeckChange}
                                disabled={(!!meInRoom?.ready && joinedRoom?.hostName !== user) || isSearchingGame}
                            >
                                {decks.map((deck) => (
                                    <option value={deck.id} key={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </Select>
                            {!!deckObject?.mainDeckList?.length && (
                                <DeckPanel deck={deckObject} lobbyView inRoom={!!joinedRoom} />
                            )}
                        </Card>

                        {!joinedRoom && (
                            <Card
                                style={{
                                    minWidth: 300,
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                {/*<CardTitle>Room Setup</CardTitle>*/}
                                <Input
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="New room name"
                                    style={{ marginBottom: "1rem", width: "calc(100% - 24px)", maxHeight: "1.25rem" }}
                                />
                                <Input
                                    value={newRoomPassword}
                                    onChange={(e) => setNewRoomPassword(e.target.value)}
                                    placeholder="Password (optional)"
                                    style={{ marginBottom: "1rem", width: "calc(100% - 24px)", maxHeight: "1.25rem" }}
                                />
                                <FormControlLabel
                                    disabled
                                    className={"button"}
                                    checked={restrictionsApplied}
                                    onClick={() => setRestrictionsApplied(!restrictionsApplied)}
                                    control={<Checkbox />}
                                    sx={{
                                        "& .MuiButtonBase-root": { color: "rgba(56, 111, 240, 0.75)!important" },
                                        width: "100%",
                                        paddingLeft: "10px",
                                        transform: "translateY(-6px)",
                                    }}
                                    label={
                                        <span style={{ color: "antiquewhite" }}>
                                            Decks must follow the{" "}
                                            <a
                                                href={"https://world.digimoncard.com/rule/restriction_card/"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                current restrictions
                                            </a>
                                        </span>
                                    }
                                />
                                <Button
                                    disabled={!newRoomName || isLoading}
                                    onClick={handleCreateRoom}
                                    style={{ width: "250px", height: "36px", marginTop: "auto" }}
                                >
                                    Create Room
                                </Button>
                            </Card>
                        )}
                    </div>
                </LeftColumn>

                <Chat
                    sendMessage={websocket.sendMessage}
                    messages={joinedRoom ? privateMessages : messages}
                    roomId={joinedRoom?.id}
                />
            </ContentDiv>
            <PatchnotesLink />
            <ChatContextMenu
                isAdmin={!!isAdmin}
                sendMessage={websocket.sendMessage}
                onInviteSent={handleInviteSent}
                onInviteCancelled={handleInviteCancelled}
                pendingGameInvites={pendingGameInvites}
                inviteCooldownPlayers={inviteCooldownPlayers}
            />
        </MenuBackgroundWrapper>
    );
}

const Header = styled.header`
    width: calc(100% - 32px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 16px;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const ContentDiv = styled.div`
    width: calc(100% - 32px);,
    max-width: calc(100vw - 32px);
    height: calc(100vh - 128px);
    max-height: calc(100vh - 128px);
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    
    @media (max-width: 600px) and (orientation: portrait) {
        max-height: unset;
        height: fit-content;
    }
    @media (max-width: 800px) and (orientation: landscape) {
        max-height: unset;
        height: fit-content;
    }
`;

const OnlineUsers = styled.button`
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: ghostwhite;
    font-size: 28px;
    font-family:
        League Spartan,
        sans-serif;

    &:hover,
    &:focus-visible {
        border-color: rgba(255, 255, 255, 0.35);
        background: rgba(255, 255, 255, 0.06);
        outline: none;
    }
`;

const LobbyPlayerList = styled.ul`
    min-width: 220px;
    margin: 0;
    padding: 8px 0;
    list-style: none;
    font-family: "League Spartan", sans-serif;
`;

const LobbyPlayerListHeading = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 16px 10px;
    border-bottom: 1px solid rgba(124, 124, 118, 0.3);
    color: var(--lobby-accent);
    font-size: 19px;
`;

const PlayerSearchInput = styled(InputBase)`
    flex-basis: 100%;
    margin-top: 6px;
    padding: 2px 8px;
    border: 1px solid rgba(124, 124, 118, 0.5);
    border-radius: 3px;
    color: ghostwhite;
    font-size: 15px;

    &.Mui-focused {
        border-color: var(--lobby-accent);
    }
`;

const LobbyPlayerListItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 16px;
    color: ghostwhite;
    font-size: 17px;
`;

const PlayerIdentity = styled.span`
    min-width: 0;
`;

const PlayerStatus = styled.span`
    display: block;
    margin-right: 6px;
    color: rgba(255, 239, 213, 0.62);
    font-family: "Cousine", monospace;
    font-size: 0.6em;
    white-space: nowrap;
`;

const PlayerInviteButton = styled.button<{ pending: boolean }>`
    flex-shrink: 0;
    padding: 5px 8px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 3px;
    background: var(${({ pending }) => (pending ? "--orange-button-bg" : "--blue-button-bg")});
    color: ghostwhite;
    font: 600 12px/1 "League Spartan", sans-serif;
    text-transform: uppercase;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background: var(${({ pending }) => (pending ? "--orange-button-bg-hover" : "--blue-button-bg-hover")});
        outline: none;
    }

    &:active {
        background: var(${({ pending }) => (pending ? "--orange-button-bg-active" : "--blue-button-bg-active")});
    }

    &:disabled {
        filter: grayscale(0.65);
        opacity: 0.65;
        cursor: not-allowed;
    }
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex: 1;
    height: 100%;
`;

const Card = styled.div`
    padding: 1rem;

    position: relative;
    color: ghostwhite;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
`;

const ButtonCard = styled.div`
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));

    height: 65px;
    width: 275px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;

    & > * {
        opacity: 0.75;
        color: ghostwhite;
    }

    &:hover {
        & > * {
            opacity: 0.9;
            color: var(--blue);
        }
    }

    &:active {
        & > * {
            opacity: 1;
            color: var(--lobby-accent);
        }
    }
`;

const CardTitle = styled.span`
    font-family: "League Spartan", sans-serif;
    width: fit-content;

    color: var(--lobby-accent);
    font-size: 28px;
    line-height: 1;
    font-weight: 300;
    border-bottom: 1px solid transparent;
    border-image: linear-gradient(
            to right,
            transparent 0%,
            transparent 10%,
            var(--lobby-accent) 50%,
            transparent 90%,
            transparent 100%
        )
        1;
`;

const ScrollArea = styled.div`
    max-height: 95.75%;
    overflow-y: auto;

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom right,
            rgba(63, 109, 207, 0.75) 0%,
            rgba(48, 95, 217, 0.75) 50%,
            rgba(84, 126, 215, 0.75) 100%
        );
        border-radius: 5px;
        box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            inset 0 -1px 3px rgba(0, 0, 0, 0.9);
    }

    @media (max-width: 600px) {
        max-height: 350px;
    }
`;

const RoomList = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const Input = styled.input<{ error?: boolean }>`
    flex-grow: 1;
    padding: 0.5rem;
    border: 1px solid ${({ error }) => (error ? "crimson" : "rgba(48, 95, 217, 0.7)")};
    border-radius: 3px;
    background-color: #0c0c0c;
    color: ghostwhite;
    font-family: "Cousine", monospace;

    &:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(48, 95, 217, 0.7);
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.5rem;
    border: 1px solid rgba(48, 95, 217, 0.7);
    border-radius: 3px;
    background-color: #0c0c0c;
    color: ghostwhite;
    font-family: "League Spartan", sans-serif;
    font-size: 16px;
    margin-bottom: 1rem;

    &:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(48, 95, 217, 0.7);
    }
`;

const QuickPlayButton = styled(Button)<{ isSearchingGame: boolean }>`
    height: 36px;
    margin-right: 8px;
    background: var(${({ isSearchingGame }) => (isSearchingGame ? "--orange-button-bg" : "--blue-button-bg")});

    &:hover {
        background: var(
            ${({ isSearchingGame }) => (isSearchingGame ? "--orange-button-bg-hover" : "--blue-button-bg-hover")}
        );
    }

    &:active {
        background: var(
            ${({ isSearchingGame }) => (isSearchingGame ? "--orange-button-bg-active" : "--blue-button-bg-active")}
        );
    }

    @media (max-width: 499px) {
        margin-right: unset;
    }
`;

const StyledChip = styled.div<{ ready: boolean }>`
    width: 100px;
    border-radius: 5px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem 0 0.5rem;
    letter-spacing: 1px;
    color: ghostwhite;
    text-shadow: 0 0 3px black;

    background: ${({ ready }) => (ready ? "rgb(53,197,147)" : "rgb(192,42,42)")};
    filter: drop-shadow(
        ${({ ready }) => (ready ? "0 0 5px " + "rgba(61,227,169,0.6)" : "0 0 5px " + "rgba(236,54,54,0.6)")}
    );
`;

const StyledSpan = styled.span`
    font-size: 24px;
    font-family: "League Spartan", sans-serif;
    color: ghostwhite;
    display: flex;
    align-items: center;
`;

const ListCard = styled(Card)`
    flex: 1;
    min-width: 350px;
    max-height: calc(100% - 316px);

    @media (max-width: 600px) and (orientation: portrait), (max-height: 499px) {
        max-height: 400px;
        min-height: 200px;
        max-width: calc(100vw - 32px);
        min-width: unset;
    }
    @media (max-width: 800px) and (orientation: landscape) {
        max-height: 500px;
        max-width: calc(100vw - 32px);
        min-width: unset;
    }
`;

const MenuButtonContainerDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    @media (max-width: 499px) {
        gap: 16px;
        order: 100;
        width: 100%;
        align-items: center;
        div {
            margin-top: 1px;
        }
    }
`;

const Tile = styled.div`
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 2fr 2fr 0.5fr 0.5fr 250px;
    align-items: center;
    transition: background-color 0.3s ease;
    padding-left: 4px;

    @media (max-width: 600px) and (orientation: portrait), (max-height: 499px) {
    }
    @media (max-width: 800px) and (orientation: landscape) {
        grid-template-columns: 2fr 2fr 0.5fr 0.5fr 200px;
    }
`;

const RoomTile = styled(Tile)`
    border: 1px solid transparent;
    background-color: rgba(0, 68, 192, 0.1);

    &:hover {
        background-color: rgba(218, 51, 187, 0.1);
    }
`;
