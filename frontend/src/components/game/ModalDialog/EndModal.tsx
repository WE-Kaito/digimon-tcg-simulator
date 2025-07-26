import { useNavigate } from "react-router-dom";
import ModalDialog from "./ModalDialog.tsx";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";

export default function EndModal() {
    const endModal = useGameUIStates((state) => state.endModal);
    const setEndModal = useGameUIStates((state) => state.setEndModal);
    const endModalText = useGameUIStates((state) => state.endModalText);

    const navigate = useNavigate();

    const buttonProps = [
        {
            text: "EXIT",
            onClick: () => {
                setEndModal(false);
                navigate("/lobby");
            },
            color: "#FCCB0B",
        },
        { text: "CLOSE MODAL", onClick: () => setEndModal(false), color: "#FCCB0B" },
    ];

    if (!endModal) return <></>;

    return <ModalDialog text={endModalText} buttonProps={buttonProps} />;
}
