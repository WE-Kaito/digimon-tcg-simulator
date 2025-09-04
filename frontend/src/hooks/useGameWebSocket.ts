import useWebSocket, { SendMessage } from "react-use-websocket";
import { AttackPhase, BootStage, CardModifiers, Phase, Player, SIDE } from "../utils/types.ts";
import { findTokenByName } from "../utils/tokens.ts";
import { notifyInfo } from "../utils/toasts.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import { useGeneralStates } from "./useGeneralStates.ts";
import { useEffect } from "react";
import { useSound } from "./useSound.ts";
import { useGameUIStates } from "./useGameUIStates.ts";

const currentPort = window.location.port;
// TODO: using www.project-drasil.online as the domain is not working, need a fix
const websocketURL =
    currentPort === "5173" ? "ws://192.168.0.26:8080/api/ws/game" : "wss://project-drasil.online/api/ws/game";

type UseGameWebSocketProps = {
    clearAttackAnimation: (() => void) | null;
    restartAttackAnimation: (effect?: boolean) => void; // prop for this and useDropZone
};

type UseGameWebSocketReturn = {
    sendMessage: SendMessage;
};

function getValidOffset(fieldNumber: number, currentOffset: number) {
    const MAX_OFFSET = 8;
    const FIELDS_VISIBLE = 8;

    // If already visible, keep the current offset
    if (fieldNumber >= currentOffset + 1 && fieldNumber <= currentOffset + FIELDS_VISIBLE) return currentOffset;

    let newOffset;

    if (fieldNumber > currentOffset + FIELDS_VISIBLE) newOffset = fieldNumber - FIELDS_VISIBLE;
    else newOffset = fieldNumber - 1;

    // Clamp between 0 and MAX_OFFSET
    if (newOffset > MAX_OFFSET) newOffset = MAX_OFFSET;
    if (newOffset < 0) newOffset = 0;

    return newOffset;
}

/**
 * Handling of all game-related incoming websocket messages.
 * Needs to be instantiated in the GamePage component. Use the returned SendMessage function to send messages to the server.
 */
export default function useGameWebSocket(props: UseGameWebSocketProps): UseGameWebSocketReturn {
    const { clearAttackAnimation, restartAttackAnimation } = props;

    const user = useGeneralStates((state) => state.user);

    const setOpenedCardModal = useGameUIStates((state) => state.setOpenedCardModal);
    const setRestartOrder = useGameUIStates((state) => state.setRestartOrder);
    const setRestartPromptModal = useGameUIStates((state) => state.setRestartPromptModal);
    const isRematch = useGameUIStates((state) => state.isRematch);
    const setIsRematch = useGameUIStates((state) => state.setIsRematch);
    const setEndModal = useGameUIStates((state) => state.setEndModal);
    const setEndModalText = useGameUIStates((state) => state.setEndModalText);
    const setOpponentEmote = useGameUIStates((state) => state.setOpponentEmote);

    const gameId = useGameBoardStates((state) => state.gameId);
    const setBootStage = useGameBoardStates((state) => state.setBootStage);
    const setPlayers = useGameBoardStates((state) => state.setPlayers);
    const setPhase = useGameBoardStates((state) => state.setPhase);
    const setMyAttackPhase = useGameBoardStates((state) => state.setMyAttackPhase);
    const setOpponentAttackPhase = useGameBoardStates((state) => state.setOpponentAttackPhase);
    const distributeCards = useGameBoardStates((state) => state.distributeCards);
    const setMessages = useGameBoardStates((state) => state.setMessages);
    const setAllMessages = useGameBoardStates((state) => state.setAllMessages);
    const setUsernameTurn = useGameBoardStates((state) => state.setUsernameTurn);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);
    const tiltCard = useGameBoardStates((state) => state.tiltCard);
    const setCardIdWithEffect = useGameBoardStates((state) => state.setCardIdWithEffect);
    const setCardIdWithTarget = useGameBoardStates((state) => state.setCardIdWithTarget);
    const setMemory = useGameBoardStates((state) => state.setMemory);
    const createToken = useGameBoardStates((state) => state.createToken);
    const setModifiers = useGameBoardStates((state) => state.setModifiers);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const phase = useGameBoardStates((state) => state.phase);
    const progressToNextPhase = useGameBoardStates((state) => state.progressToNextPhase);
    const unsuspendAll = useGameBoardStates((state) => state.unsuspendAll);
    const setStartingPlayer = useGameBoardStates((state) => state.setStartingPlayer);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);
    const flipCard = useGameBoardStates((state) => state.flipCard);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);
    const fieldOffset = useGameUIStates((state) => state.fieldOffset);
    const setFieldOffset = useGameUIStates((state) => state.setFieldOffset);
    const setOpponentFieldOffset = useGameUIStates((state) => state.setOpponentFieldOffset);

    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];

    const playCoinFlipSfx = useSound((state) => state.playCoinFlipSfx);
    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);
    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playOpponentPlaceCardSfx = useSound((state) => state.playOpponentPlaceCardSfx);
    const playPassTurnSfx = useSound((state) => state.playPassTurnSfx);
    const playRevealCardSfx = useSound((state) => state.playRevealCardSfx);
    const playSecurityRevealSfx = useSound((state) => state.playSecurityRevealSfx);
    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);
    const playSuspendSfx = useSound((state) => state.playSuspendSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);
    const playRematchSfx = useSound((state) => state.playRematchSfx);

    function clearCardEffect() {
        const timer = setTimeout(() => setCardIdWithEffect(""), 2600);
        return () => clearTimeout(timer);
    }

    function clearCardTarget() {
        const timer = setTimeout(() => setCardIdWithTarget(""), 3500);
        return () => clearTimeout(timer);
    }

    let interval: ReturnType<typeof setInterval>;

    const websocket = useWebSocket(websocketURL, {
        shouldReconnect: () => true,

        onOpen: () => websocket.sendMessage("/joinGame:" + gameId),

        onMessage: (event) => {
            if (event.data === "[START_GAME]") {
                setStartingPlayer("");
                setMyAttackPhase(false);
                setOpponentAttackPhase(false);
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const gameStateJson = event.data.substring("[DISTRIBUTE_CARDS]:".length);
                distributeCards(user, gameStateJson, gameId, playDrawCardSfx);
                setOpenedCardModal(false);
                return;
            }

            if (event.data.startsWith("[PLAYER_INFO]:")) {
                const playersJson = event.data.substring("[PLAYER_INFO]:".length);
                const players: Player[] = JSON.parse(playersJson);
                setPlayers(players[0], players[1]);
            }

            if (event.data.startsWith("[SET_BOOT_STAGE]:")) {
                setBootStage(parseInt(event.data.substring("[SET_BOOT_STAGE]:".length)));
                return;
            }

            if (event.data.startsWith("[SET_PHASE]:")) {
                setPhase(event.data.substring("[SET_PHASE]:".length));
                return;
            }

            if (event.data.startsWith("[SET_TURN]:")) {
                setUsernameTurn(event.data.substring("[SET_TURN]:".length));
                return;
            }

            if (event.data.startsWith("[STARTING_PLAYER]")) {
                const firstPlayer = event.data.substring("[STARTING_PLAYER]≔".length);

                setStartingPlayer(firstPlayer);
                setBootStage(BootStage.SHOW_STARTING_PLAYER);
                isRematch ? playRematchSfx() : playCoinFlipSfx();
                if (firstPlayer === user) setUsernameTurn(user);
                else setUsernameTurn(opponentName);
                setMessages(event.data);
                return;
            }

            if (event.data.startsWith("[MOVE_CARD]:")) {
                const parts = event.data.substring("[MOVE_CARD]:".length).split(":");
                const cardId = parts?.[0];
                const from = parts?.[1];
                const to = parts?.[2];
                if (cardId && from && to) moveCard(cardId, from, to);
                return;
            }

            if (event.data.startsWith("[MOVE_CARD_TO_STACK]:")) {
                const parts = event.data.substring("[MOVE_CARD_TO_STACK]:".length).split(":");
                const topOrBottom = parts?.[0];
                const cardId = parts?.[1];
                const from = parts?.[2];
                const to = parts?.[3];
                const facing = parts?.[4] === "undefined" ? undefined : parts?.[4];
                if (topOrBottom && cardId && from && to) moveCardToStack(topOrBottom, cardId, from, to, facing);
                return;
            }

            if (event.data.startsWith("[TILT_CARD]:")) {
                const parts = event.data.substring("[TILT_CARD]:".length).split(":");

                const cardId = parts?.[0];
                const location = parts?.[1];
                if (cardId && location) tiltCard(cardId, location, playSuspendSfx, playUnsuspendSfx);
                return;
            }

            if (event.data.startsWith("[FLIP_CARD]:")) {
                const parts = event.data.substring("[FLIP_CARD]:".length).split(":");

                const cardId = parts?.[0];
                const location = parts?.[1];
                if (cardId && location) flipCard(cardId, location);
                return;
            }

            if (event.data.startsWith("[ACTIVATE_EFFECT]:")) {
                const id = event.data.substring("[ACTIVATE_EFFECT]:".length);
                setCardIdWithEffect(id);
                clearCardEffect();
                return;
            }

            if (event.data.startsWith("[ACTIVATE_TARGET]:")) {
                const id = event.data.substring("[ACTIVATE_TARGET]:".length);
                setCardIdWithTarget(id);
                clearCardTarget();
                return;
            }

            if (event.data.startsWith("[UPDATE_MEMORY]:")) {
                const newMemory = event.data.substring("[UPDATE_MEMORY]:".length);
                setMemory(parseInt(newMemory));
                return;
            }

            if (event.data.startsWith("[CHAT_MESSAGE]:")) {
                const chatMessage = event.data.substring("[CHAT_MESSAGE]:".length);
                setMessages(chatMessage);
                return;
            }

            if (event.data.startsWith("[CHAT_HISTORY]:")) {
                const chatHistoryJson = event.data.substring("[CHAT_HISTORY]:".length);
                try {
                    const chatHistory: string[] = JSON.parse(chatHistoryJson);
                    setAllMessages(chatHistory);
                } catch (e) {
                    console.warn("Failed to parse chat history:", chatHistoryJson);
                }
                return;
            }

            if (event.data.startsWith("[EMOTE]:")) {
                const emote = event.data.substring("[EMOTE]:".length);
                setOpponentEmote(emote);
                return;
            }

            if (event.data.startsWith("[ATTACK]:")) {
                const parts = event.data.substring("[ATTACK]:".length).split(":");
                if (parts.length < 3) return;
                const fromMatch = parts[0]?.match(/\d+/);
                const toMatch = parts[1]?.match(/\d+/);

                if (fromMatch?.length > 0 && toMatch?.length > 0 && fromMatch[0] && toMatch[0]) {
                    const fromFieldNumber = Number(fromMatch[0]);
                    setOpponentFieldOffset(getValidOffset(fromFieldNumber, fieldOffset));
                    const toFieldNumber = Number(toMatch[0]);
                    setFieldOffset(getValidOffset(toFieldNumber, fieldOffset));
                    clearAttackAnimation?.();
                    setArrowFrom(parts[0]);
                    setArrowTo(parts[1]);
                    setIsEffectArrow(parts[2] === "true");
                    restartAttackAnimation(parts[2] === "true");
                }
                return;
            }

            if (event.data.startsWith("[OPPONENT_ATTACK_PHASE]:")) {
                const attackPhase: AttackPhase | "false" = event.data.substring("[OPPONENT_ATTACK_PHASE]:".length);
                setOpponentAttackPhase(attackPhase === "false" ? false : attackPhase);
                return;
            }

            if (event.data.startsWith("[CREATE_TOKEN]:")) {
                const parts = event.data.substring("[CREATE_TOKEN]:".length).split(":");
                if (parts.length < 2) return;
                const id = parts[0];
                const token = findTokenByName(parts[1]);
                if (token) createToken(token, SIDE.OPPONENT, id);
                return;
            }

            if (event.data.startsWith("[SET_MODIFIERS]:")) {
                const parts = event.data.substring("[SET_MODIFIERS]:".length).split(":");
                if (parts.length < 3) return;
                const id = parts[0];
                const location = parts[1];
                try {
                    const modifiers: CardModifiers = JSON.parse(parts.slice(2).join(":"));
                    setModifiers(id, location, modifiers);
                } catch (e) {
                    // Handle JSON parse errors gracefully
                    console.warn("Failed to parse modifiers:", parts.slice(2).join(":"));
                }
                return;
            }

            if (event.data.includes("SFX")) {
                switch (event.data) {
                    case "[REVEAL_SFX]": {
                        playRevealCardSfx();
                        break;
                    }
                    case "[SECURITY_REVEAL_SFX]": {
                        playSecurityRevealSfx();
                        break;
                    }
                    case "[PLACE_CARD_SFX]": {
                        playOpponentPlaceCardSfx();
                        break;
                    }
                    case "[DRAW_CARD_SFX]": {
                        playDrawCardSfx();
                        break;
                    }
                    case "[SUSPEND_CARD_SFX]": {
                        playSuspendSfx();
                        break;
                    }
                    case "[UNSUSPEND_CARD_SFX]": {
                        playUnsuspendSfx();
                        break;
                    }
                    case "[BUTTON_CLICK_SFX]": {
                        playButtonClickSfx();
                        break;
                    }
                    case "[TRASH_CARD_SFX]": {
                        playTrashCardSfx();
                        break;
                    }
                    case "[SHUFFLE_DECK_SFX]": {
                        playShuffleDeckSfx();
                        break;
                    }
                    case "[NEXT_PHASE_SFX]": {
                        playNextPhaseSfx();
                        break;
                    }
                    case "[PASS_TURN_SFX]": {
                        playPassTurnSfx();
                        break;
                    }
                }
            }

            switch (event.data) {
                case "[HEARTBEAT]": {
                    break;
                }
                case "[SURRENDER]": {
                    setEndModal(true);
                    setEndModalText("🎉 Your opponent surrendered!");
                    break;
                }
                case "[SECURITY_VIEWED]": {
                    notifyInfo("Opponent opened Security Stack!");
                    break;
                }
                case "[RESTART_AS_FIRST]": {
                    setRestartOrder("second");
                    setRestartPromptModal(true);
                    break;
                }
                case "[RESTART_AS_SECOND]": {
                    setRestartOrder("first");
                    setRestartPromptModal(true);
                    break;
                }
                case "[ACCEPT_RESTART]": {
                    setMyAttackPhase(false);
                    setOpponentAttackPhase(false);
                    clearBoard();
                    setIsRematch(true);
                    setEndModal(false);
                    break;
                }
                case "[UPDATE_PHASE]": {
                    if (phase === Phase.MAIN) setUsernameTurn(user); // opponent sent phase_update in main -> passed turn
                    progressToNextPhase();
                    break;
                }
                case "[RESOLVE_COUNTER_BLOCK]": {
                    setMyAttackPhase(AttackPhase.RESOLVE_ATTACK);
                    break;
                }
                case "[UNSUSPEND_ALL]": {
                    unsuspendAll(SIDE.OPPONENT);
                    break;
                }
                case "[OPPONENT_DISCONNECTED]": {
                    setIsOpponentOnline(false);
                    break;
                }
                case "[OPPONENT_RECONNECTED]": {
                    setIsOpponentOnline(true);
                    break;
                }
                default: {
                    break;
                }
            }
        },
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        interval = setInterval(() => websocket.sendMessage(`${gameId}:/online:${opponentName}`), 5000);
        return () => clearInterval(interval);
    }, []);

    return { sendMessage: websocket.sendMessage };
}
