import { useState } from "react";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import styled from "@emotion/styled";
import sendIcon from "../../assets/sendIcon.svg";
import { WSUtils } from "../../pages/GamePage.tsx";

export default function GameChatLog({ matchInfo, sendChatMessage }: Partial<WSUtils>) {
    const messages = useGameBoardStates((state) => state.messages);
    const [myMessage, setMyMessage] = useState<string>("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (sendChatMessage) {
            sendChatMessage(myMessage);
            setMyMessage("");
        }
    }

    return (
        <>
            <History>
                {messages.map((message, index) => {
                    if (message.startsWith("[STARTING_PLAYER]≔")) {
                        return (
                            <UpdateMessage style={{ background: "rgba(255, 215, 0, 0.25)" }}>
                                <p>FIRST TURN: {message.split("≔")[1]}</p>
                            </UpdateMessage>
                        );
                    }

                    const userName = message.split("﹕", 2)[0];
                    const isMyMessage = userName === matchInfo?.user;
                    const chatMessage = message.split("﹕", 2)[1];

                    if (userName === "【SERVER】") {
                        return (
                            <UpdateMessage
                                key={"msx_" + index}
                                style={{
                                    background: "rgba(4,241,150,0.25)",
                                    outline: "1px solid rgba(4,241,150,0.75)",
                                    outlineOffset: "-1px",
                                }}
                            >
                                <p>{"SERVER: " + chatMessage}</p>
                            </UpdateMessage>
                        );
                    }

                    if (chatMessage?.startsWith("[FIELD_UPDATE]≔")) {
                        const startIndex = message.indexOf("【");
                        const filteredMessage = message.substring(startIndex);
                        const cardName = filteredMessage.split("﹕")[0];
                        const cardLocation = filteredMessage.split("﹕")[1];
                        if (filteredMessage.startsWith("【MEMORY】")) {
                            const oldMemory = parseInt(cardLocation.split("±")[0]);
                            const newMemory = parseInt(cardLocation.split("±")[1]);
                            return (
                                <UpdateMessage isMyMessage={isMyMessage} key={"msx_" + index}>
                                    <p>
                                        {cardName}{" "}
                                        {isMyMessage
                                            ? `${oldMemory.toString()} ➟ ${newMemory.toString()}`
                                            : `${(-oldMemory).toString()} ➟ ${(-newMemory).toString()}`}
                                    </p>
                                </UpdateMessage>
                            );
                        }
                        return (
                            <UpdateMessage isMyMessage={isMyMessage} key={"msx_" + index}>
                                <p>
                                    {cardName} {cardLocation}
                                </p>
                            </UpdateMessage>
                        );
                    }

                    return (
                        <Message isMyMessage={isMyMessage} key={"msx_" + index}>
                            <p>{chatMessage}</p>
                        </Message>
                    );
                })}
            </History>
            {sendChatMessage && (
                <InputContainer onSubmit={handleSubmit}>
                    <StyledInput
                        value={myMessage}
                        placeholder="..."
                        onChange={(e) => setMyMessage(e.target.value)}
                    ></StyledInput>
                    <StyledButton>
                        <img alt="send" src={sendIcon} />
                    </StyledButton>
                </InputContainer>
            )}
            {!sendChatMessage && (
                <div
                    style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "12px",
                        borderTop: "1px solid rgba(42, 246, 246, 0.175)",
                    }}
                >
                    Test Mode - Read Only History
                </div>
            )}
        </>
    );
}

const Message = styled.div<{ isMyMessage: boolean }>`
    max-width: 85%;
    width: fit-content;
    height: fit-content;
    align-self: ${({ isMyMessage }) => (isMyMessage ? "flex-end" : "flex-start")};
    background: rgba(12, 12, 12, 0.4);
    border-radius: 5px;
    padding: 1px 4px 1px 4px;
    display: flex;
    border: 1px solid ${({ isMyMessage }) => (isMyMessage ? "rgba(29,159,221,0.6)" : "rgba(255,81,118,0.4)")};
    margin-right: 4px;
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
    height: 96%;
    width: 98%;
    overflow-y: scroll;
    overflow-x: hidden;
    gap: 3px;
    z-index: 100;
    padding-bottom: 2px;

    border-bottom: 1px solid rgba(42, 246, 246, 0.175);

    @supports (-moz-appearance: none) {
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
    border-radius: 2px 5px 5px 2px;
    background: rgba(14, 252, 252, 0.59);
    font-size: 24px;
    color: #0e0e0e;
    box-shadow: 2px 2px 2px 0 #262626;
    transition: all 0.15s ease;

    img {
        transform: translateY(1px);
        width: 24px;
        height: 24px;
        pointer-events: none;
    }

    &:hover {
        background-color: rgba(18, 253, 218, 0.9);
        color: black;
        border: none;

        img {
            transform: translateY(2px);
        }
    }

    &:focus {
        outline: none;
    }

    &:active {
        background: #31da86;
        transform: translateY(1px);
    }
`;

const StyledInput = styled.input`
    width: 90%;
    overflow-y: clip;
    height: 30px;
    font-family: Frutiger, sans-serif;
    border: none;
    font-size: 1.05em;
    background: rgba(255, 239, 213, 0.25);
    color: #1a1a1a;
    border-radius: 5px 2px 2px 5px;

    :focus {
        outline: none;
        filter: drop-shadow(0 0 2px ghostwhite);
        background: rgb(250, 250, 250);
    }
`;

const InputContainer = styled.form`
    width: 98%;
    padding: 1%;
    margin-bottom: 1%;
    height: fit-content;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
`;

const UpdateMessage = styled.div<{ isMyMessage?: boolean }>`
    display: flex;
    width: 96%;
    height: fit-content;
    align-self: flex-start;
    background: ${({ isMyMessage }) => (isMyMessage ? "rgba(29,159,221,0.25)" : "rgba(255,81,118,0.2)")};
    padding: 1px 4px 0 4px;

    p {
        font-family: Cousine, sans-serif;
        color: papayawhip;
        margin: 3px;
        width: 100%;
        max-width: 100%;
        text-align: left;
        opacity: 0.8;
        font-size: 0.8em;
    }
`;
