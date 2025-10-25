import { useState } from "react";
import { Button } from "../Button.tsx";
import styled from "@emotion/styled";
import { Chip } from "@mui/material";
import useQuery from "../../hooks/useQuery.ts";
import useMutation from "../../hooks/useMutation.ts";

export default function BannedUsers() {
    const { data: bannedUsers, isFetching, refetch } = useQuery<string[]>("/api/admin/banned");
    const { mutate: ban, isPending: isPendingBan } = useMutation("/api/admin/ban", "PUT");
    const { mutate: unban, isPending: isPendingUnban } = useMutation("/api/admin/unban", "PUT");

    const [username, setUsername] = useState("");

    function addBannedUser() {
        ban({ pathVariable: "/" + username.trim() })
            .then(() => setUsername(""))
            .finally(() => refetch());
    }

    function removeBannedUser(bannedUsername: string) {
        unban({ pathVariable: "/" + bannedUsername }).finally(() => refetch());
    }

    return (
        <Wrapper>
            <span style={{ fontFamily: "Naston, sans-serif", color: "#1d7dfc" }}>Banned Users:</span>
            <InputRow>
                <StyledInput
                    placeholder="Enter username to ban"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isFetching || isPendingBan || isPendingUnban}
                />
                <Button
                    onClick={addBannedUser}
                    disabled={
                        !username.trim() ||
                        bannedUsers?.includes(username.trim()) ||
                        isFetching ||
                        isPendingBan ||
                        isPendingUnban
                    }
                >
                    ADD
                </Button>
            </InputRow>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {bannedUsers?.map((username) => (
                    <StyledChip
                        key={username}
                        label={username}
                        onDelete={() => removeBannedUser(username)}
                        disabled={isFetching || isPendingBan || isPendingUnban}
                        variant="outlined"
                    />
                ))}
            </div>

            {!bannedUsers?.length && <span color="rgba(255, 255, 255, 0.7)">No banned users</span>}
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
