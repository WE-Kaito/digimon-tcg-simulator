import { DialogContent, DialogTitle, TextField } from "@mui/material";
import MenuDialog from "../../MenuDialog.tsx";
import styled from "@emotion/styled";
import { WSUtils } from "../../../pages/GamePage.tsx";
import { Dispatch, SetStateAction, useState } from "react";
import useMutation from "../../../hooks/useMutation.ts";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";

type ReportDialogProps = {
    matchInfo: WSUtils["matchInfo"];
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ReportDialog({ matchInfo, isOpen, setIsOpen }: ReportDialogProps) {
    const messages = useGameBoardStates((state) => state.messages);

    const [reportMessage, setReportMessage] = useState("");

    const { mutate, isPending } = useMutation("/api/report", "POST");

    function handleSendReport() {
        sendReport(reportMessage, messages, matchInfo, mutate).then(() => setIsOpen(false));
        localStorage.setItem("isReported", JSON.stringify(true));
    }

    const extendedLabel = reportMessage.length >= 700 ? ` ${reportMessage.length}/800` : "";

    return (
        <MenuDialog onClose={() => setIsOpen(false)} open={isOpen}>
            <StyledDialogTitle>{"Report " + matchInfo.opponentName + ":"}</StyledDialogTitle>
            <DialogContent>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        alignItems: "center",
                        width: 300,
                        maxWidth: "100vw",
                        padding: 5,
                    }}
                >
                    <span style={{ fontFamily: "League Spatan, sans-serif", color: "ghostwhite" }}>
                        A report containing the chat history will be sent to the moderators for review. You can only
                        file one report per game.
                    </span>
                    <StyledTextField
                        label={"Reason" + extendedLabel}
                        variant="outlined"
                        multiline
                        rows={5}
                        fullWidth
                        focused
                        color={reportMessage.length >= 800 ? "error" : "warning"}
                        value={reportMessage}
                        onChange={(e) => {
                            if (e.target.value.length <= 800) setReportMessage(e.target.value);
                        }}
                    />
                    <StyledButton disabled={reportMessage.length === 0 || isPending} onClick={handleSendReport}>
                        SUBMIT REPORT
                    </StyledButton>
                    <CancelButton onClick={() => setIsOpen(false)}>CANCEL</CancelButton>
                </div>
            </DialogContent>
        </MenuDialog>
    );
}

async function sendReport(
    reportMessage: string,
    messages: string[],
    matchInfo: WSUtils["matchInfo"],
    mutate: <T>(options?: { payload: any }) => Promise<T | null>
) {
    const history = formatTextMessagesForReport(messages, matchInfo);
    const historyChunks = splitStringAtNearestNewline(history, 1024); // discords maxlength for a field. (might be a little higher)

    for (let i = 0; i < historyChunks.length; i++) {
        const chunk = historyChunks[i];

        await mutate({
            payload: {
                embeds: [
                    {
                        fields: [
                            { name: "`From`", value: matchInfo.user, inline: true },
                            { name: "`Reported User`", value: matchInfo.opponentName, inline: true },
                            ...(historyChunks.length > 1
                                ? [
                                      {
                                          name: "`Part`",
                                          value: `${i + 1}/${historyChunks.length}`,
                                          inline: true,
                                      },
                                  ]
                                : []),
                            ...(i === 0 ? [{ name: "`Message`", value: reportMessage }] : []),
                            { name: "`Chat History`", value: chunk },
                        ],
                    },
                ],
            },
        });

        // Add delay between requests to respect Discord's rate limit (5 requests per second)
        if (i < historyChunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
}

function formatTextMessagesForReport(messages: string[], matchInfo: WSUtils["matchInfo"]): string {
    return messages
        .map((message) => {
            if (message.startsWith("[STARTING_PLAYER]≔")) return "";

            const userName = message.split("﹕", 2)[0];
            const isMyMessage = userName === matchInfo.user;
            const chatMessage = message.split("﹕", 2)[1];

            const from = isMyMessage ? matchInfo.user : matchInfo.opponentName;

            if (chatMessage.startsWith("[FIELD_UPDATE]≔")) {
                return "*" + from + " plays " + chatMessage.split("≔")[1] + "*";
            }

            return "**" + from + ":** " + chatMessage;
        })
        .reverse()
        .join("\n");
}

function splitStringAtNearestNewline(str: string, maxLength: number) {
    const chunks = [];
    let start = 0;

    while (start < str.length) {
        // Find the substring from the current position to maxLength
        const nextChunk = str.slice(start, start + maxLength);

        // Find the last newline in the substring
        const lastNewlineIndex = nextChunk.lastIndexOf("\n");

        if (lastNewlineIndex !== -1) {
            // If a newline exists, split at the newline
            chunks.push(str.slice(start, start + lastNewlineIndex + 1));
            start += lastNewlineIndex + 1; // Move the start position
        } else {
            // If no newline is found, take the entire chunk
            chunks.push(nextChunk);
            start += maxLength;
        }
    }

    return chunks;
}

const StyledDialogTitle = styled(DialogTitle)`
    font-family:
        League Spartan,
        sans-serif;
    font-size: 24px;
    color: ghostwhite;
    margin-left: 5px;
    padding-bottom: 0;
`;

const StyledTextField = styled(TextField)`
    .MuiInputBase-root {
        color: ghostwhite;
        font-family: Cousine, sans-serif;
    }
`;

const StyledButton = styled.button<{ disabled: boolean }>`
    width: fit-content;
    height: 2.5em;
    flex-shrink: 0;
    border-radius: 0;
    background: ${({ disabled }) => (disabled ? "#62421BFF" : "#c97e1d")};
    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};
    font-family:
        Pixel Digivolve,
        sans-serif;
    font-size: 20px;
    color: #0c0c0c;
    box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
    transition: all 0.15s ease;

    &:hover {
        background: #efb447;
        transform: translateY(1px);
        filter: contrast(1.15) saturate(1.25);
        box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
    }

    &:focus {
        outline: none;
    }

    &:active {
        background: #efc847;
        transform: translateY(2px);
        filter: contrast(1.3) saturate(1.25);
        box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
    }
`;

const CancelButton = styled.button`
    width: fit-content;
    height: 2.5em;
    flex-shrink: 0;
    border-radius: 0;
    background: whitesmoke;
    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};
    font-family:
        Pixel Digivolve,
        sans-serif;
    font-size: 20px;
    color: #0c0c0c;
    box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
    transition: all 0.15s ease;

    &:hover {
        background: ghostwhite;
        transform: translateY(1px);
        filter: contrast(1.15) saturate(1.25);
        box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
    }

    &:focus {
        outline: none;
    }

    &:active {
        background: ghostwhite;
        transform: translateY(2px);
        filter: contrast(1.3) saturate(1.25);
        box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
    }
`;
