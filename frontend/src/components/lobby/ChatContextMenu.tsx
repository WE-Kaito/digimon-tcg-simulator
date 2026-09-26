import { Item, ItemParams, Separator } from "react-contexify";
import {
    Cancel as CancelIcon,
    DeleteForever as TrashIcon,
    PersonAdd as InviteIcon,
    Report as ReportIcon,
} from "@mui/icons-material";
import { StyledMenu } from "../game/ContextMenus/ContextMenus.tsx";
import axios from "axios";
import "react-contexify/dist/ReactContexify.css";
import { notifyError, notifySuccess } from "../../utils/toasts.ts";
import { ChatMessage } from "./Chat.tsx";
import useMutation from "../../hooks/useMutation.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { SendMessage } from "react-use-websocket";

type Props = {
    isAdmin: boolean;
    sendMessage: SendMessage;
    onInviteSent: (player: string) => void;
    onInviteCancelled: (player: string) => void;
    pendingGameInvites: Set<string>;
    inviteCooldownPlayers: Set<string>;
};

export default function ChatContextMenu({
    isAdmin,
    sendMessage,
    onInviteSent,
    onInviteCancelled,
    pendingGameInvites,
    inviteCooldownPlayers,
}: Props) {
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

    function handleInviteToGame({ props }: ItemParams<ChatMessage>) {
        if (props === undefined || props.author === user || props.author === "【SERVER】") return;

        if (inviteCooldownPlayers.has(props.author)) return;

        if (pendingGameInvites.has(props.author)) {
            sendMessage(`/cancelGameInvite:${props.author}`);
            onInviteCancelled(props.author);
            return;
        }

        sendMessage(`/inviteToGame:${props.author}`);
        onInviteSent(props.author);
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
            <Item
                onClick={handleInviteToGame}
                hidden={({ props }) => {
                    const player = (props as ChatMessage | undefined)?.author ?? "";
                    return (
                        ["【SERVER】", user].includes(player) ||
                        pendingGameInvites.has(player) ||
                        inviteCooldownPlayers.has(player)
                    );
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Invite to Game</span>
                    <InviteIcon color="primary" />
                </div>
            </Item>
            <Item
                disabled
                hidden={({ props }) => {
                    const player = (props as ChatMessage | undefined)?.author ?? "";
                    return ["【SERVER】", user].includes(player) || !inviteCooldownPlayers.has(player);
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Invite Cooldown</span>
                    <InviteIcon color="disabled" />
                </div>
            </Item>
            <Item
                onClick={handleInviteToGame}
                hidden={({ props }) => {
                    const player = (props as ChatMessage | undefined)?.author ?? "";
                    return ["【SERVER】", user].includes(player) || !pendingGameInvites.has(player);
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Cancel Invite</span>
                    <CancelIcon color="error" />
                </div>
            </Item>
            <Separator />
            <Item onClick={handleReportMessage}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Report Message</span>
                    <ReportIcon color="error" />
                </div>
            </Item>
        </StyledMenu>
    );
}
