import styled from "@emotion/styled";
import { FormEvent, useState } from "react";
import { Button } from "../Button.tsx";
import axios from "axios";
import { notifySuccess, notifyError } from "../../utils/toasts.ts";

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const isValidInput = newPassword.length >= 6 && repeatPassword.length >= 6 && newPassword === repeatPassword;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isValidInput) {
            if (newPassword.length < 6 || repeatPassword.length < 6) {
                notifyError("Password must be at least 6 characters long.");
            } else {
                notifyError("Passwords do not match.");
            }
            return;
        }

        axios
            .put("/api/user/change-password", newPassword, { headers: { "Content-Type": "text/plain" } })
            .then(() => {
                notifySuccess("Password changed successfully!");
                setNewPassword("");
                setRepeatPassword("");
            })
            .catch((error) => {
                console.error("Error changing password:", error);
                notifyError("Error changing password. Please try again.");
            });
    }

    return (
        <Wrapper>
            <div style={{ gap: 8, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Naston, sans-serif", color: "#1d7dfc" }}>Change Password:</span>
                <ChangePasswordForm onSubmit={handleSubmit}>
                    <StyledInput
                        name="newPassword"
                        type="password"
                        placeholder="New password"
                        autoComplete="new-password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                            borderColor: newPassword
                                ? newPassword.length < 6
                                    ? "coral"
                                    : "mediumaquamarine"
                                : undefined,
                        }}
                    />
                    <StyledInput
                        name="repeatPassword"
                        type="password"
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        minLength={6}
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        style={{
                            borderColor:
                                repeatPassword && newPassword.length >= 6
                                    ? newPassword !== repeatPassword
                                        ? "coral"
                                        : "mediumaquamarine"
                                    : undefined,
                        }}
                    />
                    <Button type="submit" disabled={!isValidInput}>
                        SAVE
                    </Button>
                </ChangePasswordForm>
            </div>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    @media (max-width: 1100px) {
        justify-content: center;
    }
`;

const ChangePasswordForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
`;

const StyledInput = styled.input<{ value: string }>`
    width: 243px;
    height: 32px;
    background: #242424;
    font-family: Cousine, sans-serif;

    &:focus {
        outline: ${({ value }) => (value ? "none" : "2px solid #1d7dfc")};
        outline-offset: -2px;
    }
`;
