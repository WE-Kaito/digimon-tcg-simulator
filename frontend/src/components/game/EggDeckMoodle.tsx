import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";

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
        <Container>
            <StyledButton onClick={() => handleClick("top")}><StyledSpan>»</StyledSpan></StyledButton>
            <StyledButton onClick={() => handleClick("bottom")}><StyledSpan2>»</StyledSpan2></StyledButton>
        </Container>
    );
}

const Container = styled.div`
  width: 100px;
  height: 50px;
  position: absolute;
  top: -12px;
  left: 24px;
  background: none;
  display: flex;
  overflow: hidden;
`;

const StyledButton = styled.button`
  width: 50px;
  z-index: 100;
  background: none;
  border:none;
`;



const StyledSpan = styled.span`
  font-size: 80px;
  position: absolute;
  transform: translate(-37px, -50px) rotate(-90deg);

  &:hover {
    color: #daa600;
  }
`;

const StyledSpan2 = styled(StyledSpan)`
  transform: translate(-2px, -50px) rotate(90deg);
`;