import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {Container, StyledSpan, StyledSpan2, StyledButton} from "./DeckMoodle.tsx";

type DeckMoodleProps = {
    cardToSendToEggDeck: {id: string, location:string},
    sendUpdate: () => void
}

export default function EggDeckMoodle({cardToSendToEggDeck, sendUpdate} : DeckMoodleProps) {

    const sendCardToEggDeck = useGame((state) => state.sendCardToEggDeck);

    const handleClick = (topOrBottom: "top" | "bottom") => {
        sendCardToEggDeck(topOrBottom, cardToSendToEggDeck);
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
  top: -12px;
  left: 24px;
`;