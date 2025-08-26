import { AttackPhase, BootStage, DraggedItem, DraggedStack, Phase } from "../utils/types.ts";
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
    const getPhase = useGameBoardStates((state) => state.getPhase);
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
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const setBootStage = useGameBoardStates((state) => state.setBootStage);

    const setPhase = useGameBoardStates((state) => state.setPhase);
    const setMessages = useGameBoardStates((state) => state.setMessages);
    const setMyAttackPhase = useGameBoardStates((state) => state.setMyAttackPhase);
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);
    const stackSliceIndex = useGameBoardStates((state) => state.stackSliceIndex);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);
    const setStackDragIcon = useGameUIStates((state) => state.setStackDragIcon);

    const [phaseLoading, setPhaseLoading] = useState(false);

    function isCardStack(item: DraggedItem | DraggedStack): item is DraggedStack {
        const { id } = item as DraggedItem;
        return !id;
    }

    function sendSfx(sfx: string) {
        const timeout = setTimeout(() => {
            sendMessage(gameId + ":/" + sfx + ":" + opponentName);
        }, 10);
        return () => clearTimeout(timeout);
    }

    function sendPhaseUpdate() {
        sendMessage(`${gameId}:/updatePhase:${opponentName}`);
    }

    function nextPhase() {
        if (phaseLoading) return;
        setPhaseLoading(true);
        const timer = setTimeout(() => {
            setPhase();
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
        sendMessage(`${gameId}:/chatMessage:${opponentName}:${message}`);
    }

    function sendCardToStack(
        topOrBottom: "Top" | "Bottom",
        cardId: string,
        location: string,
        to: string,
        sendFaceUp = "undefined"
    ) {
        sendMessage(
            `${gameId}:/moveCardToStack:${opponentName}:${topOrBottom}:${cardId}:${location}:${to}:${sendFaceUp}`
        );
    }

    function sendAttackArrows(from: string, to: string, isEffect: boolean) {
        sendMessage(gameId + ":/attack:" + opponentName + ":" + from + ":" + to + ":" + isEffect);
    }

    function sendAttackPhaseUpdate(attackPhase: AttackPhase | false) {
        sendMessage(`${gameId}:/updateAttackPhase:${opponentName}:${attackPhase}`);
    }

    function sendMoveCard(cardId: string, from: string, to: string) {
        sendMessage(`${gameId}:/moveCard:${opponentName}:${cardId}:${from}:${to}`);
        if (bootStage === BootStage.MULLIGAN && getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
    }

    function initiateAttack() {
        if (getPhase() === Phase.MAIN) {
            setMyAttackPhase(AttackPhase.WHEN_ATTACKING);
            sendAttackPhaseUpdate(AttackPhase.WHEN_ATTACKING);
        }
        playNextAttackPhaseSfx();
        sendSfx("playNextAttackPhaseSfx");
    }

    function handleDropToField(cardId: string, from: string, to: string, cardName: string, isFaceUp: boolean) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendMoveCard(cardId, from, to);
        const isFaceDown = !isFaceUp && (from.includes("Digi") || from.includes("Link") || from.includes("Breeding"));
        const hiddenCardInfo =
            from === "myHand" && ["myTrash", "myDeckField"].includes(to) ? ` (…${cardId.slice(-5)})` : "";

        if (from !== to)
            sendChatMessage(
                `[FIELD_UPDATE]≔【${isFaceDown ? "❔" : cardName + hiddenCardInfo}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`
            );
    }

    function dropCardOrStack(item: DraggedItem | DraggedStack, targetField: string) {
        if (item.location === "myBreedingArea") nextPhaseTrigger(nextPhase, Phase.BREEDING);
        if (isCardStack(item)) {
            const { location } = item;
            moveCardStack(stackSliceIndex, location, targetField, handleDropToField);
            setStackDragIcon(null);
        } else {
            const { id, location, name, isFaceUp } = item;
            handleDropToField(id, location, targetField, name, isFaceUp);
        }

        targetField === "myTrash" ? playTrashCardSfx() : playPlaceCardSfx();
        sendSfx(targetField === "myTrash" ? "playTrashCardSfx" : "playPlaceCardSfx");
    }

    function dropCardToDeck(item: DraggedItem, topOrBottom: "Top" | "Bottom") {
        const { id, location, name } = item;
        if (id.startsWith("TOKEN")) return;
        sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" ? `???…${id.slice(-5)}` : name}】﹕${convertForLog(location)} ➟ Deck ${topOrBottom}`
        );
        moveCardToStack(topOrBottom, id, location, "myDeckField");
        sendCardToStack(topOrBottom, id, location, "myDeckField");
        playPlaceCardSfx();
    }

    function handleDropToOpponent(from: string, to: string) {
        if (!from || !to) return;

        const myTurn = getIsMyTurn();
        const type = getCardType(from);
        const isEffect =
            !myTurn ||
            type !== "Digimon" ||
            getPhase() !== Phase.MAIN ||
            (type === "Digimon" && !areCardsSuspended(from));
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
        const { id, location, name } = item;
        moveCard(id, location, "myHand");
        sendMoveCard(id, location, "myHand");
        playCardToHandSfx();
        if (location !== "myHand")
            sendChatMessage(`[FIELD_UPDATE]≔【${name}】﹕${convertForLog(location)} ➟ ${convertForLog("myHand")}`);
    }

    function handleDropToEggDeck(item: DraggedItem, topOrBottom: "Top" | "Bottom") {
        const { id, name, location } = item;
        if (id.startsWith("TOKEN")) return;

        sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" ? `???…${id.slice(-5)}` : name}】﹕${convertForLog(location)} ➟ Egg Deck ${topOrBottom}`
        );
        moveCardToStack(topOrBottom, id, location, "myEggDeck");
        sendCardToStack(topOrBottom, id, location, "myEggDeck");
        playPlaceCardSfx();
    }

    function dropCardToSecurityStack(item: DraggedItem, topOrBottom: "Top" | "Bottom", sendFaceUp?: boolean) {
        const { id, location, name } = item;
        if (id.startsWith("TOKEN")) return;
        sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" && !sendFaceUp ? `???…${id.slice(-5)}` : name}】﹕${convertForLog(location)} ➟ SS﹕${topOrBottom}${sendFaceUp ? " (face up)" : ""}`
        );
        moveCardToStack(topOrBottom, id, location, "mySecurity", sendFaceUp ? "up" : "down");
        sendCardToStack(topOrBottom, id, location, "mySecurity", sendFaceUp ? "up" : "down");
        playPlaceCardSfx();
    }

    function handleDropToSecurity(item: DraggedItem, to: string) {
        const { id, location } = item;
        if (id.startsWith("TOKEN")) return;
        setCardToSend(id, location);
        if (to === "mySecurity_top_faceUp") dropCardToSecurityStack(item, "Top", true);
        if (to === "mySecurity_top_faceDown") dropCardToSecurityStack(item, "Top");
        if (to === "mySecurity_bot_faceDown") dropCardToSecurityStack(item, "Bottom");
        if (to === "mySecurity_bot_faceUp") dropCardToSecurityStack(item, "Bottom", true);
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
                    const { id, location, type, name } = draggedItem;
                    if (type === "Token") return;

                    if (targetZone === "myDeckField") {
                        dropCardToDeck(draggedItem, "Bottom");
                        return;
                    }
                    if (targetZone === "myEggDeck") {
                        handleDropToEggDeck(draggedItem, "Bottom");
                        return;
                    }
                    handleDropToStackBottom(id, location, targetField, name);
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
                } else if (targetField.includes("mySecurity")) {
                    handleDropToSecurity(draggedItem, targetField);
                } else if (targetField === "myHand") {
                    handleDropToHand(draggedItem);
                } else if (targetField === "myDeckField") {
                    dropCardToDeck(draggedItem, "Top");
                } else if (targetField === "myEggDeck") {
                    handleDropToEggDeck(draggedItem, "Top");
                }
            },
        };
    };

    // Return drop handlers for different zone types
    return {
        createDropHandler,
        // Legacy function for components that need the old API
        handleDragEnd: (draggedItem: DraggedItem | DraggedStack, targetZone: string, isBottom?: boolean) => {
            const dropHandler = createDropHandler(targetZone, { bottom: isBottom });
            dropHandler.drop({ type: isCardStack(draggedItem) ? "card-stack" : "card", content: draggedItem });
        },
    };
}
