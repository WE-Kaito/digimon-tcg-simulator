import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import {useSound} from "../../../hooks/useSound.ts";
import eggBackSrc from "../../../assets/eggBack.jpg";
import {Phase} from "../../../utils/types.ts";
import {WSUtils} from "../../../pages/GamePage.tsx";
import {useDroppable} from "@dnd-kit/core";
import {ChangeHistoryTwoTone as TriangleIcon} from "@mui/icons-material";

export default function PlayerEggDeck({ wsUtils } : { wsUtils?: WSUtils }) {
    const [myEggDeck, moveCard, getOpponentReady, nextPhaseTrigger] = useGameBoardStates((state) => [
        state.myEggDeck, state.moveCard, state.getOpponentReady, state.nextPhaseTrigger]);
    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx)

    const {setNodeRef} = useDroppable({ id: "myEggDeck", data: { accept: ["card"] } });
    const {setNodeRef: deckBottomRef, isOver: isOverBottom, active} = useDroppable({ id: "myEggDeck_bottom", data: { accept: ["card"] } });

    const canDropToBottom = active && !active.data?.current?.type?.includes("card-stack");

    function handleClick(e: React.MouseEvent<HTMLImageElement>) {
        e.stopPropagation();
        if (!getOpponentReady()) return;
        moveCard(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
        playDrawCardSfx();
        if (wsUtils){
            nextPhaseTrigger(wsUtils.nextPhase, Phase.BREEDING);
            wsUtils.sendMoveCard(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
            wsUtils.sendSfx("playPlaceCardSfx");
            wsUtils.sendChatMessage(`[FIELD_UPDATE]≔【${myEggDeck[0].name}】﹕Egg-Deck ➟ Breeding`);
        }
    }

    return (
        <>
            <Container ref={setNodeRef}>
                <StyledSpan>{myEggDeck.length}</StyledSpan>
                <DeckImg alt="egg-deck" src={eggBackSrc} isOver={false} onClick={handleClick} />
            </Container>
            <DeckBottomZone ref={deckBottomRef} isOver={isOverBottom}>
                {canDropToBottom &&
                    <>
                       <TriangleIcon />
                       <TriangleIcon />
                       <TriangleIcon />
                    </>
                }
            </DeckBottomZone>
        </>
    );
}

const Container = styled.div`
  grid-area: egg-deck;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 20;
`;

const StyledSpan = styled.span`
  width: 100%;
  position: absolute;
  top: -25px;
  left: 52%;
  transform: translateX(-50%);
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transition: all 0.1s ease;
  @media (max-height: 600px) {
    bottom: -20px;
    font-size: 0.8em;
  }
`;

const DeckImg = styled.img<{ isOver?: boolean }>`
  height: 100%;
  border-radius: 3px;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  cursor: pointer;
  transition: all 0.1s ease;
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0 0 1px #eceaea) saturate(1.1) brightness(0.95)" : "none"};

  &:hover {
    filter: drop-shadow(0 0 2px #1CE0BEFF);
    outline: #084238 solid 1px;
  }
`;

const DeckBottomZone = styled.div<{ isOver: boolean }>`
  grid-area: egg-deck-bottom;
  z-index: 1;
  height: 60%;
  transform: translateY(-5%);
  margin-left: 9%;
  width: 82.75%;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background: ${({isOver}) => isOver ? "rgba(255,255,255,0.4)" : "rgba(0, 0, 0, 0.35)"};
  text-wrap: nowrap;
  text-overflow: clip;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  cursor: ${({isOver}) => isOver ? "grabbing" : "unset"};
  svg {
    line-height: 1;
    font-size: 90%;
    color: ghostwhite;
    opacity: ${({isOver}) => isOver ? 0.75 : 0.35};
    transition: all 0.25s ease-in-out;
  }
  @container board-layout (max-width: 1000px) {
    gap: 2px;
    svg {
      font-size: 70%;
    }
`;
