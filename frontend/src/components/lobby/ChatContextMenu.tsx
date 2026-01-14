import { Item, ItemParams, Separator } from "react-contexify";
import { DeleteForever as TrashIcon, Report as ReportIcon } from "@mui/icons-material";
import { StyledMenu } from "../game/ContextMenus/ContextMenus.tsx";
import axios from "axios";
import "react-contexify/dist/ReactContexify.css";
import { notifyError, notifySuccess } from "../../utils/toasts.ts";
import { ChatMessage } from "./Chat.tsx";
import useMutation from "../../hooks/useMutation.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function ChatContextMenu({ isAdmin }: { isAdmin: boolean }) {
    const user = useGeneralStates((state) => state.user);
    const { mutate, isPending } = useMutation("/api/report", "POST");

    function handleDeleteMessage({ props }: ItemParams<ChatMessage>) {
        if (props === undefined) return;

        axios
            .delete(`/api/admin/chat/${props.id}`)
            .then(() => notifySuccess("Message deleted!"))
            .catch((error) => notifyError(error));
    }

    async function handleReportMessage({ props }: ItemParams<ChatMessage>) {
        if (props === undefined || isPending) return;

        await mutate({
            payload: {
                embeds: [
                    {
                        fields: [
                            { name: "`From`", value: user, inline: true },
                            { name: "`Reported User`", value: props.author, inline: true },
                            { name: "`Global Chat Message:`", value: props.message },
                        ],
                    },
                ],
            },
        });
    }

    return (
        <StyledMenu id="chat-message-menu" theme="dark">
            {isAdmin && (
                <Item onClick={handleDeleteMessage}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <span>Delete Message</span>
                        <TrashIcon color="warning" />
                    </div>
                </Item>
            )}
            {isAdmin && <Separator />}
            <Item onClick={handleReportMessage}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Report Message</span>
                    <ReportIcon color="error" />
                </div>
            </Item>
        </StyledMenu>
    );
}
