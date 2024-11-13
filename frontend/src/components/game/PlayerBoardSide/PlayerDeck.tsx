import styled from "@emotion/styled";
import { Phase } from "../../../utils/types.ts";
import { getSleeve } from "../../../utils/sleeves.ts";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import { ChangeHistoryTwoTone as TriangleIcon } from "@mui/icons-material";
import {WSUtils} from "../../../pages/GamePage.tsx";
import {useSound} from "../../../hooks/useSound.ts";
import {useDroppable} from "@dnd-kit/core";
import {useLongPress} from "../../../hooks/useLongPress.ts";

export default function PlayerDeck({ wsUtils } : { wsUtils?: WSUtils }) {
    const [myDeckField, mySleeve, nextPhaseTrigger, moveCard] = useGameBoardStates((state) => [
        state.myDeckField, state.mySleeve, state.nextPhaseTrigger, state.moveCard]);

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const {setNodeRef: deckTopRef, isOver: isOverTop} = useDroppable({ id: "myDeckField", data: { accept: ["card"] } });
    const {setNodeRef: deckBottomRef, isOver: isOverBottom, active} = useDroppable({ id: "myDeckField_bottom", data: { accept: ["card"] } });

    const canDropToBottom = active && !active.data?.current?.type?.includes("card-stack");

    const {show: showDeckMenu} = useContextMenu({id: "deckMenu"});

    function handleClick() {
        moveCard(myDeckField[0].id, "myDeckField", "myHand");
        playDrawCardSfx();
        if (wsUtils) {
            wsUtils.sendSfx("playDrawCardSfx");
            wsUtils.sendMoveCard(myDeckField[0].id, "myDeckField", "myHand");
            wsUtils.sendChatMessage(`[FIELD_UPDATE]≔【Draw Card】`);
            nextPhaseTrigger(wsUtils.nextPhase, Phase.DRAW);
        }
    }

    const onLongPress = (event: React.TouchEvent) => showDeckMenu({event});

    const { handleTouchStart, handleTouchEnd } = useLongPress({onLongPress})

    return (
        <Container>
            <StyledSpan>{myDeckField.length}</StyledSpan>

            <DeckImg ref={deckTopRef} alt="deck" src={getSleeve(mySleeve)} isOver={isOverTop}
                     onClick={handleClick} onContextMenu={(e) => showDeckMenu({event: e})}
                     style={{ pointerEvents: canDropToBottom ? "none" : "unset", zIndex: isOverTop? -1: "unset" }}
                     className={"prevent-default-long-press"}
                     onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
            />

            <DeckBottomZone ref={deckBottomRef} isOver={isOverBottom}>
                {canDropToBottom &&
                    <>
                        <TriangleIcon />
                        <TriangleIcon />
                        <TriangleIcon />
                    </>
                }
            </DeckBottomZone>
        </Container>
    );
}

const Container = styled.div`
  grid-area: deck;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const StyledSpan = styled.span`
  width: 100%;
  position: absolute;
  top: -21px;
  left: 52%;
  transform: translateX(-50%);
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transition: all 0.1s ease;
  @media (max-height: 500px) {
    font-size: 0.8em;
    top: -18px;
  }
`;

const DeckImg = styled.img<{ isOver?: boolean }>`
  height: 66.67%;
  cursor: pointer;
  transition: all 0.1s ease;
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0px 0px 2px ghostwhite) saturate(1.1) brightness(0.95)" : "unset"};
  border-radius: 2px;
  border-right: 2px solid black;
  border-bottom: 2px solid black;

  &:hover {
    box-shadow: 0 0 3px 0 #1CE0BEFF;
  }
`;

const DeckBottomZone = styled.div<{ isOver: boolean }>`
  z-index: 1;
  height: 20%;
  transform: translate(1px,-5%);
  width: 90%;
  border-radius: 3px;
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
