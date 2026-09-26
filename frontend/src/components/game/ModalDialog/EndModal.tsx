import { useNavigate } from "react-router-dom";
import ModalDialog from "./ModalDialog.tsx";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";
import { returnToLobby } from "../../../utils/returnToLobby.ts";

export default function EndModal() {
    const isEndDialogOpen = useGameUIStates((state) => state.isEndDialogOpen);
    const setIsEndDialogOpen = useGameUIStates((state) => state.setIsEndDialogOpen);
    const endDialogText = useGameUIStates((state) => state.endDialogText);

    const navigate = useNavigate();

    const buttonProps = [
        {
            text: "EXIT",
            onClick: () => returnToLobby(navigate),
            color: "#FCCB0B",
        },
        { text: "CLOSE DIALOG", onClick: () => setIsEndDialogOpen(false), color: "#FCCB0B" },
    ];

    if (!isEndDialogOpen) return <></>;

    return <ModalDialog text={endDialogText} buttonProps={buttonProps} />;
}
