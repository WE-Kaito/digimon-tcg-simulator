import styled from "@emotion/styled";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
    PeopleAlt as PopulationIcon,
    HttpsOutlined as PrivateIcon,
    WifiOffRounded as OfflineIcon,
    ErrorRounded as WarningIcon,
} from "@mui/icons-material";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import useWebSocket from "react-use-websocket";
import { notifyWarning } from "../utils/toasts.ts";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { useSound } from "../hooks/useSound.ts";
import { useNavigate } from "react-router-dom";
import SoundBar from "../components/SoundBar.tsx";
import { DeckType } from "../utils/types.ts";
import ProfileDeck from "../components/profile/ProfileDeck.tsx";
import axios from "axios";
import MenuDialog from "../components/MenuDialog.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import Chat from "../components/lobby/Chat.tsx";
import { profilePicture } from "../utils/avatars.ts";
import { Dialog, DialogContent, useMediaQuery } from "@mui/material";
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

enum Format {
    CUSTOM = "CUSTOM",
    JP = "JP",
    EN = "EN",
}

type LobbyPlayer = {
    name: string;
    avatarName: string;
    ready: boolean;
};

type Room = {
    id: string;
    name: string;
    hostName: string;
    hasPassword: boolean;
    format: Format;
    players: LobbyPlayer[];
};

export default function Lobby() {
    const currentPort = window.location.port;
    const currentUrl = window.location.origin.replace('https://','');
    //TODO: using www.project-drasil.online as the domain is not working, need a fix
    const websocketURL =
        currentPort === "5173" ? "ws://192.168.0.26:8080/api/ws/lobby" : "wss://" + currentUrl + "/api/ws/lobby";

    const user = useGeneralStates((state) => state.user);
    const setActiveDeck = useGeneralStates((state) => state.setActiveDeck);
    const activeDeckId = useGeneralStates((state) => state.activeDeckId);
    const getActiveDeck = useGeneralStates((state) => state.getActiveDeck);

    const setIsRematch = useGameUIStates((state) => state.setIsRematch);

    const decks = useDeckStates((state) => state.decks);

    const gameId = useGameBoardStates((state) => state.gameId);
    const setGameId = useGameBoardStates((state) => state.setGameId);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);
    const setIsReconnecting = useGameBoardStates((state) => state.setIsReconnecting);

    const playJoinSfx = useSound((state) => state.playJoinSfx);
    const playKickSfx = useSound((state) => state.playKickSfx);
    const playCountdownSfx = useSound((state) => state.playCountdownSfx);

    const [isAlreadyOpenedInOtherTab, setIsAlreadyOpenedInOtherTab] = useState<boolean>(false);

    const [userCount, setUserCount] = useState<number>(0);
    const [userCountQuickPlay, setUserCountQuickPlay] = useState<number>(0);
    const [isRejoinable, setIsRejoinable] = useState<boolean>(false);
    const [noActiveDeck, setNoActiveDeck] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [deckObject, setDeckObject] = useState<DeckType | null>(null);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);

    const [messages, setMessages] = useState<string[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    const [newRoomName, setNewRoomName] = useState<string>("");
    const [newRoomPassword, setNewRoomPassword] = useState<string>("");
    const [newRoomFormat, setNewRoomFormat] = useState<Format>(Format.CUSTOM);

    const [roomToJoinId, setRoomToJoinId] = useState<string>(""); // for password protected rooms
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [isWrongPassword, setIsWrongPassword] = useState<boolean>(false);

    const [joinedRoom, setJoinedRoom] = useState<Room | null>(null);

    const [isSearchingGame, setIsSearchingGame] = useState<boolean>(false);

    const [showCountdown, setShowCountdown] = useState<boolean>(false);

    const navigate = useNavigate();

    function handleReconnect() {
        setIsOpponentOnline(true);
        setIsLoading(false);
        navigate("/game");
    }

    function setIsLoadingWithDebounce() {
        setIsLoading(true);

        const timer = setTimeout(() => setIsLoading(false), 5000); // reset loading state after 5 seconds
        return () => clearTimeout(timer);
    }

    const websocket = useWebSocket(websocketURL, {
        shouldReconnect: () => true,

        onMessage: (event) => {
            if (event.data === "[SUCCESS]") {
                setIsLoading(false);
            }

            if (event.data === "[NO_ACTIVE_DECK]") {
                notifyWarning("No active deck not found! Please refresh if this error should not appear.");
                setNoActiveDeck(true);
                setIsLoadingWithDebounce();
            }

            if (event.data === "[BROKEN_DECK]") {
                notifyWarning("Cards in your deck could not be found!");
                setNoActiveDeck(true);
                setIsLoadingWithDebounce();
            }

            if (event.data.startsWith("[USER_COUNT]:")) {
                setUserCount(parseInt(event.data.substring("[USER_COUNT]:".length)));
            }

            if (event.data.startsWith("[USER_COUNT_QUICK_PLAY]:")) {
                setUserCountQuickPlay(parseInt(event.data.substring("[USER_COUNT_QUICK_PLAY]:".length)));
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
                setNewRoomFormat(Format.CUSTOM);
            }

            if (event.data.startsWith("[ROOM_UPDATE]:")) {
                setJoinedRoom(JSON.parse(event.data.substring("[ROOM_UPDATE]:".length)));
            }

            if (event.data === "[LEAVE_ROOM]") {
                setJoinedRoom(null);
                setIsLoading(false);
                playJoinSfx(); // new sound?
            }

            if (event.data === "[KICKED]") {
                setJoinedRoom(null);
                playKickSfx();
            }

            if (event.data === "[PLAYER_JOINED]") {
                playJoinSfx();
            }

            if (event.data === "[WRONG_PASSWORD]") {
                setIsLoading(false);
                setIsWrongPassword(true);
            }

            if (event.data.startsWith("[START_GAME]:")) {
                localStorage.setItem("isReported", JSON.stringify(false)); // see ReportButton.tsx
                localStorage.removeItem("boardStore");
                const gameId = event.data.substring("[START_GAME]:".length);
                startGameSequence(gameId);
            }

            if (event.data.startsWith("[RECONNECT_ENABLED]:")) {
                const matchingRoomId = event.data.substring("[RECONNECT_ENABLED]:".length);
                setIsRejoinable(matchingRoomId === gameId);
                // gameId could be set to older matching room id here, but not sure if this makes sense
            }

            if (event.data === "[RECONNECT_DISABLED]") {
                setIsRejoinable(false);
            }

            if (event.data === "[SESSION_ALREADY_CONNECTED]") {
                setIsAlreadyOpenedInOtherTab(true);
            }

            if (event.data.startsWith("[CHAT_MESSAGE]:") && !joinedRoom) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
            }

            if (event.data.startsWith("[CHAT_MESSAGE_ROOM]:")) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
            }
        },
    });

    function handleOnCloseSetImageDialog() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }

    function handleDeckChange(event: ChangeEvent<HTMLSelectElement>) {
        setActiveDeck(String(event.target.value)); // TODO: check if backend checks validity on each change:
        if (noActiveDeck) {
            setNoActiveDeck(false);
            setIsLoading(false);
        }
    }

    function handleCreateRoom() {
        setIsLoadingWithDebounce();
        cancelQuickPlayQueue();
        websocket.sendMessage("/createRoom:" + newRoomName + ":" + newRoomPassword + ":" + newRoomFormat);
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
            setIsReconnecting(false);
            clearBoard();
            setIsLoading(false);
            navigate("/game");
        }, 3150);
        return () => clearTimeout(timer);
    }

    function cancelQuickPlayQueue() {
        setIsSearchingGame(false);
        websocket.sendMessage("/cancelQuickPlay");
    }

    function handleQuickPlay() {
        if (isSearchingGame) {
            cancelQuickPlayQueue();
        } else {
            setIsSearchingGame(true);
            websocket.sendMessage("/quickPlay");
        }
    }

    const initialFetch = useCallback(() => {
        getActiveDeck();
    }, [getActiveDeck]);
    useEffect(() => initialFetch(), [initialFetch]);

    useEffect(() => {
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }, [activeDeckId]);

    useEffect(() => {
        if (websocket.readyState !== 1) return;
        // manual heartbeat because the built in heartbeat is not working; activity check in backend every 15 seconds
        const heartbeatInterval = setInterval(() => websocket.sendMessage("/heartbeat/"), 5000);
        return () => clearInterval(heartbeatInterval);
    }, [websocket.readyState, websocket.sendMessage]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (joinedRoom) websocket.sendMessage("/leave:" + joinedRoom.id + ":" + user + ":false");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [joinedRoom, user, websocket]);

    const meInRoom = joinedRoom?.players.find((p) => p.name === user);
    const startGameDisabled =
        !!joinedRoom && (isLoading || !!joinedRoom.players.find((p) => !p.ready) || joinedRoom.players.length < 2);

    const isMobile = useMediaQuery("(max-width:499px)");

    return (
        <MenuBackgroundWrapper>
            <MenuDialog
                onClose={handleOnCloseSetImageDialog}
                open={sleeveSelectionOpen}
                PaperProps={{ sx: { overflow: "hidden" } }}
            >
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Sleeve"} />
                <ChooseCardSleeve />
            </MenuDialog>

            <MenuDialog onClose={handleOnCloseSetImageDialog} open={imageSelectionOpen}>
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Image"} />
                <ChooseDeckImage />
            </MenuDialog>

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

                {isRejoinable && <Button onClick={handleReconnect}>RECONNECT</Button>}

                <OnlineUsers>
                    {isAlreadyOpenedInOtherTab && <WarningIcon fontSize={"large"} color={"warning"} />}
                    {[0, 3].includes(websocket.readyState) && <OfflineIcon fontSize={"large"} color={"error"} />}
                    <PopulationIcon sx={{ color: "whitesmoke", opacity: 0.8 }} fontSize={"large"} />
                    <span style={{ color: "whitesmoke", opacity: 0.8, lineHeight: 1 }}>{userCount}</span>
                </OnlineUsers>

                <LogoutButton />
            </Header>

            <ContentDiv>
                <LeftColumn>
                    <ListCard>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                            }}
                        >
                            <CardTitle style={{ marginBottom: 0 }}>{joinedRoom?.name ?? "Rooms"}</CardTitle>
                            {joinedRoom ? (
                                user === joinedRoom.hostName ? (
                                    <Button disabled={startGameDisabled} onClick={handleStartGame}>
                                        START GAME
                                    </Button>
                                ) : (
                                    <QuickPlayButton isSearchingGame={!!meInRoom?.ready} onClick={handleToggleReady}>
                                        READY
                                    </QuickPlayButton>
                                )
                            ) : (
                                <QuickPlayButton
                                    disabled={isLoading}
                                    onClick={handleQuickPlay}
                                    isSearchingGame={isSearchingGame}
                                >
                                    {isSearchingGame ? "Finding Opponent..." : "Quick Play"} 👤{userCountQuickPlay}
                                </QuickPlayButton>
                            )}
                        </div>
                        <ScrollArea>
                            {joinedRoom ? (
                                <RoomList>
                                    {joinedRoom.players.map((player) => {
                                        const me = player.name === user;
                                        const host = player.name === joinedRoom.hostName;
                                        const amIHost = user === joinedRoom.hostName;

                                        return (
                                            <RoomItemLobby key={player.name}>
                                                <StyledSpan>{player.name}</StyledSpan>

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
                                                {!me && !amIHost && (
                                                    <div style={{ width: 250, height: 1, opacity: 0 }} />
                                                )}

                                                {host ? (
                                                    <img
                                                        alt={"HOST"}
                                                        width={48}
                                                        src={crownSrc}
                                                        style={{ justifySelf: "center" }}
                                                    />
                                                ) : (
                                                    <StyledChip ready={player.ready}>
                                                        {player.ready ? "READY" : "NOT READY"}
                                                    </StyledChip>
                                                )}

                                                {/*TODO: Replace name and avatar by name plates later*/}
                                                <img
                                                    alt={player.name + "img"}
                                                    width={96}
                                                    height={96}
                                                    style={{ justifySelf: "flex-end" }}
                                                    src={profilePicture(player.avatarName)}
                                                />
                                            </RoomItemLobby>
                                        );
                                    })}
                                </RoomList>
                            ) : (
                                <RoomList>
                                    {rooms
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((room) => (
                                            <RoomItemLobby key={room.id}>
                                                <StyledSpan>{room.name}</StyledSpan>
                                                <StyledSpan style={{ display: "flex", alignItems: "center" }}>
                                                    <img
                                                        alt={"Host: "}
                                                        width={16}
                                                        src={crownSrc}
                                                        style={{ marginRight: "4px", transform: "translateY(-1px)" }}
                                                    />
                                                    <span>{room.hostName}</span>
                                                    <img
                                                        alt={"Host: "}
                                                        width={24}
                                                        src={profilePicture(
                                                            room.players.find((p) => p.name === room.hostName)
                                                                ?.avatarName || ""
                                                        )}
                                                        style={{ marginLeft: "4px", transform: "translateY(-3px)" }}
                                                    />
                                                </StyledSpan>
                                                {room.hasPassword && <PrivateIcon />}
                                                <Button disabled={isLoading} onClick={() => handleJoinRoom(room.id)}>
                                                    Join
                                                </Button>
                                            </RoomItemLobby>
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
                                <ButtonCard className={"button"} onClick={() => navigate("/decks")}>
                                    <DeckIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Decks</span>
                                </ButtonCard>
                                <ButtonCard className={"button"} onClick={() => navigate("/test")}>
                                    <TestIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Test </span>
                                </ButtonCard>
                                <ButtonCard className={"button"} onClick={() => navigate("/profile")}>
                                    <ProfileIcon style={{ fontSize: 50 }} />
                                    <span style={{ fontFamily: "Naston, sans-serif", fontSize: 40 }}>Profile</span>
                                </ButtonCard>
                            </MenuButtonContainerDiv>
                        )}

                        <Card style={isMobile ? { order: 99, width: "100%" } : {}}>
                            {/*<CardTitle>Deck Selection</CardTitle>*/}
                            <Select value={activeDeckId} onChange={handleDeckChange}>
                                {decks.map((deck) => (
                                    <option value={deck.id} key={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </Select>
                            {!!deckObject?.decklist?.length && (
                                <ProfileDeck
                                    deck={deckObject}
                                    lobbyView
                                    setSleeveSelectionOpen={setSleeveSelectionOpen}
                                    setImageSelectionOpen={setImageSelectionOpen}
                                />
                            )}
                        </Card>

                        {!joinedRoom && (
                            <Card style={{ minWidth: 300, flex: 1 }}>
                                {/*<CardTitle>Room Setup</CardTitle>*/}
                                <Input
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="Room name"
                                    style={{ marginBottom: "1rem", width: "95%" }}
                                />
                                <Input
                                    value={newRoomPassword}
                                    onChange={(e) => setNewRoomPassword(e.target.value)}
                                    placeholder="Password (optional)"
                                    style={{ marginBottom: "1rem", width: "95%" }}
                                />
                                {/*TODO: enable when format enforcement can be implemented */}
                                {/*<Select value={newRoomFormat} disabled onChange={(e) => setNewRoomFormat(e.target.value as Format)}>*/}
                                {/*    {Object.values(Format).map((format) => <option value={format}*/}
                                {/*                                                   key={format}>{format}</option>)}*/}
                                {/*</Select>*/}
                                <Button
                                    disabled={!newRoomName || isLoading}
                                    onClick={handleCreateRoom}
                                    style={{ width: "250px", height: "36px" }}
                                >
                                    Create Room
                                </Button>
                            </Card>
                        )}
                    </div>
                </LeftColumn>

                <Chat sendMessage={websocket.sendMessage} messages={messages} roomId={joinedRoom?.id} />
            </ContentDiv>
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

const OnlineUsers = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    color: ghostwhite;
    font-size: 28px;
    font-family:
        League Spartan,
        sans-serif;
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

// const DisabledButtonCard = styled(ButtonCard)`
//     & > * {
//         opacity: 0.35;
//         color: #646262;
//     }
//
//     &:hover {
//         & > * {
//             opacity: 0.35;
//             color: darkgrey;
//         }
//     }
//
//     &:active {
//         & > * {
//             opacity: 0.35;
//             color: darkgrey;
//         }
//     }
// `;

const CardTitle = styled.span`
    font-family: "League Spartan", sans-serif;
    width: fit-content;

    color: var(--lobby-accent);
    font-size: 32px;
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
    margin-bottom: auto;
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

const RoomItem = styled.li`
    width: calc(100% - 1rem);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid var(--lobby-accent);
    transition: background-color 0.3s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: rgba(218, 51, 187, 0.1);
    }
`;

const RoomItemLobby = styled(RoomItem)`
    width: unset;
    display: flex;
    grid-template-columns: unset;
    justify-content: space-between;
    flex-wrap: wrap;
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
    text-shadow: 0 0 5px var(--christmas-green-shadow);
    justify-self: flex-start;
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
