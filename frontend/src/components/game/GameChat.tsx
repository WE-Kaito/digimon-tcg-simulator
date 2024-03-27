import {useState} from "react";
import {useGame} from "../../hooks/useGame.ts";
import styled from "@emotion/styled";
import sendIcon from "../../assets/sendIcon.svg";
import {uid} from "uid";

type Props = {
    user: string,
    sendChatMessage: (message: string) => void
}

export default function GameChat({user, sendChatMessage}: Props) {

    const messages = useGame(state => state.messages);
    const [myMessage, setMyMessage] = useState<string>("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        sendChatMessage(myMessage);
        setMyMessage("");
    }

    return (
        <div style={{width: 365, borderRadius: 15, background: "linear-gradient(to right, rgba(15, 15, 15, 0) 0%, rgba(30, 30, 30, 0.5) 5%)"}}>
        <Wrapper>
            <Overlay/>
            <History>
                {messages.map((message) => {
                    if (message.startsWith("[STARTING_PLAYER]≔")) {
                        const startingPlayer = message.split("≔")[1];
                        return (
                            <StartingPlayerMessage key={uid()}>
                                <p>Starting Player:<br/>{startingPlayer}</p>
                            </StartingPlayerMessage>
                        );
                    }

                    const userName = message.split("﹕", 2)[0];
                    const chatMessage = message.split("﹕", 2)[1];
                    const isMyMessage = userName === user;

                    if (chatMessage.startsWith("[FIELD_UPDATE]≔")){
                        const startIndex = message.indexOf("【");
                        const filteredMessage = message.substring(startIndex);
                        const cardName = filteredMessage.split("﹕")[0];
                        const cardLocation = filteredMessage.split("﹕")[1];
                        if (filteredMessage.startsWith("【MEMORY】")){
                            const oldMemory = parseInt(cardLocation.split("±")[0]);
                            const newMemory = parseInt(cardLocation.split("±")[1]);
                            return (
                                <UpdateMessage isMyMessage={isMyMessage} key={uid()}>
                                    <p style={{textAlign:"left", marginLeft:"20px"}}>
                                        {cardName} {isMyMessage
                                        ?`${oldMemory.toString()} ➟ ${newMemory.toString()}`
                                        :`${(-oldMemory).toString()} ➟ ${(-newMemory).toString()}`
                                        }
                                    </p>
                                </UpdateMessage>
                            );
                        }
                        return (
                            <UpdateMessage isMyMessage={isMyMessage} key={uid()}>
                                <p>{cardName}<br/>{cardLocation}</p>
                            </UpdateMessage>
                        );
                    }

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
        </div>
    );
}

const Wrapper = styled.div`
  height: 980px;
  width: 350px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  transform: translateX(10px);
`;

const Message = styled.div<{isMyMessage:boolean}>`
  width: 85%;
  height: fit-content;
  align-self: ${({isMyMessage}) => isMyMessage ? "flex-end" : "flex-start"};
  background: ${({isMyMessage}) => isMyMessage ? "rgba(94,93,93,0.35)" : "rgba(40,73,103,0.65)"};
  border-radius: 5px;
  padding: 1px 4px 1px 4px;
  display: flex;
  border: 1px solid ${({isMyMessage}) => isMyMessage ? "rgba(124,124,118,0.6)" : "rgba(48,90,128,0.8)"};

  p {
    margin: 3px;
    font-family: Cousine, sans-serif;
    text-align: left;
    color: papayawhip;
    max-width: 100%;
  }
`;

const UpdateMessage = styled(Message)`
  width: 97%;
  background: ${({isMyMessage}) => isMyMessage ? "rgba(84, 84, 84, 0.15)" : "rgba(37,66,93,0.35)"};
  padding-bottom: 0;
  border: none;
  p {
    width: 100%;
    text-align: center;
    opacity: ${({isMyMessage}) => isMyMessage ? "0.6" : "0.8"};
  }
`;

const StartingPlayerMessage = styled.div`
  width: 97%;
  height: fit-content;
  background: rgba(231, 202, 12, 0.65);
  border-radius: 5px;
  padding: 1px 4px 0 4px;
  display: flex;

  p {
    margin: 2px;
    font-family: Cousine, sans-serif;
    width: 100%;
    text-align: center;
    color: #060e18;
    max-width: 100%;
    text-shadow: 0 0 1px #060e18;
  }
`;

const History = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  justify-content: flex-start;
  height: 95.75%;
  width: 96%;
  margin-left: 5%;
  overflow-y: scroll;
  overflow-x: hidden;
  gap: 6px;
  z-index: 100;
  transform: translateY(-31px);

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

const Overlay = styled.div`
  background: linear-gradient(to bottom, rgb(25, 25, 25) 30%, rgba(25, 25, 25, 0.3) 75%, transparent 100%);
  align-self: flex-end;
  width: 336px;
  height: 40px;
  border-top-right-radius: 13px;
  z-index: 200;
  position: absolute;
  top: 0;
  transform: translateX(2px);
`;
