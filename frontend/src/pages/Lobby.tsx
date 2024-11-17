import styled from "@emotion/styled";
import {ChangeEvent, useCallback, useEffect, useState} from "react";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import {useGeneralStates} from "../hooks/useGeneralStates.ts";
import useWebSocket from "react-use-websocket";
import {notifyBrokenDeck, notifyMuteInvites, notifyNoActiveDeck} from "../utils/toasts.ts";
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

export default function NewLobby() {
    const [onlineUsers, setOnlineUsers] = useState(42)
    const rooms = [{ id: 1, name: 'Cyber Arena' }, {id: 2, name: 'Neon Battleground' }]
    const [selectedFormat, setSelectedFormat] = useState('')
// ----------------------------------------------------------------------------------------------------

    const [usernames, setUsernames] = useState<string[]>([]);
    const [messages, setMessages] = useState<string[]>([]);

    const [pendingInvitation, setPendingInvitation] = useState<boolean>(false);
    const [invitationSent, setInvitationSent] = useState<boolean>(false);
    const [inviteFrom, setInviteFrom] = useState<string>("");
    const [inviteTo, setInviteTo] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [userCount, setUserCount] = useState<number>(0);
    const [isRejoinable, setIsRejoinable] = useState<boolean>(false);
    const [mutedInvitesFrom, setMutedInvitesFrom] = useState<string[]>([]);
    const [noActiveDeck, setNoActiveDeck] = useState<boolean>(false);

    const currentPort = window.location.port;
    //TODO: using www.project-drasil.online as the domain is not working, so we need to use the IP address instead?
    const websocketURL = currentPort === "5173" ? "ws://192.168.0.4:8080/api/ws/chat" : "wss://project-drasil.online/api/ws/chat";

    const user = useGeneralStates((state) => state.user)
    const setActiveDeck = useGeneralStates(state => state.setActiveDeck);
    const activeDeckId = useGeneralStates(state => state.activeDeckId);
    const getActiveDeck = useGeneralStates(state => state.getActiveDeck);
    const fetchDecks = useGeneralStates(state => state.fetchDecks);
    const decks = useGeneralStates(state => state.decks);

    const gameId = useGameBoardStates((state) => state.gameId);
    const setGameId = useGameBoardStates((state) => state.setGameId);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);

    const playInvitationSfx = useSound((state) => state.playInvitationSfx);

    const [deckObject, setDeckObject] = useState<DeckType | null>(null);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false)

    const navigate = useNavigate();
    const navigateToGame = () => navigate("/game");

    const websocket = useWebSocket(websocketURL, {
        onMessage: (event) => {
            if (event.data === "[HEARTBEAT]") {
                websocket.sendMessage("/heartbeat/");
                return;
            }

            if (event.data.startsWith("[INVITATION]")) {
                if (pendingInvitation) return;
                const otherPlayer = event.data.substring(event.data.indexOf(":") + 1);
                if (mutedInvitesFrom.includes(otherPlayer)) return;
                playInvitationSfx();
                setPendingInvitation(true);
                setInviteFrom(otherPlayer);
                setInviteTo("");
                return;
            }

            if (event.data.startsWith("[INVITATION_ABORTED]")) {
                setInvitationSent(false);
                setPendingInvitation(false);
                return;
            }

            if (event.data.startsWith("[INVITATION_ACCEPTED]")) {
                const acceptedFrom: string = event.data.substring(event.data.indexOf(":") + 1);
                if (acceptedFrom === inviteTo) {
                    const newGameID = user + "‗" + acceptedFrom;
                    setGameId(newGameID);
                    navigateToGame();
                }
                return;
            }

            if (event.data === "[NO_ACTIVE_DECK]") {
                notifyNoActiveDeck();
                setNoActiveDeck(true);
                return;
            }

            if (event.data === "[BROKEN_DECK]") {
                notifyBrokenDeck();
                setNoActiveDeck(true);
                return;
            }

            if (event.data.startsWith("[RECONNECT_ENABLED]")) {
                const matchingRoomId = event.data.substring("[RECONNECT_ENABLED]:".length)
                setIsRejoinable(matchingRoomId === gameId);
                // gameId could be set to older matching room id here, but not sure if this makes sense
                return;
            }

            if (event.data === "[RECONNECT_DISABLED]") {
                setIsRejoinable(false);
                return;
            }

            if (event.data.startsWith("[USER_COUNT]:")) {
                setUserCount(parseInt(event.data.substring("[USER_COUNT]:".length)));
                return;
            }

            if (event.data.startsWith("[CHAT_MESSAGE]")) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
                return;
            }

            setUsernames(event.data.split(", "));
        },
    });

    function handleInvite(invitedUsername: string) {
        clearBoard();
        localStorage.removeItem("bearStore");
        setInvitationSent(true);
        setInviteTo(invitedUsername);
        const invitationMessage = `/invite:` + invitedUsername;
        websocket.sendMessage(invitationMessage);
    }

    function handleAbortInvite(isSender: boolean) {
        setInvitationSent(false);
        setPendingInvitation(false);
        const abortMessage = `/abortInvite:` + (isSender ? inviteTo : inviteFrom);
        websocket.sendMessage(abortMessage);
    }

    function handleAcceptInvite() {
        clearBoard();
        localStorage.removeItem("bearStore");
        websocket.sendMessage(`/acceptInvite:` + inviteFrom);
        const newGameId = inviteFrom + "‗" + user;
        setGameId(newGameId);
        navigateToGame();
    }

    function handleMuteInvites() {
        notifyMuteInvites(inviteFrom);
        setMutedInvitesFrom([...mutedInvitesFrom, inviteFrom]);
        handleAbortInvite(false);
    }

    function handleOnCloseSetImageDialog() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }

    const handleDeckChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setActiveDeck(String(event.target.value))
        if(noActiveDeck) window.location.reload();
    };

    function userVisible(username: string) {
        return !pendingInvitation && !invitationSent && username !== user && (username.toLowerCase().includes(search.toLowerCase()) || search === "");
    }

    const initialFetch = useCallback(() => {
        getActiveDeck();
        fetchDecks();
    }, [getActiveDeck, fetchDecks]);
    useEffect(() => initialFetch(), [initialFetch]);

    useEffect(() => {
        axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
    }, [activeDeckId]);

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
            <Layout>
                <Header>
                    <SoundBar>
                        {websocket.readyState === 0 && <ConnectionSpanYellow>⦾</ConnectionSpanYellow>}
                        {websocket.readyState === 1 && <ConnectionSpanGreen>⦿</ConnectionSpanGreen>}
                        {websocket.readyState === 3 && <ConnectionSpanRed>○</ConnectionSpanRed>}
                    </SoundBar>
                    <OnlineUsers>
                        <PeopleAltIcon fontSize={"large"} />
                        <span>{onlineUsers} Online</span>
                    </OnlineUsers>
                    <span style={{ padding: 25, fontWeight: 800, background: "white", color: "black" }}>
                        USER NAMEPLATE HERE
                    </span>
                    <BackButton/>
                </Header>

                <Content>
                    <LeftColumn>
                        <Card style={{ height: 'calc(66.666% - 0.5rem)' }}>
                            <CardTitle>Available Rooms</CardTitle>
                            <ScrollArea>
                                <RoomList>
                                    {rooms.map((room) => (
                                        <RoomItem key={room.id}>
                                            <span>{room.name}</span>
                                            <Button>Join</Button>
                                        </RoomItem>
                                    ))}
                                </RoomList>
                            </ScrollArea>
                        </Card>

                        <Chat sendMessage={websocket.sendMessage} messages={messages}/>
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

                        <Card>
                            <CardTitle>Room Setup</CardTitle>
                            <Input
                                value={""}
                                placeholder="Enter room title"
                                style={{ marginBottom: '1rem' }}
                            />
                            <Select
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                            >
                                <option value="">Choose format</option>
                                <option value="standard">Standard</option>
                                <option value="turbo">Turbo</option>
                                <option value="custom">Custom</option>
                            </Select>
                            <Button style={{ width: '100%' }}>Create Room</Button>
                        </Card>
                        <Card>
                            <QuickPlayButton>Quick Play</QuickPlayButton>
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
  display: flex;
  justify-content: space-between;
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

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid var(--christmas-green);
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

const ConnectionSpanGreen = styled.span`
  color: #0b790b;
  grid-column-start: 2;
  font-size: 1.1em;
  opacity: 0.8;
  filter: drop-shadow(0 0 3px #19cb19);
  position: absolute;
  top: 4px;
  left: 4px;
`;

const ConnectionSpanYellow = styled(ConnectionSpanGreen)`
  color: #9f811f;
  filter: drop-shadow(0 0 3px #e1bd29);
  font-size: 1.2em;
`;

const ConnectionSpanRed = styled(ConnectionSpanGreen)`
  color: #790b0b;
  filter: drop-shadow(0 0 2px #ce1515);
  font-size: 1.5em;
`;
