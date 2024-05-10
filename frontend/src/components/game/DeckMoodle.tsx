import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {playDrawCardSfx} from "../../utils/sound.ts";
import {convertForLog} from "../../utils/functions.ts";
import {CardTypeGame, SendToDeckFunction} from "../../utils/types.ts";

type DeckMoodleProps = {
    sendCardToDeck: SendToDeckFunction,
    to: string,
    setMoodle: (isOpen: boolean) => void,
    sendChatMessage: (message: string) => void,
}

export default function DeckMoodle({ sendCardToDeck, to, setMoodle, sendChatMessage} : DeckMoodleProps) {

    const cardToDeck = useGame((state) => state.cardToDeck);
    const cardToSend = useGame((state) => state.cardToSend);
    const cardName = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[]).find(card => card.id === cardToSend.id)?.name);
    const hiddenMove = cardToSend.location === "myHand" && (to === "myDeckField" || to === "mySecurity");

    const handleClick = (topOrBottom: "Top" | "Bottom") => {
        sendChatMessage(`[FIELD_UPDATE]≔【${hiddenMove ? "???" : cardName}】﹕${convertForLog(cardToSend.location)} ➟ ${convertForLog(to)} ${topOrBottom}`);
        cardToDeck(topOrBottom, cardToSend.id, cardToSend.location, to);
        sendCardToDeck(topOrBottom, cardToSend.id, cardToSend.location, to);
        setMoodle(false);
        playDrawCardSfx();
    }

    return (
        <Container to={to}>
            <StyledButton onClick={() => handleClick("Top")}><StyledSpan>»</StyledSpan></StyledButton>
            <StyledButton onClick={() => handleClick("Bottom")}><StyledSpan2>»</StyledSpan2></StyledButton>
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
        case "myEggDeck":
            return "-37px";
        case "mySecurity":
            return "100px";
    }
}

function getLeft(to: string) {
    switch (to) {
        case "myEggDeck":
            return "25px";
        case "mySecurity":
            return "145px";
    }
}
