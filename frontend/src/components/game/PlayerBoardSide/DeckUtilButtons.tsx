import styled from "@emotion/styled";
import {
    AddModerator as RecoveryIcon,
    Curtains as RevealIcon,
    RestoreFromTrash as TrashFromDeckIcon
} from "@mui/icons-material";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {useSound} from "../../../hooks/useSound.ts";

export default function DeckUtilButtons() {
    const [myDeckField, opponentReveal,  moveCard, moveCardToStack, getOpponentReady] = useGameBoardStates((state) =>
        [state.myDeckField, state.opponentReveal, state.moveCard, state.moveCardToStack, state.getOpponentReady]);

    const [playRevealCardSfx, playTrashCardSfx, playUnsuspendSfx] = useSound((state) => [state.playRevealCardSfx, state.playTrashCardSfx, state.playUnsuspendSfx]);

    // TODO:
    function moveDeckCard(to: string, bottomCard?: boolean) {
        const cardId = (bottomCard) ? myDeckField[myDeckField.length - 1].id : myDeckField[0].id;
        if (to === "myReveal") {
            playRevealCardSfx();
            // sendSfx("playRevealSfx");
            moveCard(cardId, "myDeckField", "myReveal");
            // sendMoveCard(cardId, "myDeckField", "myReveal");
            // if (bottomCard) sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[myDeckField.length - 1].name}】﹕Deck Bottom ➟ Reveal`);
            // else sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Reveal`);
        }
        if (to === "myTrash") {
            playTrashCardSfx();
            // sendSfx("playTrashCardSfx");
            moveCard(cardId, "myDeckField", "myTrash");
            // sendMoveCard(cardId, "myDeckField", "myTrash");
            // sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Trash`);
        }
        if (to === "mySecurity") {
            playUnsuspendSfx();
            // sendSfx("playUnsuspendCardSfx");
            moveCardToStack("Top", cardId, "myDeckField", "mySecurity");
            // sendCardToStack("Top", cardId, "myDeckField", "mySecurity");
            // sendChatMessage(`[FIELD_UPDATE]≔【Top Deck Card】﹕➟ Security Top`)
        }
    }

    return (
        <Container>
            <StyledButton title="Reveal the top card of your deck"
                          onClick={() => moveDeckCard("myReveal")}
                          disabled={opponentReveal.length > 0 || !getOpponentReady()}>
                <RevealIcon sx={{fontSize: 24}}/>
            </StyledButton>
            <StyledButton title="Send top card from your deck to Trash"
                          disabled={!getOpponentReady()}
                          onClick={() => moveDeckCard("myTrash")}>
                <TrashFromDeckIcon sx={{fontSize: 30}}/>
            </StyledButton>
            <StyledButton title="Send top card from your deck to Security Stack"
                        disabled={!getOpponentReady()}
                        onClick={() => moveDeckCard("mySecurity")}>
                <RecoveryIcon sx={{fontSize: 22}}/>
            </StyledButton>
        </Container>
    );
}

const Container = styled.div`
  grid-area: deck-utils;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  @media (max-height: 500px) {
    justify-content: flex-start;
    button {
      transform: translateY(-40%);
    }
    svg {
      font-size: 0.8em;
    }
  }
`;

const StyledButton = styled.button`
  padding: 0;
  width: 100%;
  border-radius: 25%;
  opacity: 0.65;
  background: none;
  border: none;
  outline: none;

  &:hover {
    opacity: 1;
    color: #fff289;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
    color: #4bf8c9;
  }
`;
