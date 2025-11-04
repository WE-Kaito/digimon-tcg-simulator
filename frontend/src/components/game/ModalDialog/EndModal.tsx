import { useNavigate } from "react-router-dom";
import ModalDialog from "./ModalDialog.tsx";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";

export default function EndModal() {
    const isEndDialogOpen = useGameUIStates((state) => state.isEndDialogOpen);
    const setIsEndDialogOpen = useGameUIStates((state) => state.setIsEndDialogOpen);
    const endDialogText = useGameUIStates((state) => state.endDialogText);

    const navigate = useNavigate();

    const buttonProps = [
        {
            text: "EXIT",
            onClick: () => {
                setIsEndDialogOpen(false);
                navigate("/lobby");
            },
            color: "#FCCB0B",
        },
        { text: "CLOSE DIALOG", onClick: () => setIsEndDialogOpen(false), color: "#FCCB0B" },
    ];

    if (!isEndDialogOpen) return <></>;

    return <ModalDialog text={endDialogText} buttonProps={buttonProps} />;
}
