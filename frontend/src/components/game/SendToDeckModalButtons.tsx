import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {convertForLog} from "../../utils/functions.ts";
import {CardTypeGame, SendToStackFunction} from "../../utils/types.ts";
import {useSound} from "../../hooks/useSound.ts";
import {Preview as FaceUpIcon, HelpCenter as FaceDownIcon, KeyboardDoubleArrowUp as UpIcon, KeyboardDoubleArrowDown as DownIcon} from '@mui/icons-material';

type DeckMoodleProps = {
    sendCardToStack: SendToStackFunction,
    to: string,
    setMoodle: (isOpen: boolean) => void,
    sendChatMessage: (message: string) => void,
}

export default function SendToDeckModalButtons({ sendCardToStack, to, setMoodle, sendChatMessage} : DeckMoodleProps) {

    const moveCardToStack = useGame((state) => state.moveCardToStack);
    const cardToSend = useGame((state) => state.cardToSend);
    const cardName = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[]).find(card => card.id === cardToSend.id)?.name);

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const hidden = cardToSend.location === "myHand" && to === "mySecurity";
    const isSecurity = to === "mySecurity";

    function handleSendToStack(topOrBottom: "Top" | "Bottom", sendFaceUp = false) {
        sendChatMessage(`[FIELD_UPDATE]≔【${(hidden && !sendFaceUp) ? "???" : cardName}】﹕${convertForLog(cardToSend.location)} ➟ ${convertForLog(to)} ${topOrBottom}`);
        moveCardToStack(topOrBottom, cardToSend.id, cardToSend.location, to, sendFaceUp);
        sendCardToStack(topOrBottom, cardToSend.id, cardToSend.location, to, sendFaceUp);
        setMoodle(false);
        playDrawCardSfx();
    }

    return (
        <Container to={to}>
            <StyledButton to={to} onClick={() => handleSendToStack("Top")}>
                <UpIcon fontSize={"large"} sx={{transform: isSecurity ? "translateX(7px)" : "unset"}}/>
                {isSecurity && <FaceDownIcon sx={{transform: "translateX(2px)"}}/>}
            </StyledButton>
            <StyledButton to={to} onClick={() => handleSendToStack("Bottom")}>
                <DownIcon fontSize={"large"} sx={{transform: isSecurity ? "translateX(7px)" : "unset"}}/>
                {isSecurity && <FaceDownIcon sx={{transform: "translateX(2px)"}}/>}
            </StyledButton>

            {isSecurity && <>
                <StyledButton to={to} style={{ display: "flex"}} onClick={() => handleSendToStack("Top", true)}>
                    <UpIcon fontSize={"large"} sx={{transform: "translateX(7px)"}}/>
                    <FaceUpIcon sx={{transform: "translateX(2px)"}}/>
                </StyledButton>
                <StyledButton to={to} onClick={() => handleSendToStack("Bottom", true)}>
                    <DownIcon fontSize={"large"} sx={{transform: "translateX(7px)"}}/>
                    <FaceUpIcon sx={{transform: "translateX(2px)"}}/>
                </StyledButton>
            </>}
        </Container>
    );
}

export const Container = styled.div<{to: string}>`
  width: ${({to}) => to === "mySecurity" ? 145 : 100}px;
  height: ${({to}) => to === "mySecurity" ? 80 : 50}px;
  position: absolute;
  top: ${props => getTop(props.to)};
  left: ${props => getLeft(props.to)};
  background: none;
  display: flex;
  flex-direction: row;
  z-index: 500;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
`;

export const StyledButton = styled.button<{to: string}>`
  width: ${({to}) => to === "mySecurity" ? 65 : 45}px;
  height: 35px;
  z-index: 100;
  background: none;
  margin: 0 0 0 3px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background: mintcream;
    *{
      color: black;
    }
  }
`;

function getTop(to: string) {
    switch (to) {
        case "myEggDeck":
            return "-25px";
        case "mySecurity":
            return "100px";
    }
}

function getLeft(to: string) {
    switch (to) {
        case "myEggDeck":
            return "26px";
        case "mySecurity":
            return "135px";
    }
}
