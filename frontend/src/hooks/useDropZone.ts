import {AttackPhase, BootStage, DraggedItem, DraggedStack, Phase} from "../utils/types.ts";
import {useGame} from "./useGame.ts";
import {convertForLog} from "../utils/functions.ts";
import {DragEndEvent} from '@dnd-kit/core';
import {useSound} from "./useSound.ts";
import {SendMessage} from "react-use-websocket";
import {useStore} from "./useStore.ts";
import {useState} from "react";

type Props = {
    sendMessage: SendMessage,
    restartAttackAnimation: (isEffectArrow?: boolean) => void,
    clearAttackAnimation: (() => void) | null,
}

/**
 * Custom hook for handling the drop zone logic.
 * Make sure the Id's in useDroppable hook calls are the same as used in handleDragEnd function.
 *
 * @example
 * PlayerDeck.tsx:
 * const {setNodeRef: deckTopRef, isOver: isOverTop} = useDroppable({ id: "myDeckField", data: { accept: ["card"] } });
 *
 * useDropZone.ts:
 * function handleDragEnd(event: DragEndEvent) {
 *         const {active, over} = event;
 *         const to = String(over?.id).includes("_") ? String(over?.id).split("_")[0] : String(over?.id);
 *         ...
 *         if (to === "myDeckField") dropCardToStack(draggedItem, "Top");
 *     }
 */
export default function useDropZone(props : Props) : (event: DragEndEvent) => void {
    const {sendMessage, restartAttackAnimation, clearAttackAnimation} = props;

    const areCardsSuspended = useGame(state => state.areCardsSuspended);
    const getDigimonNumber = useGame(state => state.getDigimonNumber);
    const getCardType = useGame(state => state.getCardType);
    const getIsMyTurn = useGame(state => state.getIsMyTurn);
    const getPhase = useGame(state => state.getPhase);
    const moveCardToStack = useGame((state) => state.moveCardToStack);

    const setCardToSend = useGame((state) => state.setCardToSend);
    const nextPhaseTrigger = useGame(state => state.nextPhaseTrigger);
    const moveCardStack = useGame((state) => state.moveCardStack);
    const moveCard = useGame((state) => state.moveCard);

    const playCardToHandSfx = useSound((state) => state.playCardToHandSfx);
    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);
    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playNextAttackPhaseSfx = useSound((state) => state.playNextAttackPhaseSfx);

    const user = useStore((state) => state.user);
    const gameId = useGame(state => state.gameId);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];
    const [bootStage, setBootStage] = useGame((state) => [state.bootStage, state.setBootStage]);

    const setPhase = useGame((state) => state.setPhase);
    const setMessages = useGame((state) => state.setMessages);
    const [setArrowFrom, setArrowTo] = useGame((state) => [state.setArrowFrom, state.setArrowTo]);
    const setIsEffectArrow = useGame((state) => state.setIsEffectArrow);
    const setMyAttackPhase = useGame((state) => state.setMyAttackPhase);
    const getOpponentReady = useGame((state) => state.getOpponentReady);
    const stackSliceIndex = useGame((state) => state.stackSliceIndex);

    const [phaseLoading, setPhaseLoading] = useState(false);


    function isCardStack(item: DraggedItem | DraggedStack): item is DraggedStack {
        const {id} = item as DraggedItem;
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
        if(phaseLoading) return;
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

    function sendCardToStack(topOrBottom: "Top" | "Bottom", cardId: string, location: string, to: string, sendFaceUp = false) {
        sendMessage(`${gameId}:/moveCardToStack:${opponentName}:${topOrBottom}:${cardId}:${location}:${to}:${sendFaceUp}`);
    }

    function sendAttackArrows(from: string, to: string, isEffect: boolean) {
        sendMessage(gameId + ":/attack:" + opponentName + ":" + from + ":" + to + ":" + isEffect);
    }

    function sendAttackPhaseUpdate(attackPhase: AttackPhase | false) {
        sendMessage(`${gameId}:/updateAttackPhase:${opponentName}:${attackPhase}`);
    }

    function sendMoveCard(cardId: string, from: string, to: string) {
        sendMessage(`${gameId}:/moveCard:${opponentName}:${cardId}:${from}:${to}`);
        if ((bootStage === BootStage.MULLIGAN) && getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
    }

    function initiateAttack() {
        if (getPhase() === Phase.MAIN) {
            setMyAttackPhase(AttackPhase.WHEN_ATTACKING);
            sendAttackPhaseUpdate(AttackPhase.WHEN_ATTACKING);
        }
        playNextAttackPhaseSfx();
        sendSfx("playNextAttackPhaseSfx");
    }

    // return
    function dropCardOrStack(item: DraggedItem | DraggedStack, targetField: string) {
        if (item.location === "myBreedingArea") nextPhaseTrigger(nextPhase, Phase.BREEDING);
        if (isCardStack(item)) {
            const {location} = item;
            moveCardStack(stackSliceIndex, location, targetField, handleDropToField);
        } else {
            const {id, location, name} = item;
            handleDropToField(id, location, targetField, name);
        }
        
        targetField === "myTrash" ? playTrashCardSfx() : playPlaceCardSfx();
        sendSfx(targetField === "myTrash" ? "playTrashCardSfx" : "playPlaceCardSfx");
    }

    function dropCardToStack(item: DraggedItem, topOrBottom: "Top" | "Bottom") {
        const {id, location, name} = item;
        if (id.startsWith("TOKEN")) return;
        sendChatMessage(`[FIELD_UPDATE]≔【${location === "myHand" ? `???…${id.slice(-5)}` : name}】﹕${convertForLog(location)} ➟ Deck ${topOrBottom}`);
        moveCardToStack(topOrBottom, id, location, "myDeckField");
        sendCardToStack(topOrBottom, id, location, "myDeckField");
        playDrawCardSfx();
    }

    function handleDropToOpponent(from: string, to: string) {
        if (!from || !to) return;

        const myTurn = getIsMyTurn();
        const type = getCardType(from);
        const isEffect = !myTurn || type !== "Digimon" || getPhase() !== Phase.MAIN || (type === "Digimon" && !areCardsSuspended(from));
        const attackAllowed = areCardsSuspended(from) || (getDigimonNumber(from) === "BT12-083")
        clearAttackAnimation?.();
        setArrowFrom(from);
        setArrowTo(to);
        if (isEffect) setIsEffectArrow(true);
        sendAttackArrows(from, to, isEffect);
        restartAttackAnimation(isEffect);
        if (!isEffect && attackAllowed) initiateAttack();
    }

    function handleDropToField(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendMoveCard(cardId, from, to);
        const hiddenCardInfo = (from === "myHand" && ["myTrash", "myDeckField"].includes(to)) ? ` (…${cardId.slice(-5)})` : "";
        if (from !== to) sendChatMessage(`[FIELD_UPDATE]≔【${cardName + hiddenCardInfo}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
    }

    function handleDropToHand(item: DraggedItem) {
        const {id, location, name} = item;
        moveCard(id, location, 'myHand');
        sendMoveCard(id, location, 'myHand');
        playCardToHandSfx();
        if (location !== "myHand") sendChatMessage(`[FIELD_UPDATE]≔【${name}】﹕${convertForLog(location)} ➟ ${convertForLog("myHand")}`);
    }

    function handleDropToEggDeck(item: DraggedItem) {
        const {id, location} = item;
        if (id.startsWith("TOKEN")) return;
        setCardToSend(id, location);
        //TODO: change to same behavior as deck
        // setEggDeckMoodle(true);
        // setSecurityMoodle(false);
    }

    function handleDropToSecurity(item: DraggedItem) {
        const {id, location} = item;
        if (id.startsWith("TOKEN")) return;
        setCardToSend(id, location);
        //TODO: implement
        // setSecurityMoodle(true);
        // setEggDeckMoodle(false);
    }

    function handleDropToStackBottom(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCardToStack("Top", cardId, from, to);
        playPlaceCardSfx();
        sendSfx("playPlaceCardSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【${cardName}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
        if (from === to) {
            const timer = setTimeout(() => sendCardToStack("Top", cardId, from, to), 30);
            return () => clearTimeout(timer);
        } else sendCardToStack("Top", cardId, from, to);
    }

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        const dragItem = active?.data?.current as { type: string; content: DraggedItem | DraggedStack };
        const to = String(over?.id).includes("_") ? String(over?.id).split("_")[0] : String(over?.id);
        const draggedItem = dragItem.content as DraggedItem;

        if (!over?.data.current?.accept.includes(dragItem.type)) return;

        if (String(over?.id).includes("_bottom")) {
            const {id, location, type, name} = draggedItem;
            if (type === "Token" || !handleDropToStackBottom) return;
            handleDropToStackBottom(id, location, to, name);
            return;
        }

        if (to.startsWith("myDigi") || ["myBreedingArea", "myTrash"].includes(to)) {
            dropCardOrStack(dragItem.content, to);
        }

        if (to.startsWith("opponentDigi") || ["opponentSecurity"].includes(to)) {
            handleDropToOpponent(draggedItem.location, to);
        }

        if (to === "myHand") handleDropToHand(draggedItem);
        if (to === "myDeckField") dropCardToStack(draggedItem, "Top");
        if (to === "myDeckField_bottom") dropCardToStack(draggedItem, "Bottom");
        if (to === "myEggDeck") handleDropToEggDeck(draggedItem);
        if (to === "mySecurity") handleDropToSecurity(draggedItem);
    }

    return handleDragEnd;
}
