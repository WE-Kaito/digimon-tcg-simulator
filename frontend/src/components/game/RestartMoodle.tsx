import {CancelSurrenderButton, SurrenderButton, SurrenderMoodleContainer, SurrenderSpan} from "./SurrenderMoodle.tsx";
import styled from "@emotion/styled";

type Props = {
    setRestartMoodle: (restartMoodle:boolean) => void,
    sendAcceptRestart: () => void,
}

export default function RestartMoodle({setRestartMoodle, sendAcceptRestart}:Props) {
    return (
        <SurrenderMoodleContainer>
            <SurrenderSpan>Opponent requested a rematch</SurrenderSpan>
            <div style={{width: 390, display: "flex", justifyContent: "space-between"}}>
                <SurrenderButton
                    onClick={() => setRestartMoodle(false)}>DENY</SurrenderButton>
                <AcceptButton onClick={sendAcceptRestart}>ACCEPT</AcceptButton>
            </div>
        </SurrenderMoodleContainer>
    );
}

const AcceptButton = styled(CancelSurrenderButton)`
  background-color: #27c06e;
  &:hover {
    background: #3bdab5;
  }
  &:active {
    background: #27e747;
  }
`;
