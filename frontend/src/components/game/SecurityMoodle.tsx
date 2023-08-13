import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {Container, StyledSpan, StyledSpan2, StyledButton} from "./DeckMoodle.tsx";

type DeckMoodleProps = {
    cardToSendToSecurity: {id: string, location:string},
    sendUpdate: () => void
}

export default function SecurityMoodle({cardToSendToSecurity, sendUpdate} : DeckMoodleProps) {

    const sendCardToSecurity = useGame((state) => state.sendCardToSecurity);

    const handleClick = (topOrBottom: "top" | "bottom") => {
        sendCardToSecurity(topOrBottom, cardToSendToSecurity);
        sendUpdate();
    }

    return (
        <ButtonContainer>
            <StyledButton onClick={() => handleClick("top")}><StyledSpan>»</StyledSpan></StyledButton>
            <StyledButton onClick={() => handleClick("bottom")}><StyledSpan2>»</StyledSpan2></StyledButton>
        </ButtonContainer>
    );
}

const ButtonContainer = styled(Container)`
  top: -18px;
  left: 90px;
`;
