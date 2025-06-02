import useWebSocket, { SendMessage } from "react-use-websocket";
import { AttackPhase, BootStage, CardModifiers, Phase, Player, SIDE } from "../utils/types.ts";
import { getOpponentSfx } from "../utils/functions.ts";
import { findTokenByName } from "../utils/tokens.ts";
import { notifySecurityView } from "../utils/toasts.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import { useGeneralStates } from "./useGeneralStates.ts";
import { useCallback, useRef, useState } from "react";
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

function chunkString(str: string, size: number): string[] {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.substring(i, i + size));
    }
    return chunks;
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
    const updateOpponentField = useGameBoardStates((state) => state.updateOpponentField);
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
    const getMyFieldAsString = useGameBoardStates((state) => state.getMyFieldAsString);
    const setArrowFrom = useGameBoardStates((state) => state.setArrowFrom);
    const setArrowTo = useGameBoardStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameBoardStates((state) => state.setIsEffectArrow);
    const setStartingPlayer = useGameBoardStates((state) => state.setStartingPlayer);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);
    const flipCard = useGameBoardStates((state) => state.flipCard);

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
        const chunks = chunkString(getMyFieldAsString(), 1000);
        const timeoutIds: number[] = [];
        for (const chunk of chunks) {
            const timeoutId = setTimeout(() => {
                websocket.sendMessage(`${gameId}:/updateGame:${chunk}`);
            }, 10);
            timeoutIds.push(timeoutId);
        }
        return () => timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    }

    const [resetOnlineCheck, setResetOnlineCheck] = useState<(() => void) | null>(null);
    const onlineCheckTimeoutRef = useRef<number | null>(null);

    const opponentOnlineCheck = useCallback(() => {
        const cancelSetOffline = () => {
            if (onlineCheckTimeoutRef.current !== null) {
                clearTimeout(onlineCheckTimeoutRef.current);
                onlineCheckTimeoutRef.current = null;
            }
            setIsOpponentOnline(true);
        };

        onlineCheckTimeoutRef.current = setTimeout(() => {
            setIsOpponentOnline(false);
        }, 30000);

        setResetOnlineCheck(() => cancelSetOffline);
    }, [setIsOpponentOnline]);

    const websocket = useWebSocket(websocketURL, {
        heartbeat: { interval: 5000, message: `${gameId}:/online:${opponentName}` },
        shouldReconnect: () => true,

        onOpen: () => {
            if (bootStage > BootStage.SHOW_STARTING_PLAYER) {
                setIsLoading(false);
                websocket.sendMessage("/reconnect:" + gameId);
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
                const me = players.slice().filter((player: Player) => player.username === user)[0];
                const opponent = players.slice().filter((player: Player) => player.username !== user)[0];
                setUpGame(me, opponent);
                setMyAttackPhase(false);
                setOpponentAttackPhase(false);
                setRestartObject({ me, opponent });
                if (isPlayerOne && !isRematch) websocket.sendMessage("/getStartingPlayers:" + gameId);
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const chunk = event.data.substring("[DISTRIBUTE_CARDS]:".length);
                distributeCards(user, chunk, gameId, sendLoaded, playDrawCardSfx);
                setOpenedCardModal(false);
                return;
            }

            if (event.data.startsWith("[UPDATE_OPPONENT]:")) {
                const chunk = event.data.substring("[UPDATE_OPPONENT]:".length);
                updateOpponentField(chunk, sendLoaded);
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
                const cardId = parts[0];
                const from = parts[1];
                const to = parts[2];
                moveCard(cardId, from, to);
                if (!getOpponentReady()) setOpponentReady(true);
                if (getOpponentReady() && bootStage >= BootStage.MULLIGAN) setBootStage(BootStage.GAME_IN_PROGRESS);
                return;
            }

            if (event.data.startsWith("[MOVE_CARD_TO_STACK]:")) {
                const parts = event.data.substring("[MOVE_CARD_TO_STACK]:".length).split(":");
                const topOrBottom = parts[0];
                const cardId = parts[1];
                const from = parts[2];
                const to = parts[3];
                const facing = parts[4] === "undefined" ? undefined : parts[4];
                moveCardToStack(topOrBottom, cardId, from, to, facing);
                return;
            }

            if (event.data.startsWith("[TILT_CARD]:")) {
                const parts = event.data.substring("[TILT_CARD]:".length).split(":");

                const cardId = parts[0];
                const location = parts[1];
                tiltCard(cardId, location, playSuspendSfx, playUnsuspendSfx);
                return;
            }

            if (event.data.startsWith("[FLIP_CARD]:")) {
                const parts = event.data.substring("[FLIP_CARD]:".length).split(":");

                const cardId = parts[0];
                const location = parts[1];
                flipCard(cardId, location);
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
                clearAttackAnimation?.();
                setArrowFrom(parts[0]);
                setArrowTo(parts[1]);
                setIsEffectArrow(parts[2] === "true");
                restartAttackAnimation(parts[2] === "true");
                return;
            }

            if (event.data.startsWith("[OPPONENT_ATTACK_PHASE]:")) {
                const attackPhase: AttackPhase | "false" = event.data.substring("[OPPONENT_ATTACK_PHASE]:".length);
                setOpponentAttackPhase(attackPhase === "false" ? false : attackPhase);
                return;
            }

            if (event.data.startsWith("[CREATE_TOKEN]:")) {
                const parts = event.data.substring("[CREATE_TOKEN]:".length).split(":");
                const id = parts[0];
                const token = findTokenByName(parts[1]);
                createToken(token, SIDE.OPPONENT, id);
                return;
            }

            if (event.data.startsWith("[SET_MODIFIERS]:")) {
                const parts = event.data.substring("[SET_MODIFIERS]:".length).split(":");
                const id = parts[0];
                const location = parts[1];
                const modifiers: CardModifiers = JSON.parse(parts.slice(2).join(":"));
                setModifiers(id, location, modifiers);
                return;
            }

            switch (event.data) {
                case "[HEARTBEAT]": {
                    break;
                }
                case "[OPPONENT_ONLINE]": {
                    resetOnlineCheck?.();
                    opponentOnlineCheck?.();
                    break;
                }
                case "[SURRENDER]": {
                    setEndModal(true);
                    setEndModalText("🎉 Your opponent surrendered!");
                    break;
                }
                case "[SECURITY_VIEWED]": {
                    notifySecurityView();
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
                case "[OPPONENT_RECONNECTED]": {
                    sendUpdate();
                    break;
                }
                default: {
                    getOpponentSfx(event.data, {
                        playButtonClickSfx,
                        playDrawCardSfx,
                        playNextPhaseSfx,
                        playOpponentPlaceCardSfx,
                        playPassTurnSfx,
                        playRevealCardSfx,
                        playSecurityRevealSfx,
                        playShuffleDeckSfx,
                        playSuspendSfx,
                        playTrashCardSfx,
                        playUnsuspendSfx,
                    });
                }
            }
        },
    });

    return { sendMessage: websocket.sendMessage, sendUpdate };
}
