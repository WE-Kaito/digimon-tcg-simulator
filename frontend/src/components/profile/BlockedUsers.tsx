import styled from "@emotion/styled";
import { TextField, Chip } from "@mui/material";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Button } from "../Button.tsx";

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
            if (response.data.includes("Error")) alert(response.data);
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
            if (response.data.includes("Error")) alert(response.data);
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
                    <StyledTextField
                        size="small"
                        placeholder="Enter username to block"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        disabled={loading}
                        variant="outlined"
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

const StyledTextField = styled(TextField)`
    .MuiOutlinedInput-root {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;

        .MuiOutlinedInput-notchedOutline {
            border-color: rgba(255, 255, 255, 0.3);
        }

        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: rgba(255, 255, 255, 0.5);
        }

        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: #1976d2;
        }
    }

    .MuiInputBase-input::placeholder {
        color: rgba(255, 255, 255, 0.7);
        opacity: 1;
    }
`;

const StyledChip = styled(Chip)`
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);

    .MuiChip-deleteIcon {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
            color: white;
        }
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    &.Mui-disabled {
        opacity: 0.5;
    }
`;
