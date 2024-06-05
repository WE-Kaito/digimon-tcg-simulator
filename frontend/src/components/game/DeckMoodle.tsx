import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {convertForLog} from "../../utils/functions.ts";
import {CardTypeGame, SendToStackFunction} from "../../utils/types.ts";
import {useSound} from "../../hooks/useSound.ts";

type DeckMoodleProps = {
    sendCardToStack: SendToStackFunction,
    to: string,
    setMoodle: (isOpen: boolean) => void,
    sendChatMessage: (message: string) => void,
}

export default function DeckMoodle({ sendCardToStack, to, setMoodle, sendChatMessage} : DeckMoodleProps) {

    const moveCardToStack = useGame((state) => state.moveCardToStack);
    const cardToSend = useGame((state) => state.cardToSend);
    const cardName = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[]).find(card => card.id === cardToSend.id)?.name);

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const hidden = cardToSend.location === "myHand" && to === "mySecurity";

    function handleSendToStack(topOrBottom: "Top" | "Bottom", sendFaceUp = false) {
        sendChatMessage(`[FIELD_UPDATE]≔【${(hidden && !sendFaceUp) ? "???" : cardName}】﹕${convertForLog(cardToSend.location)} ➟ ${convertForLog(to)} ${topOrBottom}`);
        moveCardToStack(topOrBottom, cardToSend.id, cardToSend.location, to, sendFaceUp);
        sendCardToStack(topOrBottom, cardToSend.id, cardToSend.location, to, sendFaceUp);
        setMoodle(false);
        playDrawCardSfx();
    }

    return (
        <Container to={to}>
            <StyledButton onClick={() => handleSendToStack("Top")}><StyledSpan>»</StyledSpan></StyledButton>
            <StyledButton onClick={() => handleSendToStack("Bottom")}><StyledSpan2>»</StyledSpan2></StyledButton>
            {to === "mySecurity" && <>
                <StyledButton onClick={() => handleSendToStack("Top", true)}>
                    <StyledSpan>»</StyledSpan> ♦️
                </StyledButton>
                <StyledButton onClick={() => handleSendToStack("Bottom", true)}>
                    <StyledSpan2>»</StyledSpan2> ♦️
                </StyledButton>
            </>}
        </Container>
    );
}

export const Container = styled.div<{to: string}>`
  width: ${({to}) => to === "mySecurity" ? 300 : 100}px;
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
