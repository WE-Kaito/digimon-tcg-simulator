import styled from "@emotion/styled";
import { Chip } from "@mui/material";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Button } from "../Button.tsx";
import { notifyError } from "../../utils/toasts.ts";

export default function BlockedUsers() {
    const [newUsername, setNewUsername] = useState("");
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const response = await axios.get("/api/user/blocked");
            setBlockedUsers(response.data.sort());
        } catch (error) {
            console.error("Failed to fetch blocked users:", error);
        }
    };

    const addBlockedUser = async (username: string) => {
        try {
            setLoading(true);
            const response = await axios.post(`/api/user/blocked/${username}`);
            if (response.data.includes("Error")) notifyError(response.data.substring("Error: ".length));
        } catch (error) {
            console.error("Failed to block user:", error);
        } finally {
            fetchBlockedUsers();
            setLoading(false);
        }
    };

    const removeBlockedUser = async (username: string) => {
        try {
            setLoading(true);
            const response = await axios.delete(`/api/user/blocked/${username}`);
            if (response.data.includes("Error")) notifyError(response.data.substring("Error: ".length));
        } catch (error) {
            console.error("Failed to unblock user:", error);
        } finally {
            fetchBlockedUsers();
            setLoading(false);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedUsername = newUsername.trim();

        if (!trimmedUsername) return;

        if (blockedUsers.includes(trimmedUsername)) {
            alert("User is already blocked");
            setNewUsername("");
            return;
        }

        addBlockedUser(trimmedUsername);
        setNewUsername("");
    };

    const handleRemoveUser = (usernameToRemove: string) => {
        removeBlockedUser(usernameToRemove);
    };

    return (
        <Wrapper>
            <span style={{ fontFamily: "Naston, sans-serif", color: "#1d7dfc" }}>Blocked Users:</span>
            <form onSubmit={handleSubmit}>
                <InputRow>
                    <StyledInput
                        placeholder="Enter username to block"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !newUsername.trim()}>
                        ADD
                    </Button>
                </InputRow>
            </form>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {blockedUsers.map((username) => (
                    <StyledChip
                        key={username}
                        label={username}
                        onDelete={() => handleRemoveUser(username)}
                        disabled={loading}
                        variant="outlined"
                    />
                ))}
            </div>

            {blockedUsers.length === 0 && <span color="rgba(255, 255, 255, 0.7)">No blocked users</span>}
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

const InputRow = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

const StyledChip = styled(Chip)`
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
    border-color: rgba(241, 185, 73, 0.53);

    .MuiChip-deleteIcon {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
            color: #ff1b58;
        }
    }

    &:hover {
        background-color: rgba(12, 12, 12, 0.9);
    }

    &.Mui-disabled {
        opacity: 0.5;
    }
`;

const StyledInput = styled.input`
    width: 243px;
    height: 32px;
    background: #242424;
    font-family: Cousine, sans-serif;

    &:focus {
        outline: 2px solid #1d7dfc;
        outline-offset: -2px;
    }
`;
