import ModalDialog from "./ModalDialog.tsx";

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ReturnToGameLobbyModal({ onConfirm, onCancel }: Props) {
    const buttonProps = [
        { text: "YES", onClick: onConfirm, color: "#27C06E" },
        { text: "NO", onClick: onCancel, color: "#C03427" },
    ];

    return <ModalDialog text="Would you like to return back to the Game Lobby?" buttonProps={buttonProps} />;
}
