import { AttackPhase, CardTypeGame, DraggedItem, DraggedStack, Phase } from "../utils/types.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import { convertForLog } from "../utils/functions.ts";
import { useSound } from "./useSound.ts";
import { SendMessage } from "react-use-websocket";
import { useGeneralStates } from "./useGeneralStates.ts";
import { useState } from "react";
import { useGameUIStates } from "./useGameUIStates.ts";

type Props = {
    sendMessage: SendMessage;
    restartAttackAnimation: (isEffectArrow?: boolean) => void;
    clearAttackAnimation: (() => void) | null;
};

/**
 * React-DND version of the drop zone logic hook.
 * This provides the same functionality as useDropZone but using react-dnd instead of @dnd-kit.
 *
 * Returns an object with drop handlers for different zone types that can be used with useDrop hooks.
 */
export default function useDropZoneReactDnd(props: Props) {
    const { sendMessage, restartAttackAnimation, clearAttackAnimation } = props;

    const areCardsSuspended = useGameBoardStates((state) => state.areCardsSuspended);
    const getDigimonNumber = useGameBoardStates((state) => state.getDigimonNumber);
    const getCardType = useGameBoardStates((state) => state.getCardType);
    const getIsMyTurn = useGameBoardStates((state) => state.getIsMyTurn);
    const phase = useGameBoardStates((state) => state.phase);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);

    const setCardToSend = useGameBoardStates((state) => state.setCardToSend);
    const nextPhaseTrigger = useGameBoardStates((state) => state.nextPhaseTrigger);
    const moveCardStack = useGameBoardStates((state) => state.moveCardStack);
    const moveCard = useGameBoardStates((state) => state.moveCard);

    const playCardToHandSfx = useSound((state) => state.playCardToHandSfx);
    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playNextAttackPhaseSfx = useSound((state) => state.playNextAttackPhaseSfx);

    const user = useGeneralStates((state) => state.user);
    const gameId = useGameBoardStates((state) => state.gameId);
    const progressToNextPhase = useGameBoardStates((state) => state.progressToNextPhase);
    const setMessages = useGameBoardStates((state) => state.setMessages);
    const setMyAttackPhase = useGameBoardStates((state) => state.setMyAttackPhase);
    const stackSliceIndex = useGameBoardStates((state) => state.stackSliceIndex);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);
    const setStackDragIcon = useGameUIStates((state) => state.setStackDragIcon);
    const setShowSecuritySendButtons = useGameUIStates((state) => state.setShowSecuritySendButtons);

    const [phaseLoading, setPhaseLoading] = useState(false);

    function sendSfx(sfx: string) {
        const timeout = setTimeout(() => {
            sendMessage(gameId + ":/" + sfx);
        }, 10);
        return () => clearTimeout(timeout);
    }

    function sendPhaseUpdate() {
        sendMessage(`${gameId}:/updatePhase`);
    }

    function nextPhase() {
        if (phaseLoading) return;
        setPhaseLoading(true);
        const timer = setTimeout(() => {
            progressToNextPhase();
            sendPhaseUpdate();
            playNextPhaseSfx();
            sendSfx("playNextPhaseSfx");
            setPhaseLoading(false);
        }, 920);
        return () => clearTimeout(timer);
    }

    function sendChatMessage(message: string) {
        if (message.length <= 0) return;
        setMessages(user + "﹕" + message);
        sendMessage(`${gameId}:/chatMessage:${message}`);
    }

    function sendCardToStack(
        topOrBottom: "Top" | "Bottom",
        cardId: string,
        location: string,
        to: string,
        sendFaceUp = "undefined"
    ) {
        sendMessage(`${gameId}:/moveCardToStack:${topOrBottom}:${cardId}:${location}:${to}:${sendFaceUp}`);
    }

    function sendAttackArrows(from: string, to: string, isEffect: boolean) {
        sendMessage(gameId + ":/attack:" + from + ":" + to + ":" + isEffect);
    }

    function sendAttackPhaseUpdate(attackPhase: AttackPhase | false) {
        sendMessage(`${gameId}:/updateAttackPhase:${attackPhase}`);
    }

    function sendMoveCard(cardId: string, from: string, to: string) {
        sendMessage(`${gameId}:/moveCard:${cardId}:${from}:${to}`);
    }

    function initiateAttack() {
        if (phase === Phase.MAIN) {
            setMyAttackPhase(AttackPhase.WHEN_ATTACKING);
            sendAttackPhaseUpdate(AttackPhase.WHEN_ATTACKING);
        }
        playNextAttackPhaseSfx();
        sendSfx("playNextAttackPhaseSfx");
    }

    function handleDropToField(cardId: string, from: string, to: string) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendMoveCard(cardId, from, to);
    }

    function logCardMovement(from: string, to: string, cards: CardTypeGame[]) {
        const formattedNames: string[] = cards.map((card) => {
            const isFaceDown =
                !card.isFaceUp &&
                (from.includes("Digi") || from.includes("Link") || from.includes("Breeding") || from === "mySecurity");

            return `【${isFaceDown ? "❔" : card.name}】`;
        });

        sendChatMessage(`[FIELD_UPDATE]≔${formattedNames.join("")}﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
    }

    function dropCardOrStack(item: DraggedItem | DraggedStack, targetField: string) {
        if (item.location === "myBreedingArea" && getIsMyTurn(user)) nextPhaseTrigger(nextPhase, Phase.BREEDING);
        if (Array.isArray((item as DraggedStack).cards)) {
            const { location } = item as DraggedStack;
            moveCardStack(stackSliceIndex, location, targetField, handleDropToField, logCardMovement);
            setStackDragIcon(null);
        } else {
            const { card, location } = item as DraggedItem;
            handleDropToField(card.id, location, targetField);
            if (location !== targetField) logCardMovement(location, targetField, [card]);
        }

        targetField === "myTrash" ? playTrashCardSfx() : playPlaceCardSfx();
        sendSfx(targetField === "myTrash" ? "playTrashCardSfx" : "playPlaceCardSfx");
    }

    function dropCardToDeck(item: DraggedItem, topOrBottom: "Top" | "Bottom") {
        const { card, location } = item;
        if (card.id.startsWith("TOKEN")) return;
        sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" ? "❔" : card.name}】﹕${convertForLog(location)} ➟ Deck ${topOrBottom}`
        );
        moveCardToStack(topOrBottom, card.id, location, "myDeckField");
        sendCardToStack(topOrBottom, card.id, location, "myDeckField");
        playPlaceCardSfx();
    }

    function handleDropToOpponent(from: string, to: string) {
        if (!from || !to) return;

        const myTurn = getIsMyTurn(user);
        const type = getCardType(from);
        const isEffect =
            !myTurn || type !== "Digimon" || phase !== Phase.MAIN || (type === "Digimon" && !areCardsSuspended(from));
        const attackAllowed = areCardsSuspended(from) || getDigimonNumber(from) === "BT12-083";
        clearAttackAnimation?.();
        setArrowFrom(from);
        setArrowTo(to);
        if (isEffect) setIsEffectArrow(true);
        sendAttackArrows(from, to, isEffect);
        restartAttackAnimation(isEffect);
        if (!isEffect && attackAllowed) initiateAttack();
    }

    function handleDropToHand(item: DraggedItem) {
        const { card, location } = item;
        moveCard(card.id, location, "myHand");
        sendMoveCard(card.id, location, "myHand");
        playCardToHandSfx();
        if (location !== "myHand")
            sendChatMessage(`[FIELD_UPDATE]≔【${card.name}】﹕${convertForLog(location)} ➟ ${convertForLog("myHand")}`);
    }

    function handleDropToEggDeck(item: DraggedItem, topOrBottom: "Top" | "Bottom") {
        const { card, location } = item;
        if (card.id.startsWith("TOKEN")) return;

        sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" ? "❔" : card.name}】﹕${convertForLog(location)} ➟ Egg Deck ${topOrBottom}`
        );
        moveCardToStack(topOrBottom, card.id, location, "myEggDeck");
        sendCardToStack(topOrBottom, card.id, location, "myEggDeck");
        playPlaceCardSfx();
    }

    function handleDropToSecurity(item: DraggedItem) {
        const { card, location } = item;
        if (card.id.startsWith("TOKEN")) return;
        setCardToSend({ card, location });
        setShowSecuritySendButtons(true);
    }

    function handleDropToStackBottom(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCardToStack("Top", cardId, from, to, from === "myHand" ? "up" : undefined);
        playPlaceCardSfx();
        sendSfx("playPlaceCardSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【${cardName}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
        if (from === to) {
            const timer = setTimeout(
                () => sendCardToStack("Top", cardId, from, to, from === "myHand" ? "down" : "up"),
                30
            );
            return () => clearTimeout(timer);
        } else sendCardToStack("Top", cardId, from, to, from === "myHand" ? "up" : undefined);
    }

    // React-DND drop handlers for different zone types
    const createDropHandler = (targetZone: string, options?: { bottom?: boolean }) => {
        return {
            accept: ["card", "card-stack"],
            drop: (item: { type: string; content: DraggedItem | DraggedStack }) => {
                const draggedItem = item.content as DraggedItem;
                const targetFieldParts = targetZone.split("_");
                const targetField = options?.bottom && targetFieldParts.length > 0 ? targetFieldParts[0] : targetZone;

                if (options?.bottom) {
                    const { card, location } = draggedItem;
                    if (card.cardType === "Token") return;

                    if (targetZone === "myDeckField") {
                        dropCardToDeck(draggedItem, "Bottom");
                        return;
                    }
                    if (targetZone === "myEggDeck") {
                        handleDropToEggDeck(draggedItem, "Bottom");
                        return;
                    }
                    handleDropToStackBottom(card.id, location, targetField, card.name);
                    return;
                }

                if (
                    targetField.startsWith("myDigi") ||
                    targetField.startsWith("myLink") ||
                    ["myBreedingArea", "myTrash"].includes(targetField)
                ) {
                    dropCardOrStack(item.content, targetField);
                } else if (targetField.startsWith("opponentDigi") || ["opponentSecurity"].includes(targetField)) {
                    handleDropToOpponent(draggedItem.location, targetField);
                } else if (targetField === "mySecurity") handleDropToSecurity(draggedItem);
                else if (targetField === "myHand") handleDropToHand(draggedItem);
                else if (targetField === "myDeckField") dropCardToDeck(draggedItem, "Top");
                else if (targetField === "myEggDeck") handleDropToEggDeck(draggedItem, "Top");
            },
        };
    };

    return createDropHandler;
}
