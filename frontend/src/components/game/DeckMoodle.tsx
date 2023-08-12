import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";

type DeckMoodleProps = {
    cardToSendToDeck: {id: string, location:string},
    sendUpdate: () => void
}

export default function DeckMoodle({cardToSendToDeck, sendUpdate} : DeckMoodleProps) {

    const sendCardToDeck = useGame((state) => state.sendCardToDeck);

    const handleClick = (topOrBottom: "top" | "bottom") => {
        sendCardToDeck(topOrBottom, cardToSendToDeck);
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
  top: 35px;
  left:11px;
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
