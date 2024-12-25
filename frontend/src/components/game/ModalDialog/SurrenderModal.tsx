import {WSUtils} from "../../../pages/GamePage.tsx";
import {Dispatch, SetStateAction} from "react";
import ModalDialog from "./ModalDialog.tsx";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

type Props = {
    setSurrenderModal: Dispatch<SetStateAction<boolean>>,
    wsUtils: WSUtils,
}

export default function SurrenderModal( { setSurrenderModal, wsUtils }: Props ) {
    const { sendMessage, matchInfo: { gameId, opponentName } } = wsUtils;

    const [setEndModal, setEndModalText] = useGameUIStates((state) => [state.setEndModal, state.setEndModalText]);

    function handleSurrender() {
        setSurrenderModal(false);
        setEndModal(true);
        setEndModalText("🏳️ You surrendered.");
        sendMessage(`${gameId}:/surrender:${opponentName}`);
        // if (onlineCheckTimeoutRef.current !== null) {
        //   clearTimeout(onlineCheckTimeoutRef.current);
        //   onlineCheckTimeoutRef.current = null;
        // }
    }

    const buttonProps = [
        { text: "SURRENDER", onClick: handleSurrender, color: "#C03427" },
        { text: "CANCEL", onClick: () => setSurrenderModal(false), color: "#D9D9D9" },
    ]

    return <ModalDialog text={"Do you want to surrender?"} buttonProps={buttonProps} />;
}
