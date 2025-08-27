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
    /**
     * Sends the whole chunked game state as JSON to your opponent.
     */
    sendUpdate: () => void;
};

function getValidOffset(fieldNumber: number, currentOffset: number) {
    const MAX_OFFSET = 8;
    const FIELDS_VISIBLE = 8;

    // If already visible, keep the current offset
    if (fieldNumber >= currentOffset + 1 && fieldNumber <= currentOffset + FIELDS_VISIBLE) {
        return currentOffset;
    }

    let newOffset;

    if (fieldNumber > currentOffset + FIELDS_VISIBLE) {
        // Push it to the right edge
        newOffset = fieldNumber - FIELDS_VISIBLE;
    } else {
        // Push it to the left edge
        newOffset = fieldNumber - 1;
    }

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
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const setBootStage = useGameBoardStates((state) => state.setBootStage);
    const setUpGame = useGameBoardStates((state) => state.setUpGame);
    const setMyAttackPhase = useGameBoardStates((state) => state.setMyAttackPhase);
    const setOpponentAttackPhase = useGameBoardStates((state) => state.setOpponentAttackPhase);
    const distributeCards = useGameBoardStates((state) => state.distributeCards);
    const updateFields = useGameBoardStates((state) => state.updateFields);
    const setMessages = useGameBoardStates((state) => state.setMessages);
    const setTurn = useGameBoardStates((state) => state.setTurn);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);
    const restartObject = useGameBoardStates((state) => state.restartObject);
    const setRestartObject = useGameBoardStates((state) => state.setRestartObject);
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);
    const setOpponentReady = useGameBoardStates((state) => state.setOpponentReady);
    const setIsLoading = useGameBoardStates((state) => state.setIsLoading);
    const tiltCard = useGameBoardStates((state) => state.tiltCard);
    const setCardIdWithEffect = useGameBoardStates((state) => state.setCardIdWithEffect);
    const setCardIdWithTarget = useGameBoardStates((state) => state.setCardIdWithTarget);
    const setMemory = useGameBoardStates((state) => state.setMemory);
    const createToken = useGameBoardStates((state) => state.createToken);
    const setModifiers = useGameBoardStates((state) => state.setModifiers);
    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const getPhase = useGameBoardStates((state) => state.getPhase);
    const setPhase = useGameBoardStates((state) => state.setPhase);
    const unsuspendAll = useGameBoardStates((state) => state.unsuspendAll);
    const getUpdateDistributionString = useGameBoardStates((state) => state.getUpdateDistributionString);
    const setStartingPlayer = useGameBoardStates((state) => state.setStartingPlayer);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);
    const flipCard = useGameBoardStates((state) => state.flipCard);
    const isReconnecting = useGameBoardStates((state) => state.isReconnecting);
    const setIsReconnecting = useGameBoardStates((state) => state.setIsReconnecting);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);
    const fieldOffset = useGameUIStates((state) => state.fieldOffset);
    const setFieldOffset = useGameUIStates((state) => state.setFieldOffset);
    const setOpponentFieldOffset = useGameUIStates((state) => state.setOpponentFieldOffset);

    const isPlayerOne = user === gameId.split("‗")[0];
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

    const sendLoaded = () => websocket.sendMessage(`${gameId}:/loaded:${opponentName}`);

    function clearCardEffect() {
        const timer = setTimeout(() => setCardIdWithEffect(""), 2600);
        return () => clearTimeout(timer);
    }

    function clearCardTarget() {
        const timer = setTimeout(() => setCardIdWithTarget(""), 3500);
        return () => clearTimeout(timer);
    }

    function sendUpdate() {
        const gameState = getUpdateDistributionString(user, gameId);
        websocket.sendMessage(`${gameId}:/updateGame:${gameState}`);
    }

    let interval: ReturnType<typeof setInterval>;

    const websocket = useWebSocket(websocketURL, {
        shouldReconnect: () => true,

        onOpen: () => {
            if (isReconnecting) {
                setIsLoading(false);
                websocket.sendMessage("/reconnect:" + gameId);
                setIsReconnecting(false);
            } else websocket.sendMessage("/joinGame:" + gameId);
        },

        onMessage: (event) => {
            if (event.data === "[PLAYERS_READY]" && isPlayerOne && bootStage < BootStage.MULLIGAN) {
                websocket.sendMessage("/startGame:" + gameId);
                return;
            }

            if (event.data.startsWith("[START_GAME]:")) {
                setIsLoading(true);
                setStartingPlayer("");
                setOpponentReady(false);
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const myPlayerArray = players.slice().filter((player: Player) => player.username === user);
                const opponentPlayerArray = players.slice().filter((player: Player) => player.username !== user);
                if (myPlayerArray.length === 0 || opponentPlayerArray.length === 0) return;
                const me = myPlayerArray[0];
                const opponent = opponentPlayerArray[0];
                setUpGame(me, opponent);
                setMyAttackPhase(false);
                setOpponentAttackPhase(false);
                setRestartObject({ me, opponent });
                if (isPlayerOne && !isRematch) websocket.sendMessage("/getStartingPlayers:" + gameId);
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const gameStateJson = event.data.substring("[DISTRIBUTE_CARDS]:".length);
                distributeCards(user, gameStateJson, gameId, sendLoaded, playDrawCardSfx);
                setOpenedCardModal(false);
                return;
            }

            if (event.data.startsWith("[UPDATE_OPPONENT]:")) {
                const gameStateJson = event.data.substring("[UPDATE_OPPONENT]:".length);
                updateFields(gameStateJson, sendLoaded, user, gameId);
                return;
            }

            if (event.data.startsWith("[STARTING_PLAYER]:")) {
                const firstPlayer = event.data.substring("[STARTING_PLAYER]:".length);

                setStartingPlayer(firstPlayer);
                setBootStage(BootStage.SHOW_STARTING_PLAYER);
                isRematch ? playRematchSfx() : playCoinFlipSfx();

                const timeout = setTimeout(
                    () => {
                        setMessages("[STARTING_PLAYER]≔" + firstPlayer);
                        if (firstPlayer === user) setTurn(true);
                        setOpponentReady(false);
                        if (isPlayerOne) websocket.sendMessage("/distributeCards:" + gameId);
                    },
                    isRematch ? 1500 : 4800
                );

                return () => clearTimeout(timeout);
            }

            if (event.data.startsWith("[MOVE_CARD]:")) {
                const parts = event.data.substring("[MOVE_CARD]:".length).split(":");
                const cardId = parts?.[0];
                const from = parts?.[1];
                const to = parts?.[2];
                if (cardId && from && to) {
                    moveCard(cardId, from, to);
                    if (!getOpponentReady()) setOpponentReady(true);
                    if (getOpponentReady() && bootStage >= BootStage.MULLIGAN) setBootStage(BootStage.GAME_IN_PROGRESS);
                }
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
                    setUpGame(restartObject.me, restartObject.opponent);
                    break;
                }
                case "[PLAYER_READY]": {
                    setOpponentReady(true);
                    if (bootStage === BootStage.MULLIGAN_DONE) setBootStage(BootStage.GAME_IN_PROGRESS);
                    break;
                }
                case "[UPDATE_PHASE]": {
                    if (getPhase() === Phase.MAIN) setTurn(true);
                    setPhase();
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
                case "[LOADED]": {
                    setIsLoading(false);
                    break;
                }
                case "[OPPONENT_DISCONNECTED]": {
                    setIsOpponentOnline(false);
                    break;
                }
                case "[OPPONENT_RECONNECTED]": {
                    setIsOpponentOnline(true);
                    sendUpdate();
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

        const handleUnload = () => setIsReconnecting(true);
        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("offline", handleUnload);

        return () => {
            clearInterval(interval);

            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("offline", handleUnload);
        };
    }, []);

    return { sendMessage: websocket.sendMessage, sendUpdate };
}
