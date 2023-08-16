import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";

type DeckMoodleProps = {
    cardToSend: {id: string, location:string},
    sendUpdate: () => void,
    to: string,
    setMoodle: (isOpen: boolean) => void
}

export default function DeckMoodle({cardToSend, sendUpdate, to, setMoodle} : DeckMoodleProps) {

    const sendCardToDeck = useGame((state) => state.sendCardToDeck);

    const handleClick = (topOrBottom: "top" | "bottom") => {
        sendCardToDeck(topOrBottom, cardToSend, to);
        sendUpdate();
        setMoodle(false);
    }

    return (
        <Container to={to}>
            <StyledButton onClick={() => handleClick("top")}><StyledSpan>»</StyledSpan></StyledButton>
            <StyledButton onClick={() => handleClick("bottom")}><StyledSpan2>»</StyledSpan2></StyledButton>
        </Container>
    );
}

export const Container = styled.div<{to: string}>`
  width: 100px;
  height: 50px;
  position: absolute;
  top: ${props => getTop(props.to)};
  left: ${props => getLeft(props.to)};
  background: none;
  display: flex;
  overflow: hidden;
  z-index: 500;
`;

export const StyledButton = styled.button`
  width: 50px;
  z-index: 100;
  background: none;
  border:none;
`;

export const StyledSpan = styled.span`
  font-size: 80px;
  position: absolute;
  transform: translate(-37px, -50px) rotate(-90deg);

  &:hover {
    color: #daa600;
  }
`;

export const StyledSpan2 = styled(StyledSpan)`
  transform: translate(-2px, -50px) rotate(90deg);
`;

function getTop(to: string) {
    switch (to) {
        case "myDeckField":
            return "35px";
        case "myEggDeck":
            return "-12px";
        case "mySecurity":
            return "-18px";
    }
}

function getLeft(to: string) {
    switch (to) {
        case "myDeckField":
            return "11px";
        case "myEggDeck":
            return "24px";
        case "mySecurity":
            return "90px";
    }
}
