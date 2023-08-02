import BackButton from "../components/BackButton.tsx";
import useWebSocket from "react-use-websocket";
import {FormEvent, useEffect, useRef, useState} from "react";
import {Headline2} from "../components/Header.tsx";
import {ToastContainer} from "react-toastify";
import styled from "@emotion/styled";

export default function Lobby({user}: { user: string }) {
    const [usernames, setUsernames] = useState<string[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messages]);

    const websocket = useWebSocket("ws://localhost:8080/api/ws/chat", {
        onMessage: (event) => {
            if (event.data.startsWith("CHAT_MESSAGE:")) {
                setMessages((messages) => [...messages, event.data.substring(event.data.indexOf(":") + 1)]);
            } else {
                setUsernames(event.data.split(", "));
            }
        },
    });

    function handleSubmit (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (message !== "") {
            websocket.sendMessage(message);
            setMessage("");
        }
    }

    return (
        <Wrapper>
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
                        usernames.map((username) => (username !== user && <User key={username}>{username}</User>))
                        : <span style={{fontFamily: "'Pixel Digivolve', sans-serif", fontSize:20}}>Currently nobody here...</span>}
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
                    <StyledInput value={message} placeholder="..." onChange={(e) => setMessage(e.target.value)}></StyledInput>
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

  ::-webkit-scrollbar {
    opacity: 0;
  }
`;

const User = styled.span`
  width: 85%;
  height: 14%;
  color: ghostwhite;
  background: black;
  font-family: Pixel Digivolve, sans-serif;
  text-align: left;
  padding-left: 4vw;
  padding-bottom: 1vh;
  text-overflow: clip;
  font-size: 3.8vh;
  border: 3px solid #dcb415;
  box-shadow: inset 0 0 5px #dcb415;
  filter: drop-shadow(0 0 4px #dcb415);
  @media (min-width: 1000px) {
    border-width: 3px;
  }

  @media (max-width: 500px) {
    font-size: 3vh;
    height: 12%;
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
  box-shadow: inset 0 0 3px ghostwhite;
  filter: drop-shadow(0 0 3px ghostwhite);

  padding: 25px;
  width: 84.5%;
  height: 50%;
  
  @media (max-width: 500px) {
    border: 3px solid white;
    padding: 4vw;
    width: 89%;
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
    background: #1e1f10 ;
  }

  ::-webkit-scrollbar-thumb {
    background: papayawhip ;
  }
`;

const StyledSpan = styled.span`

  font-family: Cousine, sans-serif;
  text-align: left;

  span {
    color: #dcb415;
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