import styled from "@emotion/styled";
import { BootStage, Phase } from "../../../utils/types.ts";
import { getSleeve } from "../../../utils/sleeves.ts";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import { ChangeHistoryTwoTone as TriangleIcon } from "@mui/icons-material";
import { WSUtils } from "../../../pages/GamePage.tsx";
import { useSound } from "../../../hooks/useSound.ts";
import { useLongPress } from "../../../hooks/useLongPress.ts";
import { useDroppableReactDnd } from "../../../hooks/useDroppableReactDnd.ts";

export default function PlayerDeck({ wsUtils }: { wsUtils?: WSUtils }) {
    const myDeckField = useGameBoardStates((state) => state.myDeckField);
    const mySleeve = useGameBoardStates((state) => state.mySleeve);
    const nextPhaseTrigger = useGameBoardStates((state) => state.nextPhaseTrigger);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const getIsMyTurn = useGameBoardStates((state) => state.getIsMyTurn);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const gameHasStarted = bootStage === BootStage.GAME_IN_PROGRESS;

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const { setNodeRef: deckTopRef, isOver: isOverTop } = useDroppableReactDnd({
        id: "myDeckField",
        data: { accept: ["card"] },
    });
    const { setNodeRef: deckBottomRef, isOver: isOverBottom } = useDroppableReactDnd({
        id: "myDeckField_bottom",
        data: { accept: ["card"] },
    });

    const { show: showDeckMenu } = useContextMenu({ id: "deckMenu" });

    function handleClick() {
        if (!gameHasStarted) return;
        moveCard(myDeckField[0].id, "myDeckField", "myHand");
        playDrawCardSfx();
        if (wsUtils) {
            wsUtils.sendSfx("playDrawCardSfx");
            wsUtils.sendMoveCard(myDeckField[0].id, "myDeckField", "myHand");
            wsUtils.sendChatMessage(`[FIELD_UPDATE]≔【Draw Card】`);
            if (getIsMyTurn(wsUtils.matchInfo.user)) nextPhaseTrigger(wsUtils.nextPhase, Phase.DRAW);
        }
    }

    const onLongPress = (event: React.TouchEvent) => showDeckMenu({ event });

    const { handleTouchStart, handleTouchEnd } = useLongPress({ onLongPress });

    return (
        <Container className={"button"}>
            <DeckImg
                ref={deckTopRef as any}
                alt="deck"
                src={getSleeve(mySleeve)}
                isOver={isOverTop}
                onClick={handleClick}
                onContextMenu={(e) => showDeckMenu({ event: e })}
                style={{ zIndex: isOverTop ? -1 : "unset", ...(!gameHasStarted && { cursor: "not-allowed" }) }}
                className={"prevent-default-long-press"}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            />

            <DeckBottomZone ref={deckBottomRef as any} isOver={isOverBottom}>
                <TriangleIcon />
                <TriangleIcon sx={{ visibility: "hidden" }} />
                <TriangleIcon />
                <StyledSpan>{myDeckField.length}</StyledSpan>
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
    transform: translateY(10%) scale(1.1);
`;

const StyledSpan = styled.span`
    width: 100%;
    position: absolute;
    bottom: -5%;
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    transition: all 0.1s ease;
    pointer-events: none;
    opacity: 0.7;
    @media (max-height: 500px) {
        font-size: 0.8em;
        top: -18px;
    }
`;

const DeckImg = styled.img<{ isOver?: boolean }>`
    height: 66.67%;
    transition: all 0.1s ease;
    z-index: 2;
    filter: ${({ isOver }) =>
        isOver ? "drop-shadow(0px 0px 2px ghostwhite) saturate(1.1) brightness(0.95)" : "unset"};
    border-radius: 3px;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    box-shadow: 1px 1px 0 0 black;

    &:hover {
        box-shadow: 0 0 3px 0 #1ce0beff;
    }
`;

const DeckBottomZone = styled.div<{ isOver: boolean }>`
  z-index: 1;
  height: 20%;
  transform: translate(1px,-5%);
  width: 75%;
  border-radius: 3px;
  background: ${({ isOver }) => (isOver ? "rgba(255,255,255,0.4)" : "rgba(0, 0, 0, 0.35)")};
  text-wrap: nowrap;
  text-overflow: clip;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  cursor: ${({ isOver }) => (isOver ? "grabbing" : "unset")};
  svg {
    line-height: 1;
    font-size: 90%;
    color: ghostwhite;
    opacity: ${({ isOver }) => (isOver ? 0.75 : 0.35)};
    transition: all 0.25s ease-in-out;
  }
  @container board-layout (max-width: 1000px) {
    gap: 2px;
    svg {
      font-size: 70%;
    }
`;
