import styled from "@emotion/styled";
import {ChangeEvent, useCallback, useEffect, useState} from "react";
import {PeopleAlt as PopulationIcon, HttpsOutlined as PrivateIcon} from '@mui/icons-material';
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import {useGeneralStates} from "../hooks/useGeneralStates.ts";
import useWebSocket from "react-use-websocket";
import {notifyBrokenDeck, notifyNoActiveDeck} from "../utils/toasts.ts";
import {useGameBoardStates} from "../hooks/useGameBoardStates.ts";
import {useSound} from "../hooks/useSound.ts";
import {useNavigate} from "react-router-dom";
import SoundBar from "../components/SoundBar.tsx";
import BackButton from "../components/BackButton.tsx";
import {DeckType} from "../utils/types.ts";
import ProfileDeck from "../components/profile/ProfileDeck.tsx";
import axios from "axios";
import MenuDialog from "../components/MenuDialog.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import Chat from "../components/lobby/Chat.tsx";
import {profilePicture} from "../utils/avatars.ts";
import {Chip, Dialog, DialogContent} from "@mui/material";
import {grey, teal} from "@mui/material/colors";
import crownSrc from "../assets/crown.webp";
import countdownAnimation from "../assets/lotties/countdown.json";
import Lottie from "lottie-react";

enum Format {
    CUSTOM = "CUSTOM",
    JP = "JP",
    EN = "EN",
}

type LobbyPlayer = {
    name: string;
    avatarName: string;
    ready: boolean;
}

type Room = {
    id: string;
    name: string;
    hostName: string;
    hasPassword: boolean;
    format: Format;
    players: LobbyPlayer[];
}

export default function Lobby() {
    const currentPort = window.location.port;
    //TODO: using www.project-drasil.online as the domain is not working, need a fix
    const websocketURL = currentPort === "5173" ? "ws://192.168.0.4:8080/api/ws/lobby" : "wss://project-drasil.online/api/ws/lobby";

    const user = useGeneralStates((state) => state.user)
    const setActiveDeck = useGeneralStates(state => state.setActiveDeck);
    const activeDeckId = useGeneralStates(state => state.activeDeckId);
    const getActiveDeck = useGeneralStates(state => state.getActiveDeck);
    const fetchDecks = useGeneralStates(state => state.fetchDecks);
    const decks = useGeneralStates(state => state.decks);

    const gameId = useGameBoardStates((state) => state.gameId);
    const setGameId = useGameBoardStates((state) => state.setGameId);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);

    const playJoinSfx = useSound((state) => state.playJoinSfx);
    const playKickSfx = useSound((state) => state.playKickSfx);
    const playCountdownSfx = useSound((state) => state.playCountdownSfx);

    const [isAlreadyOpenedInOtherTab, setIsAlreadyOpenedInOtherTab] = useState<boolean>(false);

    const [userCount, setUserCount] = useState<number>(0);
    const [isRejoinable, setIsRejoinable] = useState<boolean>(false);
    const [noActiveDeck, setNoActiveDeck] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [deckObject, setDeckObject] = useState<DeckType | null>(null);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false)

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
    const navigateToGame = () => navigate("/game");

    function handleReconnect(){
        setIsOpponentOnline(true);
        setIsLoading(false);
        navigateToGame();
    }

    const websocket = useWebSocket(websocketURL, {
        heartbeat: { interval: 5000, message: "/heartbeat/" },
        shouldReconnect: () => true,

        onMessage: (event) => {
            if (event.data === "[SUCCESS]") {
                setIsLoading(false);
            }

            if (event.data === "[NO_ACTIVE_DECK]") {
                notifyNoActiveDeck();
                setNoActiveDeck(true);
                setIsLoading(true);
            }

            if (event.data === "[BROKEN_DECK]") {
                notifyBrokenDeck();
                setNoActiveDeck(true);
                setIsLoading(true);
            }

            if (event.data.startsWith("[USER_COUNT]:")) {
                setUserCount(parseInt(event.data.substring("[USER_COUNT]:".length)));
            }

            if (event.data.startsWith("[ROOMS]:")) {
                setRooms(JSON.parse(event.data.substring("[ROOMS]:".length)));
            }

            if (event.data === ("[PROMPT_PASSWORD]")) {
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
                const gameId = event.data.substring("[START_GAME]:".length);
                startGameSequence(gameId);
            }

            if (event.data.startsWith("[RECONNECT_ENABLED]:")) {
                const matchingRoomId = event.data.substring("[RECONNECT_ENABLED]:".length)
                setIsRejoinable(matchingRoomId === gameId);
                // gameId could be set to older matching room id here, but not sure if this makes sense
            }

            if (event.data === "[RECONNECT_DISABLED]") {
                setIsRejoinable(false);
            }

            if(event.data === "[SESSION_ALREADY_CONNECTED]"){
                setIsAlreadyOpenedInOtherTab(true);
            }

            if (event.data.startsWith("[CHAT_MESSAGE]:")) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
            }
        },
    });

    function handleOnCloseSetImageDialog() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }

    function handleDeckChange (event: ChangeEvent<HTMLSelectElement>) {
        setActiveDeck(String(event.target.value)) // TODO: check if backend checks validity on each change:
        if(noActiveDeck) {
            setNoActiveDeck(false);
            setIsLoading(false);
        }
    }

    function handleCreateRoom() {
        setIsLoading(true);
        cancelQuickPlayQueue();
        websocket.sendMessage("/createRoom:" + newRoomName + ":" + newRoomPassword + ":" + newRoomFormat);
    }

    function handleJoinRoom(roomId: string) {
        setIsLoading(true);
        cancelQuickPlayQueue();
        setPassword("");
        setRoomToJoinId(roomId);
        websocket.sendMessage("/joinRoom:" + roomId);
    }

    function handleJoinRoomWithPassword() {
        setIsLoading(true);
        websocket.sendMessage("/password:" + roomToJoinId + ":" + password);
    }

    function handleToggleReady() {
        setIsLoading(true);
        websocket.sendMessage("/toggleReady:" + joinedRoom?.id);
    }

    function handleLeaveRoom() {
        setIsLoading(true);
        websocket.sendMessage("/leave:" + joinedRoom?.id + ":" + user);
    }

    function handleKickPlayer(userName: string) {
        setIsLoading(true);
        websocket.sendMessage("/kick:" + joinedRoom?.id + ":" + userName);
        playKickSfx();
        console.log("Kicked " + userName);
    }

    function handleStartGame() {
        setIsLoading(true);
        cancelQuickPlayQueue();
        const newGameID = user + "‗" + joinedRoom?.players.find(p => p.name !== user)?.name;
        websocket.sendMessage("/startGame:" + joinedRoom?.id + ":" + newGameID);
    }

    function startGameSequence(gameId: string) {
        playCountdownSfx();
        setShowCountdown(true);
        const timer = setTimeout(() => {
            setGameId(gameId); // maybe use the lobby id (at least when displayName != accountName)?
            clearBoard();
            setIsLoading(false);
            navigateToGame();
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
        fetchDecks();
    }, [getActiveDeck, fetchDecks]);
    useEffect(() => initialFetch(), [initialFetch]);

    useEffect(() => {
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }, [activeDeckId]);

    const meInRoom = joinedRoom?.players.find(p => p.name === user);
    const startGameDisabled = !!joinedRoom && (isLoading || !!joinedRoom.players.find(p => !p.ready) || joinedRoom.players.length < 2);

    return (
        <MenuBackgroundWrapper>
            <MenuDialog onClose={handleOnCloseSetImageDialog} open={sleeveSelectionOpen} PaperProps={{sx: {overflow: "hidden"}}}>
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Sleeve"}/>
                <ChooseCardSleeve/>
            </MenuDialog>

            <MenuDialog onClose={handleOnCloseSetImageDialog} open={imageSelectionOpen}>
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Image"}/>
                <ChooseDeckImage/>
            </MenuDialog>

            {showCountdown &&
                <Dialog open={true} sx={{background: "rgba(8,8,8,0.5)"}} PaperProps={{ sx: {background: "none", overflow: "hidden", boxShadow: "none"} }}>
                    <Lottie animationData={countdownAnimation}/>
                </Dialog>}

            <MenuDialog onClose={() => setIsPasswordDialogOpen(false)} open={isPasswordDialogOpen}>
                <DialogContent>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: 300, maxWidth: "100vw" }}>
                        <Input value={password} error={isWrongPassword} type={"password"}
                               style={{ width: "calc(100% - 1.5rem)", border: `2px solid ${isWrongPassword ? "crimson" : "#1C7540FF"}`}}
                               onChange={(e) => {
                                   setPassword(e.target.value);
                                   setIsWrongPassword(false);
                               }} />
                        <Button disabled={!password} onClick={handleJoinRoomWithPassword} style={{ width: "50%", minWidth: 100, background: "#1C7540FF" }}>
                            {isWrongPassword ? "wrong password" : "Submit"}
                        </Button>
                    </div>
                </DialogContent>
            </MenuDialog>

            <Layout>
                <Header>
                    <SoundBar>
                        <div style={{ display: "flex", alignItems: "center", gap: 40, marginLeft: 20 }}>
                        {isAlreadyOpenedInOtherTab ? <ConnectionSpanYellow>⦾</ConnectionSpanYellow> :
                            <>
                                {websocket.readyState === 1 && <ConnectionSpanGreen>⦿</ConnectionSpanGreen>}
                                {[0,3].includes(websocket.readyState) && <ConnectionSpanRed>○</ConnectionSpanRed>}
                            </>
                        }
                        <OnlineUsers>
                            <PopulationIcon fontSize={"large"} />
                            <span>{userCount} online</span>
                        </OnlineUsers>
                        </div>
                    </SoundBar>
                    {/*TODO: Add own name plate here*/}
                    {isRejoinable && <Button onClick={handleReconnect}>RECONNECT</Button>}
                    <BackButton/>
                </Header>

                <Content>
                    <LeftColumn>
                        <Card style={{ height: 'calc(66.666% - 0.5rem)', maxHeight: 800 }}>
                            <CardTitle>{joinedRoom?.name ?? "Available Rooms"}</CardTitle>
                            <ScrollArea>
                                {joinedRoom
                                    ? <RoomList>
                                        {joinedRoom.players.map((player) => {
                                            const me = player.name === user;
                                            const host = player.name === joinedRoom.hostName;
                                            const amIHost = user === joinedRoom.hostName;

                                            return (
                                                <RoomItem key={player.name}>
                                                    <StyledSpan>{player.name}</StyledSpan>

                                                    {me && <Button disabled={isLoading} onClick={handleLeaveRoom}>LEAVE</Button>}
                                                    {!me && amIHost && <Button disabled={isLoading} onClick={() => handleKickPlayer(player.name)}>KICK</Button>}
                                                    {!me && !amIHost && <div />}

                                                    {host ? <img alt={"HOST"} width={48} src={crownSrc} style={{ justifySelf: "center" }}/>
                                                          : <StyledChip label={"READY"} sx={{backgroundColor: player.ready ? teal["A700"] : grey[800]}} />}

                                                    {/*TODO: Replace name and avatar by name plates later*/}
                                                    <img alt={player.name + "img"} width={96} height={96} style={{ justifySelf: "flex-end" }} src={profilePicture(player.avatarName)}/>
                                                </RoomItem>)
                                        })}
                                      </RoomList>
                                    : <RoomList>
                                          {rooms.map((room) => (
                                              <RoomItemLobby key={room.id}>
                                                <StyledSpan>{room.name}</StyledSpan>
                                                {room.hasPassword && <PrivateIcon/>}
                                                <Button disabled={isLoading} onClick={() => handleJoinRoom(room.id)}>Join</Button>
                                              </RoomItemLobby>)
                                          )}
                                      </RoomList>
                                }
                            </ScrollArea>
                        </Card>

                        <Chat sendMessage={websocket.sendMessage} messages={messages} roomId={joinedRoom?.id}/>
                    </LeftColumn>

                    <RightColumn>
                        <Card>
                            <CardTitle>Deck Selection</CardTitle>
                            <Select value={activeDeckId} onChange={handleDeckChange}>
                                {decks.map((deck) => <option value={deck.id} key={deck.id}>{deck.name}</option>)}
                            </Select>
                            <DeckCard>
                                {deckObject && <ProfileDeck deck={deckObject} lobbyView
                                                            setSleeveSelectionOpen={setSleeveSelectionOpen}
                                                            setImageSelectionOpen={setImageSelectionOpen}/>}
                            </DeckCard>
                        </Card>

                        {!joinedRoom && <Card>
                            <CardTitle>Room Setup</CardTitle>
                            <Input
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Room name"
                                style={{marginBottom: '1rem', width: "95%"}}
                            />
                            <Input
                                value={newRoomPassword}
                                onChange={(e) => setNewRoomPassword(e.target.value)}
                                placeholder="Password (optional)"
                                style={{marginBottom: '1rem', width: "95%"}}
                            />
                            {/*TODO: enable when format enforcement can be implemented */}
                            {/*<Select value={newRoomFormat} disabled onChange={(e) => setNewRoomFormat(e.target.value as Format)}>*/}
                            {/*    {Object.values(Format).map((format) => <option value={format}*/}
                            {/*                                                   key={format}>{format}</option>)}*/}
                            {/*</Select>*/}
                            <Button disabled={!newRoomName || isLoading} onClick={handleCreateRoom}
                                    style={{width: '100%'}}>
                                Create Room
                            </Button>
                        </Card>}
                        <Card>
                            {joinedRoom
                                ? user === joinedRoom.hostName
                                    ? <StartButton disabled={startGameDisabled} onClick={handleStartGame}>START GAME</StartButton>
                                    : <ReadyButton disabled={isLoading} isReady={meInRoom?.ready} onClick={handleToggleReady}>READY</ReadyButton>
                                : <QuickPlayButton disabled={isLoading} onClick={handleQuickPlay}>
                                    {isSearchingGame ? "LOOKING FOR GAME..." :"Quick Play"}
                                </QuickPlayButton>}
                        </Card>
                    </RightColumn>
                </Content>
            </Layout>
        </MenuBackgroundWrapper>
    )
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);
  width: calc(100% - 20px);
  padding: 20px;

  @media (max-width: 1024px) {
    max-width: 750px;
    max-height: unset;
  }
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #771417;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(173, 62, 71, 0.8);
`

const OnlineUsers = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ghostwhite;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
    height: calc(100vh - 120px); // Adjust based on your header height
  }
`

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    width: 66.666%;
    height: 100%;
    max-height: calc(100vh - 150px);
  }
`

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    width: 33.333%;
  }
`

const Card = styled.div`
  border-radius: 4px;
  box-shadow: 0 0 8px var(--christmas-green-shadow);
  padding: 1rem;
  border: 2px solid var(--christmas-green);
`

const CardTitle = styled.h2`
  font-family: 'Pixel Digivolve', sans-serif;
  font-size: 1.5rem;
  color: var(--yellow);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(148, 105, 28, 0.32);
`

const ScrollArea = styled.div`
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #0c0c0c;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--christmas-green);
    border-radius: 2px;
  }
`

const RoomList = styled.ul`
  list-style-type: none;
  padding: 0;
`

const RoomItem = styled.li`
  width: calc(100% - 1rem);
  display: grid;
  grid-template-columns: repeat(4, 1fr) 100px;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--christmas-green);
  transition: background-color 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(29, 125, 252, 0.1);
  }
`

const RoomItemLobby = styled(RoomItem)`
  width: unset;
  display: flex;
  grid-template-columns: unset;
  justify-content: space-between;
`

const Button = styled.button`
  background-color: var(--christmas-green);
  color: #0c0c0c;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-family: 'Amiga Forever Pro2', sans-serif;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    background-color: #1d7dfc;
    color: ghostwhite;
    box-shadow: 0 0 10px rgba(29, 125, 252, 0.5);
  }
`

const Input = styled.input<{ error?: boolean }>`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid ${({error}) => error ? "crimson" : "var(--christmas-green)"};
  border-radius: 2px;
  background-color: #0c0c0c;
  color: ghostwhite;
  font-family: 'Cousine', monospace;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px var(--christmas-green-shadow);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--christmas-green);
  border-radius: 2px;
  background-color: #0c0c0c;
  color: ghostwhite;
  font-family: 'League Spartan', sans-serif;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px var(--christmas-green-shadow);
  }
`

const DeckCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: fit-content;
`

const QuickPlayButton = styled(Button)`
  width: 100%;
  background-color: var(--christmas-green);
  color: #0c0c0c;
  font-size: 1.2rem;
  padding: 1rem;

  &:hover {
    background-color: #1d7dfc;
    color: ghostwhite;
  }
`

const ReadyButton = styled(QuickPlayButton)<{ isReady?: boolean }>`
  width: 100%;
  background-color: ${props => props.isReady ? 'var(--christmas-green)' : 'var(--yellow)'};
  color: #0c0c0c;
  font-size: 1.2rem;
  padding: 1rem;
  
  &:hover {
    background-color: ${props => props.isReady ? '#38423f' : '#1d7dfc'};
    color: ${props => props.isReady ? '#0c0c0c' : 'ghostwhite'};
  }
`
const StartButton = styled(Button)<{disabled: boolean}>`
  width: 100%;
  background-color: ${props => props.disabled ? '#38423f' : '#218f3c'};
  color: #0c0c0c;
  font-size: 1.2rem;
  padding: 1rem;

  &:hover {
    background-color: ${props => props.disabled ? '#38423f' : '#1d7dfc'};
    color: ${props => props.disabled ? '#0c0c0c' : 'ghostwhite'};
  }
`

const ConnectionSpanGreen = styled.span`
  color: #0b790b;
  filter: drop-shadow(0 0 3px #19cb19);
  font-size: 1.2em;
  opacity: 0.8;
`;

const ConnectionSpanYellow = styled(ConnectionSpanGreen)`
  color: #9f811f;
  filter: drop-shadow(0 0 3px #e1bd29);
`;

const ConnectionSpanRed = styled(ConnectionSpanGreen)`
  color: #ce1515;
  filter: drop-shadow(0 0 2px #090101);
`;

const StyledChip = styled(Chip)`
  width: 40%;
  justify-self: center;
  border-radius: 5px;
  height: 40px;
  letter-spacing: 1px;
  font-size: 1.05rem;
  box-shadow: inset 0 0 5px 0 rgba(0, 0, 0, 0.8);
`;

const StyledSpan = styled.span`
    font-size: 1.2rem;
    font-family: 'League Spartan', sans-serif;
    color: ghostwhite;
    text-shadow: 0 0 5px var(--christmas-green-shadow);
    justify-self: flex-start;
`;
