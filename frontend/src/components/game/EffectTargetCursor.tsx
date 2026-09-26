import { Global } from "@emotion/react";
import styled from "@emotion/styled";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import { useEffect, useRef, useState } from "react";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import type { WSUtils } from "../../pages/GamePage.tsx";
import { findOptionPlacementField } from "../../utils/effectTargeting.ts";
import type { CardTypeGame } from "../../utils/types.ts";

export default function EffectTargetCursor({ wsUtils }: { wsUtils?: WSUtils }) {
    const effectTargeting = useGameUIStates((state) => state.effectTargeting);
    const cancelEffectTargeting = useGameUIStates((state) => state.cancelEffectTargeting);
    const handCardPlacement = useGameUIStates((state) => state.handCardPlacement);
    const cancelHandCardPlacement = useGameUIStates((state) => state.cancelHandCardPlacement);
    const startHandCardPlacement = useGameUIStates((state) => state.startHandCardPlacement);
    const myHand = useGameBoardStates((state) => state.myHand);
    const flipCard = useGameBoardStates((state) => state.flipCard);
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const previousTargeting = useRef(effectTargeting);

    useEffect(() => {
        const previous = previousTargeting.current;
        if (
            !effectTargeting &&
            !handCardPlacement &&
            previous?.sourceLocation === "myHand" &&
            myHand.some((card) => card.id === previous.sourceCardId && card.isFaceUp)
        ) {
            flipCard(previous.sourceCardId, "myHand");
            wsUtils?.sendMessage(`${wsUtils.matchInfo.gameId}:/flipCard:${previous.sourceCardId}:myHand`);
        }
        previousTargeting.current = effectTargeting;
    }, [effectTargeting, flipCard, handCardPlacement, myHand, wsUtils]);

    useEffect(() => {
        if (!effectTargeting && !handCardPlacement) return;

        const finishTargeting = () => {
            if (!effectTargeting) return;
            if (
                effectTargeting.sourceLocation === "myHand" &&
                myHand.some((card) => card.id === effectTargeting.sourceCardId && card.isFaceUp)
            ) {
                flipCard(effectTargeting.sourceCardId, "myHand");
                wsUtils?.sendMessage(
                    `${wsUtils.matchInfo.gameId}:/flipCard:${effectTargeting.sourceCardId}:myHand`
                );
            }
            cancelEffectTargeting();
        };
        const finishPlacement = () => {
            if (
                handCardPlacement &&
                myHand.some((card) => card.id === handCardPlacement.cardId && card.isFaceUp)
            ) {
                flipCard(handCardPlacement.cardId, "myHand");
                wsUtils?.sendMessage(
                    `${wsUtils.matchInfo.gameId}:/flipCard:${handCardPlacement.cardId}:myHand`
                );
            }
            cancelHandCardPlacement();
        };

        const handlePointerMove = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (handCardPlacement) finishPlacement();
                else finishTargeting();
            }
            if (event.key === "Enter" && effectTargeting?.sourceLocation === "myHand" && wsUtils) {
                event.preventDefault();
                const board = useGameBoardStates.getState();
                const sourceCard = board.myHand.find((card) => card.id === effectTargeting.sourceCardId);
                if (!sourceCard) return;

                wsUtils.sendChatMessage(
                    `${wsUtils.matchInfo.user} is activating ${effectTargeting.sourceName} ` +
                        `[${effectTargeting.timing}]: ${effectTargeting.effectText}`
                );

                if (sourceCard.cardType.includes("Option")) {
                    const placementField = findOptionPlacementField(
                        sourceCard,
                        (field) => board[field as keyof typeof board] as CardTypeGame[]
                    );
                    if (placementField) {
                        board.moveCard(sourceCard.id, "myHand", placementField);
                        wsUtils.sendMoveCard(sourceCard.id, "myHand", placementField);
                        wsUtils.sendChatMessage(
                            `[FIELD_UPDATE]≔【${sourceCard.name}】﹕Hand ➟ Tamer/Option Area`
                        );
                    } else {
                        startHandCardPlacement({ cardId: sourceCard.id, cardName: sourceCard.name });
                    }
                }
                cancelEffectTargeting();
            }
        };
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            if (handCardPlacement) finishPlacement();
            else finishTargeting();
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("contextmenu", handleContextMenu, true);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("contextmenu", handleContextMenu, true);
        };
    }, [cancelEffectTargeting, cancelHandCardPlacement, effectTargeting, flipCard, handCardPlacement, myHand, startHandCardPlacement, wsUtils]);

    if (!effectTargeting && !handCardPlacement) return null;

    return (
        <>
            <Global styles={{ "body, body *": { cursor: "none !important" } }} />
            <CursorOverlay style={{ transform: `translate(${position.x + 7}px, ${position.y + 7}px)` }}>
                <ModeStandbyIcon />
                <Instruction>
                    {handCardPlacement ? "Place card on area" : `Select a target for [${effectTargeting!.timing}]`}
                    <small>Esc or right-click to cancel</small>
                    {!handCardPlacement && <small>Enter to Activate Effect</small>}
                </Instruction>
            </CursorOverlay>
        </>
    );
}

const CursorOverlay = styled.div`
    position: fixed;
    inset: 0 auto auto 0;
    z-index: 100000;
    pointer-events: none;
    color: #ff1744;
    filter: drop-shadow(0 0 2px #000) drop-shadow(0 0 5px rgba(255, 23, 68, 0.9));

    svg {
        width: 30px;
        height: 30px;
    }
`;

const Instruction = styled.div`
    position: absolute;
    top: 32px;
    left: 18px;
    width: max-content;
    max-width: 320px;
    padding: 5px 8px;
    border: 1px solid rgba(255, 82, 82, 0.8);
    border-radius: 4px;
    background: rgba(10, 12, 20, 0.92);
    color: #fff1f1;
    font-family: Cousine, sans-serif;
    font-size: 12px;

    small {
        display: block;
        margin-top: 2px;
        color: #ffb3bd;
    }
`;
