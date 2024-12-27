import BackButton from "../components/BackButton.tsx";
import useWebSocket from "react-use-websocket";
import {FormEvent, useCallback, useEffect, useRef, useState} from "react";
import {Headline2} from "../components/Header.tsx";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";
import {useNavigate} from "react-router-dom";
import {notifyBrokenDeck, notifyMuteInvites, notifyNoActiveDeck} from "../utils/toasts.ts";
import discordIcon from "../assets/discordLogo.png";
import {useGame} from "../hooks/useGame.ts";
import {Button, MenuItem, Select} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import {useStore} from "../hooks/useStore.ts";
import {VolumeOff as MuteIcon} from '@mui/icons-material';
import {useSound} from "../hooks/useSound.ts";
import SoundBar from "../components/SoundBar.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function Lobby({user}: { user: string }) {
    const [usernames, setUsernames] = useState<string[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");
    const historyRef = useRef<HTMLDivElement>(null);
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
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/chat" : "wss://project-drasil.online/api/ws/chat";

    const gameId = useGame((state) => state.gameId);
    const setGameId = useGame((state) => state.setGameId);
    const clearBoard = useGame((state) => state.clearBoard);

    const setActiveDeck = useStore(state => state.setActiveDeck);
    const activeDeckId = useStore(state => state.activeDeckId);
    const getActiveDeck = useStore(state => state.getActiveDeck);
    const fetchDecks = useStore(state => state.fetchDecks);
    const decks = useStore(state => state.decks);
    const isLoading = useStore(state => state.isLoading);

    const playInvitationSfx = useSound((state) => state.playInvitationSfx);

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

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if ((message !== "") && (message !== "/invite:" + user)
            && (!message.startsWith("/abortInvite") && !message.startsWith("/acceptInvite"))) {

            websocket.sendMessage(message);
            setMessage("");
        }
    }

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

    const handleDeckChange = (event: SelectChangeEvent<unknown>) => {
        setActiveDeck(String(event.target.value))
        if(noActiveDeck) window.location.reload();
    };

    function userVisible(username: string) {
        return !pendingInvitation && !invitationSent && username !== user && (username.toLowerCase().includes(search.toLowerCase()) || search === "");
    }

    useEffect(() => {
        if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }, [messages]);

    const initialFetch = useCallback(() => {
        getActiveDeck();
        fetchDecks();
    }, [getActiveDeck, fetchDecks]);
    useEffect(() => initialFetch(), [initialFetch]);

    return (
        <MenuBackgroundWrapper>
            <SoundBar/>

            {pendingInvitation &&
                <InvitationMoodle>
                    <div title="Stop receiving invites from this player until you re-enter the lobby.">
                        <Mute onClick={handleMuteInvites}/>
                    </div>
                    <span>Invitation from {inviteFrom}</span>
                    <div style={{width: "80%", display: "flex", justifyContent: "space-between"}}>
                        <AcceptButton onClick={handleAcceptInvite}>ACCEPT</AcceptButton>
                        <DeclineButton onClick={() => handleAbortInvite(false)}>DECLINE</DeclineButton>
                    </div>
                </InvitationMoodle>}

            {invitationSent &&
                <InvitationMoodle style={{gap: 12}}>
                    <span>Waiting for answer from {inviteTo} ...</span>
                    <Lottie animationData={loadingAnimation} loop={true} style={{width: "60px"}}/>
                    <DeclineButton onClick={() => handleAbortInvite(true)} style={{margin: 0}}>ABORT</DeclineButton>
                </InvitationMoodle>}

            {websocket.readyState === 0 && <ConnectionSpanYellow>⦾</ConnectionSpanYellow>}
            {websocket.readyState === 1 && <ConnectionSpanGreen>⦿</ConnectionSpanGreen>}
            {websocket.readyState === 3 && <ConnectionSpanRed>○</ConnectionSpanRed>}

            <Header>
                <Headline2 style={{flexWrap: "nowrap"}}>Online: {userCount}</Headline2>

                {!isLoading && <StyledSelect label="Deck" onChange={handleDeckChange} value={activeDeckId} labelId={"decks"}
                                             color={"primary"} defaultValue={activeDeckId} variant={"filled"}>
                    {decks.map((deck) => <MenuItem value={deck.id} key={deck.id}>{deck.name}</MenuItem>)}
                </StyledSelect>}

                <ButtonContainer>
                    <Button onClick={navigateToGame} disabled={!isRejoinable} sx={{mr: 10}}
                            variant="outlined" color="success">RECONNECT</Button>
                    <BackButton/>
                </ButtonContainer>
            </Header>

            <Container>
                <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={"user search..."}/>

                <UserList>
                    {usernames.length > 1 ?
                        usernames.map((username) => (userVisible(username) && username &&
                            <User key={username}>
                                {username}
                                <InviteButton onClick={() => handleInvite(username)}>INVITE</InviteButton>
                            </User>))
                        : <span style={{fontFamily: "'Pixel Digivolve', sans-serif", fontSize: 20}}>Currently nobody here...</span>}
                </UserList>

                <Chat>
                    <History ref={historyRef}>
                        {messages.map((message, index) => {
                            const colonIndex = message.indexOf(":");
                            if (colonIndex !== -1) {
                                const name = message.substring(0, colonIndex);
                                const content = message.substring(colonIndex + 1);

                                if (name === "【SERVER】"){
                                    return (
                                        <div style={{display: "flex"}} key={index}>
                                            {content === " Join our Discord!"
                                                ? <StyledSpan name={name} user={user}>
                                                    <span style={{color:"#31da75"}}>Server</span>:
                                                    <a href="https://discord.gg/sBdByGAh2y" target="_blank" rel="noopener noreferrer">{content}</a>
                                                    <img alt="logo" src={discordIcon} height={14} style={{transform:"translate(3px, 2px)"}}/>
                                                </StyledSpan>
                                                : <StyledSpan name={name} user={user}>
                                                    <span style={{color:"#31da75"}}>Server</span>:{content}
                                                </StyledSpan>}
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{display: "flex"}} key={index}>
                                        <StyledSpan name={name} user={user}><span>{name}</span>:{content}</StyledSpan>
                                    </div>
                                );
                            }
                            return <div key={index}>{message}</div>;
                        })}
                    </History>
                    <InputContainer onSubmit={handleSubmit}>
                        <StyledInput value={message} placeholder="..."
                                     onChange={(e) => setMessage(e.target.value)}></StyledInput>
                        <StyledButton>SEND</StyledButton>
                    </InputContainer>
                </Chat>
            </Container>
        </MenuBackgroundWrapper>
    );
}

const Header = styled.div`
  display: flex;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-between;
  align-items: center;
  margin-top: 5vh;
  width: 100%;
  max-width: 900px;
  position: relative;
  
  @media (max-width: 766px) {
    margin-top: 1.5vh;
  }
`;

const ButtonContainer = styled.div`
  grid-column-start: 3;
  grid-row-start: 1;
  justify-self: center;
  align-self: start;
  margin-left: 30px;
  transform: scale(0.95);
  display: flex;
`;

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

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5vh;
  width: 100%;
  max-width: 1000px;

  @media (min-width: 1000px) {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
  }
`;

const UserList = styled.div`
  margin-top: 3vh;
  padding-top: 1vh;
  width: 85%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  overflow-y: scroll;
  max-height: 41.5vh;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }

  @media (max-width: 500px) {
    gap: 8px;
  }
`;

const User = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 80%;
  min-height: 30px;
  color: ghostwhite;
  background: black;
  font-family: Amiga Forever Pro2, sans-serif;
  text-align: left;
  padding: 5px;
  text-overflow: clip;
  font-size: 28px;
  border: 3px solid #dcb415;
  box-shadow: inset 0 0 5px #dcb415;
  filter: drop-shadow(0 0 4px #dcb415);
  flex-shrink: 0;
  @media (min-width: 1000px) {
    border-width: 3px;
    padding-right: 3vw;
    padding-left: 3vw;
  }

  @media (min-width: 2000px) {
    padding-right: 2vw;
    padding-left: 2vw;
  }

  @media (max-width: 500px)  or (max-height: 680px) {
    font-size: 18px;
    width: 87%;
    padding-right: 2vw;
    box-shadow: inset 0 0 3px #dcb415;
    filter: drop-shadow(0 0 2px #dcb415);
  }
`;

const Chat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background: black;
  border: 5px solid white;
  border-radius: 2px;
  box-shadow: inset 0 0 3px white;
  filter: drop-shadow(0 0 3px ghostwhite);
  padding: 0.25% 1% 1% 1%;
  width: 85%;
  height: 300px;

  @media (max-width: 500px) {
    border: 3px solid white;
    padding: 4vw;
    transform: translate(-33px, 0.7vh);
    width: 75.5%;
  }
`;

const History = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: 370px;
  width: 100%;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    background: #1e1f10;
  }

  ::-webkit-scrollbar-thumb {
    background: papayawhip;
  }
`;

const StyledSpan = styled.span<{name: string, user: string}>`

  font-family: Cousine, sans-serif;
  text-align: left;
  color: papayawhip;

  span {
    color: ${({name, user}) => name === user ? '#f55f02' : '#e1b70f'};
    text-shadow: 0 0 1px #ffd11e;
    font-weight: bold;
  }

`;

const StyledInput = styled.input`
  width: 90%;
  padding-left: 10px;
  overflow-y: clip;
  height: 30px;
  font-family: Cousine, sans-serif;
  border: none;
  font-size: 1.05em;
  background: papayawhip;
  color: #1a1a1a;

  :focus {
    outline: none;
    filter: drop-shadow(0 0 2px white);
    background: ghostwhite;
    border-radius: 2px;
  }
`;

const InputContainer = styled.form`
  width: 100%;
  margin-top: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const StyledButton = styled.button`
  padding: 0;
  cursor: pointer;
  width: 100px;
  margin-left: 20px;
  height: 32px;
  border-radius: 0;
  background: #dcb415;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  color: #0e0e0e;
  box-shadow: 2px 2px 2px 0 #262626;
  transition: all 0.15s ease;

  &:hover {
    background-color: #fccb0b;
    color: black;
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #a3da31;
    transform: translateY(2px);
  }

  @media (max-width: 500px) {
    font-size: 18px;
    width: 70px;
  }
`;

const InviteButton = styled(StyledButton)`
  margin-bottom: 5px;
  @media (max-width: 500px)  or (max-height: 680px) {
    font-size: 17px;
    height: 22px;
    width: 70px;
    margin-bottom: 2.5px;
  }
`;

const InvitationMoodle = styled.div`
  position: absolute;
  top: 25%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px 40px 10px;

  width: 24vw;
  height: 14vh;
  min-width: 320px;
  min-height: 120px;
  background: black;
  z-index: 10;
  border: 3px solid #dcb415;
  box-shadow: inset 0 0 5px #dcb415;
  filter: drop-shadow(0 0 4px #dcb415);

  @media (max-width: 500px) {
    top: 18%;
    border: 3px solid #dcb415;
    padding: 20px 40px 20px 5px;
    width: 60%;
    height: 140px;
    transform: translateY(0.7vh);
  }
`;

const AcceptButton = styled(StyledButton)`
  background: #289a78;
  font-size: 20px;

  &:hover {
    background-color: #22c768;
  }

  &:active {
    background: #64e7a1;
  }
`;

const DeclineButton = styled(StyledButton)`
  background: #9d1d33;
  font-size: 20px;

  &:hover {
    background-color: #b72311;
  }

  &:active {
    background: #e12909;
  }
`;

const SearchBar = styled.input`
  background: rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  border: none;
  width: 300px;
  height: 35px;
  font-family: Naston, sans-serif;
  font-size: 20px;
  position: absolute;
  transform: translateY(-50%);
  padding: 2px 15px 2px 15px;
  text-align: center;
  color: black;
  ::placeholder {
    color: ghostwhite;
  }
`;

const StyledSelect = styled(Select)`
  color: aquamarine;
  background: rgba(29, 123, 239, 0.35);
  height: 32px;
  width: 300px;
  position: absolute;
  top: 28px;
  left: 310px;
  font-family: "League Spartan", sans-serif;
  
  .MuiInputBase-input {
    transform: translateY(-7px);
  }
  
  @media (max-width: 800px) {
    left: 30%;
    width: 240px;
  }

  @media (max-width: 500px) {
    top: 64px;
    width: 240px;
  }
`;

const Mute = styled(MuteIcon)`
  position: absolute;
  top: 20px; 
  right: 20px;
  cursor: pointer;
  &:hover {
    opacity: 50%;
  }
`;
