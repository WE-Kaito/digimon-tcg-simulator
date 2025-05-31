import discordIcon from "../../assets/discordLogo.png";
import styled from "@emotion/styled";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SendMessage } from "react-use-websocket";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

type Props = {
    sendMessage: SendMessage;
    messages: string[];
    roomId?: string;
};

export default function Chat({ sendMessage, messages, roomId }: Props) {
    const user = useGeneralStates((state) => state.user);

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
            {!!roomId && <StyledPrivateSpan>PRIVATE ROOM CHAT</StyledPrivateSpan>}
            <History ref={historyRef}>
                {messages.map((message, index) => {
                    const colonIndex = message.indexOf(":");
                    if (colonIndex !== -1) {
                        const name = message.substring(0, colonIndex);
                        const content = message.substring(colonIndex + 1);

                        if (name === "【SERVER】") {
                            return (
                                <div style={{ display: "flex" }} key={index}>
                                    {content === " Join our Discord!" ? (
                                        <StyledServerSpan>
                                            <span>Server </span>
                                            <a
                                                href="https://discord.gg/sBdByGAh2y"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {content}
                                            </a>
                                            <img
                                                alt="logo"
                                                src={discordIcon}
                                                height={14}
                                                style={{ transform: "translate(3px, 2px)" }}
                                            />
                                        </StyledServerSpan>
                                    ) : (
                                        <StyledServerSpan>
                                            <span>Server </span>
                                            {content}
                                        </StyledServerSpan>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <MessageContainer key={index}>
                                <StyledSpan isMe={user === name}>
                                    <span>{name + " "}</span>
                                    {content}
                                </StyledSpan>
                            </MessageContainer>
                        );
                    }
                    return <div key={index}>{message}</div>;
                })}
            </History>
            <InputContainer onSubmit={handleSubmit}>
                <StyledInput value={message} placeholder={"..."} onChange={(e) => setMessage(e.target.value)} />
                <SubmitButton className={"button"}>SEND</SubmitButton>
            </InputContainer>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
    max-width: 40%;
    flex: 1;
    min-width: 400px;
    max-height: 100%;

    backdrop-filter: hue-rotate(100deg);

    @media (max-width: 499px) {
        order: -1;
        margin-top: 1px;
        min-height: 350px;
        max-height: 350px;
        min-width: unset;
        max-width: unset;
        width: 100%;
    }

    @media (max-height: 499px) {
        min-height: 350px;
        max-height: 350px;
        max-width: unset;
        width: 100%;
    }
`;

const StyledSpan = styled.span<{ isMe?: boolean }>`
    font-family: "League Spartan", sans-serif;
    letter-spacing: 1px;
    font-weight: 300;
    font-size: 18px;
    text-align: left;
    color: papayawhip;
    word-break: break-all;
    span {
        border: 1px solid transparent;
        border-image: ${({ isMe }) =>
            isMe
                ? "linear-gradient(to bottom right, transparent 0%, transparent 50%, #d5661f 100%)"
                : "linear-gradient(to bottom right, transparent 0%, transparent 50%, #e1b70f 100%)"};
        border-image-slice: 1;
        color: ${({ isMe }) => (isMe ? "#d5661f" : "#e1b70f")};
        border-bottom-right-radius: 4px;
    }
`;

const StyledServerSpan = styled.span`
    font-family: Cousine, sans-serif;
    text-align: left;
    color: papayawhip;
    word-break: break-all;

    span {
        border: 1px solid transparent;
        border-image: linear-gradient(to bottom right, transparent 0%, transparent 50%, #31da75 100%);
        border-image-slice: 1;
        color: #31da75;
        border-bottom-right-radius: 4px;
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

    border-radius: 6px;

    :focus {
        outline: none;
        filter: drop-shadow(0 0 2px white);
        background: ghostwhite;
        border-radius: 2px;
    }
`;

const InputContainer = styled.form`
    width: calc(100% - 12px);
    margin-top: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 0 6px 6px 6px;

    @media (max-width: 499px) {
        width: calc(100vw - 48px);
    }
`;

const History = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: calc(100% - 12px);
    overflow-y: scroll;
    padding: 8px 6px 0 6px;
    font-size: 16px;
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom right,
            rgba(63, 109, 207, 0.75) 0%,
            rgba(48, 95, 217, 0.75) 50%,
            rgba(84, 126, 215, 0.75) 100%
        );
        border-radius: 5px;
        box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            inset 0 -1px 3px rgba(0, 0, 0, 0.9);
    }
`;

const SubmitButton = styled.button`
    height: 40px;
    padding: 0.5rem 1rem;
    font-family: "Frutiger", sans-serif;
    letter-spacing: 1px;

    border-radius: 0;
    outline: 1px solid #242424;
    border: 2px solid transparent;

    border-image: linear-gradient(to bottom right, rgba(255, 255, 255, 0.7) 0%, rgba(157, 157, 157, 0.7) 100%) 1;

    background: var(--blue-button-bg);
    color: ghostwhite;

    text-shadow: 0 -2px 1px rgba(0, 0, 0, 0.25);

    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        color: ghostwhite;
        background: var(--blue-button-bg-hover);
    }

    &:active {
        background: var(--blue-button-bg-active);
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }
`;

const StyledPrivateSpan = styled.span`
    font-family: "League Spartan", sans-serif;
    color: var(--lobby-accent);
    width: 100%;
    padding-top: 12px;
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
    border-bottom: 1px solid transparent;
    border-image: linear-gradient(
        to right,
        transparent 0%,
        transparent 20%,
        var(--lobby-accent) 50%,
        transparent 80%,
        transparent 100%
    );
    border-image-slice: 1;
    align-self: flex-start;
    margin-bottom: auto;
`;

const MessageContainer = styled.div`
    display: flex;
    width: 100%;

    &:hover {
        background: rgba(218, 51, 187, 0.1);
        border-radius: 4px;
    }
`;
