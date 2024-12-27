import {Dispatch, SetStateAction} from "react";
import {WSUtils} from "../../../pages/GamePage.tsx";
import {notifyRequestedRestart} from "../../../utils/toasts.ts";
import ModalDialog from "./ModalDialog.tsx";

type Props = {
    setRestartRequestModal: Dispatch<SetStateAction<boolean>>,
    wsUtils: WSUtils,
}

export default function RestartRequestModal( { setRestartRequestModal, wsUtils }: Props ) {
    const { sendMessage, matchInfo: { gameId, opponentName } } = wsUtils;

    function sendRequest(order: "AsFirst" | "AsSecond") {
        sendMessage(`${gameId}:/restartRequest${order}:${opponentName}`);
        notifyRequestedRestart();
        setRestartRequestModal(false);
    }

    const buttonProps = [
        { text: "GO FIRST", onClick: () => sendRequest("AsFirst"), color: "#1a99e8" },
        { text: "GO SECOND", onClick: () => sendRequest("AsFirst"), color: "#e79831" },
        { text: "CANCEL", onClick: () => setRestartRequestModal(false), color: "#D9D9D9" },
    ]

    return <ModalDialog text={"Send Rematch request:"} buttonProps={buttonProps}/>;
}
