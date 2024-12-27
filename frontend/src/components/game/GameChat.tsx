import {useState} from "react";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import styled from "@emotion/styled";
import sendIcon from "../../assets/sendIcon.svg";
import {uid} from "uid";
import {WSUtils} from "../../pages/GamePage.tsx";

export default function GameChat({matchInfo, sendChatMessage}: WSUtils) {

    const messages = useGameBoardStates(state => state.messages);
    const [myMessage, setMyMessage] = useState<string>("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        sendChatMessage(myMessage);
        setMyMessage("");
    }

    return (
        <Wrapper>
            <History>
                {messages.map((message) => {
                    if (message.startsWith("[STARTING_PLAYER]≔")) return <></>;

                    const userName = message.split("﹕", 2)[0];
                    const isMyMessage = userName === matchInfo.user;
                    const chatMessage = message.split("﹕", 2)[1];

                    if (chatMessage.startsWith("[FIELD_UPDATE]≔")) return <></>;

                    return (
                            <Message isMyMessage={isMyMessage} key={uid()}>
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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
`;

const Message = styled.div<{isMyMessage:boolean}>`
  max-width: 90%;
  width: fit-content;
  height: fit-content;
  align-self: ${({isMyMessage}) => isMyMessage ? "flex-end" : "flex-start"};
  background: ${({isMyMessage}) => isMyMessage ? "rgba(94,93,93,0.35)" : "rgba(40,73,103,0.65)"};
  border-radius: 5px;
  padding: 1px 4px 1px 4px;
  display: flex;
  border: 1px solid ${({isMyMessage}) => isMyMessage ? "rgba(124,124,118,0.6)" : "rgba(48,90,128,0.8)"};

  p {
    margin: 0;
    font-family: Cousine, sans-serif;
    text-align: left;
    color: papayawhip;
    max-width: 100%;
    word-break: break-word;
  }
`;

const History = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  justify-content: flex-start;
  height: 95.75%;
  width: 98%;
  padding: 0 1% 0 1%;
  overflow-y: scroll;
  overflow-x: hidden;
  gap: 3px;
  z-index: 100;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }
  
  ::-webkit-scrollbar {
    background: rgba(30, 31, 16, 0.5);
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 239, 213, 0.75);
  }
`;

const StyledButton = styled.button`
  padding: 0 2px 2px 0;
  cursor: pointer;
  width: 32px;
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
  width: 98%;
  padding: 1%;
  height: fit-content;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;
