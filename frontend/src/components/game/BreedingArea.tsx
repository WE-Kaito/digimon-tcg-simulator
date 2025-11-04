import CardStack from "./CardStack.tsx";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { CardTypeGame, SIDE } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import EggIcon from "@mui/icons-material/Egg";
import DetailsIcon from "@mui/icons-material/SearchRounded";
import CloseDetailsIcon from "@mui/icons-material/SearchOffRounded";
import { WSUtils } from "../../pages/GamePage.tsx";
import { useDroppableReactDnd } from "../../hooks/useDroppableReactDnd.ts";
import { ChangeHistoryTwoTone as TriangleIcon } from "@mui/icons-material";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { RefObject, useMemo, useState } from "react";

type BreedingAreaProps = {
    side: SIDE;
    wsUtils?: WSUtils;
    ref?: RefObject<HTMLDivElement | null>;
};

export default function BreedingArea(props: BreedingAreaProps) {
    const { side, wsUtils, ref } = props;
    const location = `${side}BreedingArea`;

    const { setNodeRef: dropToField, isOver: isOverField } = useDroppableReactDnd({
        id: location,
        data: { accept: side === SIDE.MY ? ["card", "card-stack"] : ["card"] },
    });

    const { setNodeRef: dropToBottom, isOver: isOverBottom } = useDroppableReactDnd({
        id: location + "_bottom",
        data: { accept: ["card"] },
    });

    const stackDialog = useGameUIStates((state) => state.stackDialog);
    const setStackDialog = useGameUIStates((state) => state.setStackDialog);
    const locationCards = useGameBoardStates((state) => state[location as keyof typeof state] as CardTypeGame[]);

    const stackOpened = stackDialog === location;

    const { show: showFieldCardMenu } = useContextMenu({
        id: "fieldCardMenu",
        props: { index: -1, location: "", id: "" },
    });
    const { show: showOpponentCardMenu } = useContextMenu({
        id: "opponentCardMenu",
        props: { index: -1, location: "", id: "" },
    });

    const iconSize = useGeneralStates((state) => state.cardWidth / 1.5);

    const [isHoveringOverField, setIsHoveringOverField] = useState(false);

    const memoizedField = useMemo(
        () => (
            <div ref={ref} style={{ position: "relative", height: "100%", width: "100%" }}>
                <StyledEggIcon side={side} sx={{ fontSize: iconSize }} />
                {stackOpened && (isHoveringOverField ? <StyledCloseDetailsIcon /> : <StyledDetailsIcon />)}
                {!!locationCards.length && !stackOpened && (
                    <CardStack
                        cards={locationCards}
                        location={location}
                        opponentSide={side === SIDE.OPPONENT}
                        wsUtils={wsUtils}
                        showFieldCardMenu={showFieldCardMenu}
                        showOpponentCardMenu={showOpponentCardMenu}
                    />
                )}
                {side === SIDE.MY && locationCards.length !== 0 && (
                    <BottomDropZone
                        style={{ pointerEvents: isOverField ? "auto" : "none" }}
                        isOver={isOverBottom}
                        ref={dropToBottom as any}
                        onMouseOver={(e) => e.stopPropagation()}
                    >
                        <TriangleIcon sx={{ opacity: 0.75 }} />
                        <TriangleIcon sx={{ opacity: 0.75 }} />
                        <TriangleIcon sx={{ opacity: 0.75 }} />
                    </BottomDropZone>
                )}
            </div>
        ),
        [
            ref,
            side,
            iconSize,
            stackOpened,
            isHoveringOverField,
            locationCards,
            location,
            wsUtils,
            showFieldCardMenu,
            showOpponentCardMenu,
            isOverBottom,
            dropToBottom,
        ]
    );

    return (
        <Container
            style={{ zIndex: 2 }}
            // id is set for correct AttackArrow targeting. In case there is no card the field itself is the target.
            id={locationCards.length ? "" : location}
            ref={dropToField as any}
            isOver={side === SIDE.MY && isOverField}
            stackOpened={stackOpened}
            onMouseEnter={() => stackOpened && setIsHoveringOverField(true)}
            onMouseLeave={() => stackOpened && setIsHoveringOverField(false)}
            onClick={() => stackOpened && setStackDialog(false)}
            className={stackOpened ? "button" : undefined}
        >
            {memoizedField}
        </Container>
    );
}

const Container = styled.div<{ isOver: boolean; stackOpened: boolean }>`
    grid-area: breeding;
    position: relative;
    height: calc(100% - 6px);
    width: calc(100% - 6px);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: ${({ isOver }) => (isOver ? "grabbing" : "unset")};
    background: ${({ stackOpened }) => (stackOpened ? "#F5BE57FF" : "rgba(20, 20, 20, 0.25)")};
    box-shadow: inset 0 0 20px rgba(${({ isOver }) => (isOver ? "10, 10, 10" : "113, 175, 201")}, 0.2);
    outline: ${({ isOver }) => `1px solid rgba(167, 189, 219, ${isOver ? 1 : 0.5})`};
    cursor: ${({ stackOpened }) => (stackOpened ? "pointer" : "unset")};
`;

const StyledEggIcon = styled(EggIcon)<{ side: SIDE }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(${({ side }) => (side === SIDE.MY ? "0" : "180deg")});
    opacity: 0.5;
`;

const StyledDetailsIcon = styled(DetailsIcon)`
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    font-size: 3em;
`;

const StyledCloseDetailsIcon = styled(CloseDetailsIcon)`
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    font-size: 3em;
`;

const BottomDropZone = styled.div<{ isOver: boolean }>`
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 100;
    height: 20%;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    opacity: ${({ isOver }) => (isOver ? 1 : 0)};
    border-radius: 2px;
    transition: all 0.15s ease-in-out;
    text-wrap: nowrap;
    text-overflow: clip;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    svg {
        line-height: 1;
        font-size: 90%;
        color: ghostwhite;
        transition: all 0.5s ease-in-out;
        filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black);
    }
    @container board-layout (max-width: 1000px) {
        gap: 2px;
        svg {
            font-size: 70%;
        }
    }
`;
