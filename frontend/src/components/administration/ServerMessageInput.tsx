import { useState } from "react";
import { Button } from "../Button.tsx";
import styled from "@emotion/styled";
import useMutation from "../../hooks/useMutation.ts";

export default function ServerMessageInput() {
    const { mutate: sendMessage, isPending } = useMutation("/api/admin/server-message", "POST");

    const [message, setMessage] = useState("");

    function sendServerMessage() {
        sendMessage({ payload: { message: message.trim() } }).then(() => setMessage(""));
    }

    return (
        <Wrapper>
            <span style={{ fontFamily: "Naston, sans-serif", color: "#1d7dfc" }}>Send server message:</span>
            <StyledInput
                placeholder="Enter message to be sent to all chats"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPending}
            />
            <Button onClick={sendServerMessage} disabled={!message.trim() || isPending}>
                SEND
            </Button>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 8px;
`;

const StyledInput = styled.input`
    width: 100%;
    max-width: 503px;
    height: 32px;
    background: #242424;
    font-family: Cousine, sans-serif;

    &:focus {
        outline: 2px solid #1d7dfc;
        outline-offset: -2px;
    }
`;
