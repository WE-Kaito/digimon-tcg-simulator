import styled from "@emotion/styled";
import { useGame } from "../../../hooks/useGame.ts";
import {useSound} from "../../../hooks/useSound.ts";
import eggBackSrc from "../../../assets/eggBack.jpg";
import {Phase} from "../../../utils/types.ts";
import {WSUtils} from "../../../pages/GamePage.tsx";
import {useDroppable} from "@dnd-kit/core";

export default function PlayerEggDeck({ wsUtils } : { wsUtils?: WSUtils }) {
    const [myEggDeck, moveCard] = useGame((state) => [state.myEggDeck, state.moveCard]);
    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx)
    const getOpponentReady = useGame((state) => state.getOpponentReady);
    const nextPhaseTrigger = useGame((state) => state.nextPhaseTrigger);

    const {setNodeRef} = useDroppable({ id: "myEggDeck", data: { accept: ["card"] } });

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
        <Container ref={setNodeRef}>
            <DeckImg alt="egg-deck" src={eggBackSrc} isOver={false} onClick={handleClick} />
            <StyledSpan>{myEggDeck.length}</StyledSpan>
        </Container>
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
  bottom: -25px;
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
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0 0 1px #eceaea) saturate(1.1) brightness(0.95)" : "none"};

  &:hover {
    filter: drop-shadow(0 0 2px #1CE0BEFF);
    outline: #084238 solid 1px;
  }
`;
