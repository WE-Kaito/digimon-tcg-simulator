import {ReportOutlined as ReportIcon} from "@mui/icons-material";
import {DialogContent, DialogTitle, IconButton, TextField} from "@mui/material";
import {WSUtils} from "../../pages/GamePage.tsx";
import axios from "axios";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import MenuDialog from "../MenuDialog.tsx";
import {useState} from "react";
import styled from "@emotion/styled";

export default function ReportButton({ matchInfo } : { matchInfo: WSUtils["matchInfo"] }) {
    const messages = useGameBoardStates(state => state.messages);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState("");

    const isDisabled = localStorage.getItem("isReported") === "true";

    function handleSendReport() {
        sendReport(reportMessage, messages, matchInfo).catch(console.error); //TODO: Toast error message
        setIsReportDialogOpen(false);
        localStorage.setItem("isReported", JSON.stringify(true));
    }

    const extendedLabel = reportMessage.length >= 700 ? ` ${reportMessage.length}/800` : "";

    return (
        <>
            <MenuDialog onClose={() => setIsReportDialogOpen(false)} open={isReportDialogOpen}>
                <StyledDialogTitle>
                    {"Report " + matchInfo.opponentName + ":"}
                </StyledDialogTitle>
                <DialogContent>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", width: 300, maxWidth: "100vw", padding: 5 }}>
                        <span style={{ fontFamily: "League Spatan, sans-serif", color: "ghostwhite", }}>
                            A report containing the chat history will be sent to the moderators for review. You can only file one report per game.
                        </span>
                        <StyledTextField label={"Reason" + extendedLabel} variant="outlined" multiline rows={5}
                                         fullWidth focused color={reportMessage.length >= 800 ? "error" : "warning"} value={reportMessage}
                                         onChange={(e) => { if (e.target.value.length <= 800) setReportMessage(e.target.value) }}/>
                        <StyledButton disabled={reportMessage.length === 0} onClick={handleSendReport}>
                            SUBMIT REPORT
                        </StyledButton>
                        <CancelButton onClick={() => setIsReportDialogOpen(false)}>
                            CANCEL
                        </CancelButton>
                    </div>
                </DialogContent>
            </MenuDialog>

            <IconButton disabled={isDisabled} onClick={() => setIsReportDialogOpen(true)}
                        sx={{ color: "indianred", opacity: 0.7,
            }}>
                <ReportIcon fontSize={"large"} />
            </IconButton>
        </>
    );
}

async function sendReport(reportMessage: string, messages: string[], matchInfo: WSUtils["matchInfo"]) {
    const history = formatTextMessagesForReport(messages, matchInfo);
    if (history.length > 5000) {
        const historyChunks = splitStringAtNearestNewline(history, 5000);
        const additionalChunks = historyChunks.slice(1);

        const returnedValue = axios.post("/api/report", {
            embeds: [
                {
                    title: `1/${historyChunks.length}`,
                    fields: [
                        { name: "`From`", value: matchInfo.user, inline: true },
                        { name: "`Reported User`", value: matchInfo.opponentName, inline: true },
                        { name: "`Message`", value: reportMessage },
                        { name: "`Chat History`", value: historyChunks[0] },
                    ],
                },
            ],
        });

        additionalChunks.forEach((chunk, index) => {
            axios.post("/api/report", {
                embeds: [
                    {
                        title: `Report from ${matchInfo.user} for ${matchInfo.opponentName} ${index + 2}/${historyChunks.length}`,
                        fields: [
                            { name: "`Chat History`", value: chunk },
                        ],
                    },
                ],
            });
        });

        return returnedValue;
    }

    return axios.post("/api/report", {
        embeds: [
            {
                fields: [
                    { name: "`From`", value: matchInfo.user, inline: true },
                    { name: "`Reported User`", value: matchInfo.opponentName, inline: true },
                    { name: "`Message`", value: reportMessage },
                    ...(messages.length > 1
                        ? [{ name: "`Chat History`", value: formatTextMessagesForReport(messages, matchInfo) }]
                        : []),
                ],
            },
        ],
    });
}

function formatTextMessagesForReport(messages: string[], matchInfo: WSUtils["matchInfo"]): string {
    return messages.map((message) => {
        if (message.startsWith("[STARTING_PLAYER]≔")) return "";

        const userName = message.split("﹕", 2)[0];
        const isMyMessage = userName === matchInfo.user;
        const chatMessage = message.split("﹕", 2)[1];

        if (chatMessage.startsWith("[FIELD_UPDATE]≔")) return "";

        const from = isMyMessage ? matchInfo.user : matchInfo.opponentName;

        return "**" + from + ":** " +  chatMessage;
    }).reverse().join("\n");
}

function splitStringAtNearestNewline(str: string, maxLength: number) {
    const chunks = [];
    let start = 0;

    while (start < str.length) {
        // Find the substring from the current position to maxLength
        const nextChunk = str.slice(start, start + maxLength);

        // Find the last newline in the substring
        const lastNewlineIndex = nextChunk.lastIndexOf('\n');

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
    font-family: League Spartan, sans-serif;
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
  cursor: pointer;
  width: fit-content;
  height: 2.5em;
  flex-shrink: 0;
  border-radius: 0;
  background: ${({disabled}) => disabled ? "#62421BFF" : "#c97e1d"};
  pointer-events: ${({disabled}) => disabled ? "none" : "unset"};
  font-family: Pixel Digivolve, sans-serif;
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
  cursor: pointer;
  width: fit-content;
  height: 2.5em;
  flex-shrink: 0;
  border-radius: 0;
  background: whitesmoke;
  pointer-events: ${({disabled}) => disabled ? "none" : "unset"};
  font-family: Pixel Digivolve, sans-serif;
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
