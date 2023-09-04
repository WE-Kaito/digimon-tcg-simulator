import {useState} from "react";
import {useGame} from "../../hooks/useGame.ts";
import styled from "@emotion/styled";
import sendIcon from "../../assets/sendIcon.svg";

type Props = {
    user: string,
    sendChatMessage: (message: string) => void,
    closeChat: () => void
}

export default function GameChat({user, sendChatMessage, closeChat}: Props) {

    const messages = useGame(state => state.messages);
    const [myMessage, setMyMessage] = useState<string>("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        sendChatMessage(myMessage);
        setMyMessage("");
    }

    return (
        <Wrapper>
            <CloseButton onClick={(e) => {
                e.stopPropagation();
                closeChat();
            }}>«««</CloseButton>

            <History>
                {messages.map((message, index) => {
                    const userName = message.split(":")[0];
                    const chatMessage = message.split(":")[1];
                    const isMyMessage = userName === user;
                    return (
                            <Message isMyMessage={isMyMessage} key={index}>
                                <p>{chatMessage}</p>
                            </Message>
                    );
                })}
            </History>
            <InputContainer onSubmit={handleSubmit}>
                <StyledInput value={myMessage} placeholder="..."
                             onChange={(e) => setMyMessage(e.target.value)}></StyledInput>
                <StyledButton><img alt="send" src={sendIcon}/></StyledButton>
            </InputContainer>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  height: 96%;
  width: 90%;
  margin-left: 10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
`;

const Message = styled.div<{isMyMessage:boolean}>`
  width: 85%;
  height: fit-content;
  align-self: ${({isMyMessage}) => isMyMessage ? "flex-end" : "flex-start"};
  background: ${({isMyMessage}) => isMyMessage ? "rgba(84, 84, 84, 0.2)" : "rgba(37,66,93,0.45)"};
  border-radius: 5px;
  padding: 1px 4px 1px 4px;
  display: flex;

  p {
    margin: 3px;
    font-family: Cousine, sans-serif;
    text-align: left;
    color: papayawhip;
    max-width: 100%;
  }
`;

const History = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  justify-content: flex-start;
  height: 95.5%;
  width: 96%;
  margin-left: 5%;
  overflow-y: scroll;
  overflow-x: hidden;
  gap: 6px;
  z-index: 100;
  transform: translate(-1px,-31px);
  
  ::-webkit-scrollbar {
    background: rgba(30, 31, 16, 0.5);
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 239, 213, 0.75);
  }
`;

const StyledButton = styled.button`
  padding: 0;
  padding-bottom: 2px;
  cursor: pointer;
  width: 32px;
  margin-left: 5px;
  height: 32px;
  border-radius: 10%;
  border-bottom-right-radius: 40%;
  background: rgba(220, 180, 21, 0.5);
  font-size: 24px;
  color: #0e0e0e;
  box-shadow: 2px 2px 2px 0 #262626;
  transition: all 0.15s ease;
  
  img {
    transform: translateY(1px);
    width: 24px;
    height: 24px;
  }

  &:hover {
    background-color: #fccb0b;
    color: black;
    border: none;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #a3da31;
    transform: translateY(1px);
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
  background: rgba(255, 239, 213, 0.5);
  color: #1a1a1a;
  border-radius: 5px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;

  :focus {
    outline: none;
    filter: drop-shadow(0 0 2px white);
    background: ghostwhite;
  }
`;

const InputContainer = styled.form`
  width: 95%;
  margin-left: 5%;
  height: 100%;
  margin-top: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  transform: translate(-5px, 13px);
`;

const CloseButton = styled.div`
  background: linear-gradient(to right, rgba(0,0,0,0),rgba(5, 5, 5, 0.5) 5%);
  align-self: flex-end;
  width: 100%;
  height: 29px;
  padding-bottom: 2px;
  padding-right: 5px;
  border-top-right-radius: 10px;
  text-align: right;
  font-family: Cousine, sans-serif;
  letter-spacing: 5px;
  font-size: 24px;
  cursor: pointer;
  transform: translateY(-20px);
  transition: all 1.2s ease;
  
  &:hover {
    background: linear-gradient(to right, rgba(0,0,0,0),rgba(5, 5, 5, 0.5) 5%);
    padding-right: 30px;
    width: 90%;
    letter-spacing: 15px;
    color: #fccb0b;
  }
`;
