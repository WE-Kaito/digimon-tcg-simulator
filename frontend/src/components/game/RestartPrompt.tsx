import {CancelSurrenderButton as CancelButton, AcceptButton, Container, StyledSpan} from "./SurrenderRestartWindow.tsx";

type Props = {
    closeModal: () => void,
    sendRequest: (request: "AsSecond" | "AsFirst") => void,
}

export default function RestartPrompt( { closeModal, sendRequest }: Props ) {
    return (
        <Container style={{width: 650}}>
            <StyledSpan>Send Rematch request:</StyledSpan>
            <div style={{width: 560, display: "flex", justifyContent: "space-between"}}>
                <AcceptButton onClick={() => sendRequest("AsFirst")}>GO FIRST</AcceptButton>
                <AcceptButton style={{ backgroundColor: "#fad219"}}  onClick={() => sendRequest("AsSecond")}>GO SECOND</AcceptButton>
                <CancelButton onClick={closeModal}>CANCEL</CancelButton>
            </div>
        </Container>
    );
}
