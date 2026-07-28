import { WSUtils } from "../../../pages/GamePage.tsx";
import { Dispatch, SetStateAction } from "react";
import ModalDialog from "./ModalDialog.tsx";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";

type Props = {
    setSurrenderModal: Dispatch<SetStateAction<boolean>>;
    wsUtils: WSUtils;
};

export default function SurrenderModal({ setSurrenderModal, wsUtils }: Props) {
    const {
        sendMessage,
        matchInfo: { gameId },
    } = wsUtils;

    const setIsEndDialogOpen = useGameUIStates((state) => state.setIsEndDialogOpen);
    const setEndDialogText = useGameUIStates((state) => state.setEndDialogText);
    const setEndedBySurrender = useGameUIStates((state) => state.setEndedBySurrender);
    const setRestartPromptModal = useGameUIStates((state) => state.setRestartPromptModal);

    function handleSurrender() {
        setSurrenderModal(false);
        setRestartPromptModal(false);
        setEndedBySurrender(true);
        setIsEndDialogOpen(true);
        setEndDialogText("🏳️ You surrendered.");
        sendMessage(`${gameId}:/surrender`);
        // if (onlineCheckTimeoutRef.current !== null) {
        //   clearTimeout(onlineCheckTimeoutRef.current);
        //   onlineCheckTimeoutRef.current = null;
        // }
    }

    const buttonProps = [
        { text: "SURRENDER", onClick: handleSurrender, color: "#C03427" },
        { text: "CANCEL", onClick: () => setSurrenderModal(false), color: "#D9D9D9" },
    ];

    return <ModalDialog text={"Do you want to surrender?"} buttonProps={buttonProps} />;
}
