import {ReportOutlined as ReportIcon} from "@mui/icons-material";
import {IconButton} from "@mui/material";
import {WSUtils} from "../../pages/GamePage.tsx";
import axios from "axios";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";

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
// TODO: add token and id to secrets
function sendReport(messages: string[], matchInfo: WSUtils["matchInfo"]) {
    axios.post('https://discord.com/api/webhooks/1317425552826699806/SI4DNxqljDYzWwh_Q1ehMgyV6SvFbzTxp9vS8w1JooorzhhU0DiyeZyC-3BHaVBwspMK', {
        embeds: [{
            // title: "Test Report",
            fields: [
                {name: "`From`", value: matchInfo.user, inline: true},
                {name: "`Reported User`", value: matchInfo.opponentName, inline: true},
                {name: "`Message`", value: "Test text... "},
                messages.length > 1 && {name: "`Chat History`", value: formatTextMessagesForReport(messages, matchInfo) },
            ],
            // timestamp: new Date().toISOString(),
        }]
    })
}
// TODO: Implement Modal with a text area and Submit button before sending the report
export default function ReportButton({ matchInfo } : { matchInfo: WSUtils["matchInfo"] }) {
    const messages = useGameBoardStates(state => state.messages);
    return (
        <IconButton onClick={() => sendReport(messages, matchInfo)} sx={{ width: "fit-content", color: "coral" }}>
            <ReportIcon />
        </IconButton>
    );
}
