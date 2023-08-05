import BackButton from "../components/BackButton.tsx";
import useWebSocket from "react-use-websocket";
import {FormEvent, useEffect, useRef, useState} from "react";
import {Headline2} from "../components/Header.tsx";
import {ToastContainer} from "react-toastify";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";
import {useNavigate} from "react-router-dom";
import {useStore} from "../hooks/useStore.ts";

export default function Lobby({user}: { user: string }) {
    const [usernames, setUsernames] = useState<string[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");
    const historyRef = useRef<HTMLDivElement>(null);
    const [pendingInvitation, setPendingInvitation] = useState<boolean>(false);
    const [invitationSent, setInvitationSent] = useState<boolean>(false);
    const [inviteFrom, setInviteFrom] = useState<string>("");
    const [inviteTo, setInviteTo] = useState<string>("");
    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/chat" : "wss://cgn-java-23-2-enrico.capstone-project.de/api/ws/chat";

    const setGameId = useStore((state) => state.setGameId);

    const navigate = useNavigate();
  
    const websocket = useWebSocket(websocketURL, {
        onMessage: (event) => {
            if (event.data.startsWith("[INVITATION]")) {
                if (pendingInvitation) return;

                setPendingInvitation(true);
                setInviteFrom(event.data.substring(event.data.indexOf(":") + 1));
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
                    const newGameID = user + "_" + acceptedFrom;
                    setGameId(newGameID);
                    setTimeout(() => {
                        navigate(`../game/${newGameID}`);
                    }, 500);
                }
                return;
            }

            if (event.data.startsWith("[CHAT_MESSAGE]")) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
            } else {
                setUsernames(event.data.split(", "));
            }
        },
    });

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messages]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if ((message !== "") && (message !== "/invite:" + user)
            && (!message.startsWith("/abortInvite") && !message.startsWith("/acceptInvite"))) {

            websocket.sendMessage(message);
            setMessage("");
        }
    }

    function handleInvite(invitedUsername: string) {
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
        websocket.sendMessage(`/acceptInvite:` + inviteFrom);
        const newGameId = inviteFrom + "_" + user;
        setGameId(newGameId);
        console.log("gameId: " + newGameId);
        setTimeout(() => {
            navigate(`/game/${newGameId}`);
        }, 1000);
    }


    return (
        <Wrapper>
            {pendingInvitation &&
                <InvitationMoodle>
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

            <ToastContainer/>
            {websocket.readyState === 0 && <ConnectionSpanYellow>⦾</ConnectionSpanYellow>}
            {websocket.readyState === 1 && <ConnectionSpanGreen>⦿</ConnectionSpanGreen>}
            {websocket.readyState === 3 && <ConnectionSpanRed>○</ConnectionSpanRed>}

            <Header>
                <Headline2 style={{transform: "translateY(20px)", gridColumnStart: 2}}>
                    Lobby
                </Headline2>
                <ButtonContainer><BackButton/></ButtonContainer>
            </Header>

            <Container>
                <UserList>
                    {usernames.length > 1 ?
                        usernames.map((username) => (!pendingInvitation && !invitationSent && username !== user &&
                            <User key={username}>
                                {username}
                                <InviteButton onClick={() => handleInvite(username)}>INVITE</InviteButton>
                            </User>))
                        : <span style={{fontFamily: "'Pixel Digivolve', sans-serif", fontSize: 20}}>Currently nobody here...</span>}
                </UserList>

                <Chat>
                    <History ref={historyRef}>
                        {messages.map((message) => {
                            const colonIndex = message.indexOf(":");
                            if (colonIndex !== -1) {
                                const name = message.substring(0, colonIndex);
                                const content = message.substring(colonIndex + 1);
                                return (
                                    <div style={{display: "flex"}} key={message}>
                                        <StyledSpan><span>{name}</span>:{content}</StyledSpan>
                                    </div>
                                );
                            }
                            return <div key={message}>{message}</div>;
                        })}
                    </History>
                    <InputContainer onSubmit={handleSubmit}>
                        <StyledInput value={message} placeholder="..."
                                     onChange={(e) => setMessage(e.target.value)}></StyledInput>
                        <StyledButton>SEND</StyledButton>
                    </InputContainer>
                </Chat>
            </Container>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  max-height: 100vh;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  grid-template-rows: 1fr;
  justify-content: center;
  margin-top: 5vh;
  width: 100vw;
  max-width: 1000px;

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
`;

const ConnectionSpanGreen = styled.span`
  color: #0b790b;
  grid-column-start: 2;
  font-size: 1.1em;
  opacity: 0.8;
  filter: drop-shadow(0 0 3px #19cb19);
  position: absolute;
  top: 2%;
  left: 4%;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5vh;
  width: 97.75vw;
  height: 85%;
  max-width: 1000px;

  @media (min-width: 1000px) {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
  }
`;

const UserList = styled.div`
  margin-top: 3vh;
  padding-top: 1vh;
  height: 50%;
  width: 85%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  overflow-y: scroll;

  @media (max-width: 500px) {
    gap: 8px;
  }

  ::-webkit-scrollbar {
    opacity: 0;
  }
`;

const User = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 80%;
  height: 14%;
  color: ghostwhite;
  background: black;
  font-family: Amiga Forever Pro2, sans-serif;
  text-align: left;
  padding-left: 4vw;
  padding-top: 0.55vh;
  padding-right: 4vw;
  text-overflow: clip;
  font-size: 3.2vh;
  border: 3px solid #dcb415;
  box-shadow: inset 0 0 5px #dcb415;
  filter: drop-shadow(0 0 4px #dcb415);
  @media (min-width: 1000px) {
    border-width: 3px;
    padding-right: 3vw;
    padding-left: 3vw;
  }

  @media (min-width: 2000px) {
    padding-right: 2vw;
    padding-left: 2vw;
  }

  @media (max-width: 500px) {
    font-size: 3vh;
    height: 12%;
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
  padding: 25px;
  width: 84.5%;
  height: 50%;

  @media (max-width: 500px) {
    border: 3px solid white;
    padding: 4vw;
    width: 92%;
    height: 52%;
    transform: translateY(0.7vh);
  }
`;

const History = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: 1000%;
  max-height: 400px;
  width: 100%;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    background: #1e1f10;
  }

  ::-webkit-scrollbar-thumb {
    background: papayawhip;
  }
`;

const StyledSpan = styled.span`

  font-family: Cousine, sans-serif;
  text-align: left;
  color: papayawhip;

  span {
    color: #e1b70f;
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
  height: 100%;
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
`;

const InviteButton = styled(StyledButton)`
  margin-bottom: 5px;
  @media (max-width: 500px) {
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

  width: 16vw;
  height: 12vh;
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
    height: 120px;
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