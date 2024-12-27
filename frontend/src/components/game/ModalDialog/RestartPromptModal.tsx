import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {WSUtils} from "../../../pages/GamePage.tsx";
import ModalDialog from "./ModalDialog.tsx";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

export default function RestartPromptModal({ wsUtils } : { wsUtils: WSUtils }) {
    const { sendMessage, matchInfo: { gameId, opponentName, user } } = wsUtils;

    const [
        restartOrder,
        restartPromptModal,
        setRestartPromptModal,
        setIsRematch
    ] = useGameUIStates((state) => [
        state.restartOrder,
        state.restartPromptModal,
        state.setRestartPromptModal,
        state.setIsRematch
    ]);

    const clearBoard = useGameBoardStates((state) => state.clearBoard);

    function handleAcceptRestart() {
        clearBoard();
        setRestartPromptModal(false);
        setIsRematch(true);
        sendMessage(`${gameId}:/acceptRestart:${opponentName}`);
        sendMessage(`${gameId}:/restartGame:${restartOrder === "first" ? user : opponentName}`);
    }

    const buttonProps = [
        { text: "DENY", onClick: () => setRestartPromptModal(false), color: "#C03427" },
        { text: `ACCEPT ► GOING ${restartOrder}`, onClick: handleAcceptRestart, color: "#27C06E" },
    ]

    if (!restartPromptModal) return <></>;

    return <ModalDialog text={"Opponent requested a rematch!"} buttonProps={buttonProps} />
}
