import {DraggedItem, DraggedStack, Phase, SendToStackFunction} from "../utils/types.ts";
import {useGame} from "./useGame.ts";
import {convertForLog} from "../utils/functions.ts";
import {useDrop} from "react-dnd";
import {useSound} from "./useSound.ts";

type UseDropZoneProps = {
    sendCardToStack: SendToStackFunction,
    sendChatMessage: (message: string) => void,
    nextPhase: () => void,
    setArrowFrom: (from: string) => void,
    setArrowTo: (to: string) => void,
    setShowAttackArrow: (visible: boolean) => void,
    endAttackAnimation: (effect: boolean) => void,
    setIsEffect: (effect: boolean) => void,
    sendSfx: (sfx: string) => void,
    sendMoveCard: (id: string, from: string, to: string) => void,
    resolveMyAttack: (initiating: boolean) => void,
    setSecurityMoodle: (isOpen: boolean) => void,
    setEggDeckMoodle: (isOpen: boolean) => void,
    sendAttackArrows: (from: string, to: string, isEffect: boolean) => void,
    clearAttackAnimation?: () => void
}

export default function useDropZone(props: UseDropZoneProps) {

    const {
        sendCardToStack,
        sendChatMessage,
        nextPhase,
        setArrowFrom,
        setArrowTo,
        setShowAttackArrow,
        endAttackAnimation,
        setIsEffect,
        sendSfx,
        sendMoveCard,
        resolveMyAttack,
        setSecurityMoodle,
        setEggDeckMoodle,
        sendAttackArrows,
        clearAttackAnimation
    } = props;

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

    function isCardStack(item: DraggedItem | DraggedStack): item is DraggedStack {
        const {index} = item as DraggedStack;
        return index > 0;
    }

    function dropCardOrStack(item: DraggedItem | DraggedStack, targetField: string) {
        if (item.location === "myBreedingArea") nextPhaseTrigger(nextPhase, Phase.BREEDING);
        if (isCardStack(item)) {
            const {index, location} = item;
            moveCardStack(index, location, targetField, handleDropToField);
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
        const effect = !myTurn || type !== "Digimon" || getPhase() !== Phase.MAIN || (type === "Digimon" && !areCardsSuspended(from));
        const attackAllowed = areCardsSuspended(from) || (getDigimonNumber(from) === "BT12-083")

        clearAttackAnimation?.();
        setArrowFrom(from);
        setArrowTo(to);
        if (effect) setIsEffect(true);
        setShowAttackArrow(true);
        sendAttackArrows(from, to, effect);
        endAttackAnimation(effect);
        if (!effect && attackAllowed) resolveMyAttack(true);
    }

    function handleDropToField(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendMoveCard(cardId, from, to);
        const hiddenCardInfo = (from === "myHand" && ["myTrash", "myDeckField"].includes(to)) ? ` (…${cardId.slice(-5)})` : "";
        if (from !== to) sendChatMessage(`[FIELD_UPDATE]≔【${cardName + hiddenCardInfo}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
    }

    function handleDropToStackBottom(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCardToStack("Top", cardId, from, to);
        playPlaceCardSfx();
        sendSfx("playPlaceCardSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【${cardName}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
        if (from === to) {
            const timer = setTimeout(() => {
                sendCardToStack("Top", cardId, from, to);
            }, 30);
            return () => clearTimeout(timer);
        } else sendCardToStack("Top", cardId, from, to);
    }

    const [, dropToDigi1] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi1")
    }));

    const [, dropToDigi2] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi2")
    }));

    const [, dropToDigi3] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi3")
    }));

    const [, dropToDigi4] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi4")
    }));

    const [, dropToDigi5] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi5")
    }));

    const [, dropToDigi6] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi6")
    }));

    const [, dropToDigi7] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi7")
    }));

    const [, dropToDigi8] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi8")
    }));

    const [, dropToDigi9] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi9")
    }));

    const [, dropToDigi10] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi10")
    }));

    const [, dropToDigi11] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi11")
    }));

    const [, dropToDigi12] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi12")
    }));

    const [, dropToDigi13] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi13")
    }));

    const [, dropToDigi14] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi14")
    }));

    const [, dropToDigi15] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myDigi15")
    }));

    const [, dropToBreedingArea] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myBreedingArea")
    }));

    const [, dropToHand] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, name} = item;
            moveCard(id, location, 'myHand');
            sendMoveCard(id, location, 'myHand');
            playCardToHandSfx();
            if (location !== "myHand") sendChatMessage(`[FIELD_UPDATE]≔【${name}】﹕${convertForLog(location)} ➟ ${convertForLog("myHand")}`);
        }
    }));

    const [{isOverDeckTop}, dropToDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => dropCardToStack(item, "Top"),
        collect: (monitor) => ({
            isOverDeckTop: !!monitor.isOver(),
        }),
    }));

    const [{isOverBottom, canDropToDeckBottom}, dropToDeckBottom] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => dropCardToStack(item, "Bottom"),
        collect: (monitor) => ({
            isOverBottom: !!monitor.isOver(),
            canDropToDeckBottom: !!monitor.canDrop(),
        }),
    }));

    const [, dropToEggDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            if (id.startsWith("TOKEN")) return;
            setCardToSend(id, location);
            setEggDeckMoodle(true);
            setSecurityMoodle(false);
        }
    }));

    const [, dropToSecurity] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            if (id.startsWith("TOKEN")) return;
            setCardToSend(id, location);
            setSecurityMoodle(true);
            setEggDeckMoodle(false);
        }
    }));

    const [{isOverTrash}, dropToTrash] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => dropCardOrStack(item, "myTrash"),
        collect: (monitor) => ({
            isOverTrash: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi1] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi1')
    }));

    const [, dropToOpponentDigi2] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi2')
    }));

    const [, dropToOpponentDigi3] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi3')
    }));

    const [, dropToOpponentDigi4] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi4')
    }));

    const [, dropToOpponentDigi5] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi5')
    }));

    const [, dropToOpponentDigi6] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi6')
    }));

    const [, dropToOpponentDigi7] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi7')
    }));

    const [, dropToOpponentDigi8] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi8')
    }));

    const [, dropToOpponentDigi9] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi9')
    }));

    const [, dropToOpponentDigi10] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi10')
    }));

    const [, dropToOpponentDigi11] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi11')
    }));

    const [, dropToOpponentDigi12] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi12')
    }));

    const [, dropToOpponentDigi13] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi13')
    }));

    const [, dropToOpponentDigi14] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi14')
    }));

    const [, dropToOpponentDigi15] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentDigi15')
    }));

    const [, dropToOpponentSecurity] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => handleDropToOpponent(item.location, 'opponentSecurity')
    }));

    return {
        dropToDigi1,
        dropToDigi2,
        dropToDigi3,
        dropToDigi4,
        dropToDigi5,
        dropToDigi6,
        dropToDigi7,
        dropToDigi8,
        dropToDigi9,
        dropToDigi10,
        dropToDigi11,
        dropToDigi12,
        dropToDigi13,
        dropToDigi14,
        dropToDigi15,
        dropToHand,
        dropToBreedingArea,
        dropToDeck,
        dropToDeckBottom,
        dropToEggDeck,
        dropToSecurity,
        dropToTrash,
        handleDropToStackBottom,
        isOverTrash,
        isOverDeckTop,
        isOverBottom,
        canDropToDeckBottom,
        dropToOpponentDigi1,
        dropToOpponentDigi2,
        dropToOpponentDigi3,
        dropToOpponentDigi4,
        dropToOpponentDigi5,
        dropToOpponentDigi6,
        dropToOpponentDigi7,
        dropToOpponentDigi8,
        dropToOpponentDigi9,
        dropToOpponentDigi10,
        dropToOpponentDigi11,
        dropToOpponentDigi12,
        dropToOpponentDigi13,
        dropToOpponentDigi14,
        dropToOpponentDigi15,
        dropToOpponentSecurity
    };
}
