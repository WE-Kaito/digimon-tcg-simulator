import discordIcon from "../../assets/discordLogo.png";
import styled from "@emotion/styled";
import {FormEvent, useEffect, useRef, useState} from "react";
import {SendMessage} from "react-use-websocket";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";

type Props = {
    sendMessage: SendMessage;
    messages: string[];
    roomId?: string;
}

export default function Chat({ sendMessage, messages, roomId }: Props) {
    const user = useGeneralStates((state) => state.user)

    const [message, setMessage] = useState<string>("");

    const historyRef = useRef<HTMLDivElement>(null);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!message.trim().length) return;

        if (roomId) sendMessage("/roomChatMessage:" + message + ":" + roomId);
        else sendMessage("/chatMessage:" + message);
        setMessage("");
    }

    useEffect(() => {
        if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }, [messages]);

    return (
        <Wrapper>
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
                                        ? <StyledSpan>
                                            <span style={{color:"#31da75"}}>Server</span>:
                                            <a href="https://discord.gg/sBdByGAh2y" target="_blank" rel="noopener noreferrer">{content}</a>
                                            <img alt="logo" src={discordIcon} height={14} style={{transform:"translate(3px, 2px)"}}/>
                                        </StyledSpan>
                                        : <StyledSpan>
                                            <span style={{color:"#31da75"}}>Server</span>:{content}
                                        </StyledSpan>}
                                </div>
                            );
                        }

                        return (
                            <div style={{display: "flex"}} key={index}>
                                <StyledSpan isMe={user === name}><span>{name}</span>:{content}</StyledSpan>
                            </div>
                        );
                    }
                    return <div key={index}>{message}</div>;
                })}
            </History>
            <InputContainer onSubmit={handleSubmit}>
                <StyledInput value={message} placeholder={"..."} onChange={(e) => setMessage(e.target.value)}/>
                <SubmitButton>SEND</SubmitButton>
            </InputContainer>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  background: black;
  border: 2px solid var(--christmas-green);
  border-radius: 4px;
  filter: drop-shadow(0 0 5px var(--christmas-green-shadow));
  padding: 0.25% 1% 1% 1%;
  width: 97.45%;
  height: 400px;
  
  @media (min-width: 1024px) {
    margin-left: 2px;
    margin-bottom: 3%;
    height: 30.33%;
  }
`;

const StyledSpan = styled.span<{isMe?: boolean}>`
  font-family: Cousine, sans-serif;
  text-align: left;
  color: papayawhip;

  span {
    color: ${({isMe}) => isMe ? '#f55f02' : '#e1b70f'};
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

const History = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  overflow-y: scroll;
  margin-top: 8px;
  
  ::-webkit-scrollbar {
    width: 14px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: papayawhip;
  }
`;

const SubmitButton = styled.button`
  padding: 0;
  cursor: pointer;
  width: 100px;
  margin-left: 12px;
  height: 32px;
  border-radius: 0;
  background: var(--christmas-green);
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  color: #0e0e0e;
  box-shadow: 2px 2px 2px 0 #262626;
  transition: all 0.15s ease;

  &:hover {
    background-color: var(--blue);
    box-shadow: 2px 2px 2px 0 rgba(15, 66, 131, 0.51);
    color: black;
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: rgb(67, 123, 253);
    transform: translateY(2px);
  }

  @media (max-width: 500px) {
    font-size: 18px;
    width: 70px;
  }
`;
