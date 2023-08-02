import BackButton from "../components/BackButton.tsx";
import useWebSocket from "react-use-websocket";
import {useState} from "react";
import {Headline2} from "../components/Header.tsx";
import {ToastContainer} from "react-toastify";
import styled from "@emotion/styled";

export default function Lobby({user}: { user: string }) {
    const [usernames, setUsernames] = useState<string[]>([]);

    const websocket = useWebSocket("ws://localhost:8080/api/ws/chat", {
        onMessage: (event) => {
            setUsernames(event.data.split(", "));
        },
    });

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
                    : <span style={{fontFamily: "'Pixel Digivolve', sans-serif"}}>Currently nobody here...</span>}
                </UserList>
            </Container>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
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
  align-items: flex-start;
  justify-content: center;
  margin-top: 5vh;
  width: 97.75vw;
  height: 85%;
  max-width: 1000px;
  background: #101a3d;
  border: 4px solid #0c6fc9;
  box-shadow: inset 0 0 5px #0c6fc9;
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
  box-shadow: inset 0px -20px 10px #101a3d;
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
  text-overflow: clip;
  font-size: 3.8vh;
  border: 3px solid #cc6601;
  box-shadow: inset 0 0 5px #cc6601;
  filter: drop-shadow(0 0 4px #cc6601);
  @media (min-width: 1000px) {
    border-width: 3px;
  }
  
  @media (max-width: 500px) {
    font-size: 3vh;
    height: 12%;
  }
  
`;