import { Item, ItemParams } from "react-contexify";
import { DeleteForever as TrashIcon } from "@mui/icons-material";
import { StyledMenu } from "../game/ContextMenus/ContextMenus.tsx";
import axios from "axios";
import "react-contexify/dist/ReactContexify.css";
import { notifyError, notifySuccess } from "../../utils/toasts.ts";

export default function ChatContextMenu() {
    function handleDeleteMessage({ props }: ItemParams<{ messageId: string }>) {
        if (props === undefined) return;

        axios
            .delete(`/api/admin/chat/${props.messageId}`)
            .then(() => notifySuccess("Message deleted!"))
            .catch((error) => notifyError(error));
    }

    return (
        <StyledMenu id="chat-message-menu" theme="dark">
            <Item onClick={handleDeleteMessage}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Delete Message</span>
                    <TrashIcon color="error" />
                </div>
            </Item>
        </StyledMenu>
    );
}
