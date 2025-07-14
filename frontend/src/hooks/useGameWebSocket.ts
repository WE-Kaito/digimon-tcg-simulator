import useWebSocket, { SendMessage } from "react-use-websocket";
import { AttackPhase, BootStage, CardModifiers, Phase, Player, SIDE } from "../utils/types.ts";
import { getOpponentSfx } from "../utils/functions.ts";
import { findTokenByName } from "../utils/tokens.ts";
import { notifySecurityView } from "../utils/toasts.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import { useGeneralStates } from "./useGeneralStates.ts";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const setStartingPlayer = useGameBoardStates((state) => state.setStartingPlayer);
    const setIsOpponentOnline = useGameBoardStates((state) => state.setIsOpponentOnline);
    const flipCard = useGameBoardStates((state) => state.flipCard);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);

    // Improved player one detection with validation
    const gameIdParts = gameId.split("‗");
    const isPlayerOne = user === gameIdParts[0] && gameIdParts.length === 2;
    const opponentName = gameIdParts.filter((username) => username !== user)[0];

    // Validate game ID format and player assignment
    useEffect(() => {
        if (gameIdParts.length !== 2 || !gameIdParts.includes(user)) {
            console.error("Invalid game ID format or player not found in game ID:", gameId);
            setEndModal(true);
            setEndModalText("Game initialization error. Please try again.");
        }
    }, [gameId, user, gameIdParts, setEndModal, setEndModalText]);

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
                startLoadingStateTimeout(); // Start loading timeout
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

                // Clear distribution timeout since we're receiving cards
                if (distributionTimeoutRef.current) {
                    clearTimeout(distributionTimeoutRef.current);
                    distributionTimeoutRef.current = null;
                }

                // Start loaded timeout for opponent response
                startLoadedTimeout();
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
                        if (isPlayerOne) {
                            websocket.sendMessage("/distributeCards:" + gameId);
                            startDistributionTimeout(); // Start timeout monitoring
                        }
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

                    // Clear any pending boot timeouts for rematch
                    clearBootTimeouts();
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

                    // Clear all loading-related timeouts
                    if (loadedTimeoutRef.current) {
                        clearTimeout(loadedTimeoutRef.current);
                        loadedTimeoutRef.current = null;
                    }
                    if (loadingStateTimeoutRef.current) {
                        clearTimeout(loadingStateTimeoutRef.current);
                        loadingStateTimeoutRef.current = null;
                    }
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

    // Boot stage timeout management
    const distributionTimeoutRef = useRef<number | null>(null);
    const loadedTimeoutRef = useRef<number | null>(null);
    const loadingStateTimeoutRef = useRef<number | null>(null);
    const bootStageTimeoutRef = useRef<number | null>(null);

    // State validation functions
    const validateGameState = useCallback(() => {
        const state = useGameBoardStates.getState();
        const hasCards = state.myHand.length > 0 && state.myDeckField.length > 0 && state.mySecurity.length > 0;
        const hasOpponentCards =
            state.opponentHand.length > 0 && state.opponentDeckField.length > 0 && state.opponentSecurity.length > 0;
        const hasAvatars = state.myAvatar && state.opponentAvatar;
        const hasGameId = gameId && gameId.includes("‗");

        return {
            hasCards,
            hasOpponentCards,
            hasAvatars,
            hasGameId,
            isFullyDistributed: hasCards && hasOpponentCards,
            isGameSetup: hasAvatars && hasGameId,
        };
    }, [gameId]);

    // Boot stage timeout functions
    const startDistributionTimeout = useCallback(() => {
        if (distributionTimeoutRef.current) clearTimeout(distributionTimeoutRef.current);

        distributionTimeoutRef.current = setTimeout(() => {
            const validation = validateGameState();
            console.warn("Card distribution timeout - attempting smart recovery...", validation);

            if (!validation.isFullyDistributed) {
                // Try redistribution based on current player role and state
                if (isPlayerOne) {
                    websocket.sendMessage("/distributeCards:" + gameId);
                } else {
                    websocket.sendMessage("/distributeCards:" + gameId);
                }

                // Start one more timeout for final attempt
                distributionTimeoutRef.current = setTimeout(() => {
                    const finalValidation = validateGameState();
                    if (!finalValidation.isFullyDistributed) {
                        console.error("Final distribution timeout - showing error");
                        setEndModal(true);
                        setEndModalText("Failed to distribute cards. Please try restarting the match.");
                    }
                }, 15000); // 15 second final timeout
            } else {
                // Cards are actually distributed, just fix the stage
                setBootStage(BootStage.MULLIGAN);
            }
        }, 20000); // 20 second initial timeout
    }, [gameId, isPlayerOne, websocket, setEndModal, setEndModalText, validateGameState, setBootStage]);

    const startLoadedTimeout = useCallback(() => {
        if (loadedTimeoutRef.current) clearTimeout(loadedTimeoutRef.current);

        loadedTimeoutRef.current = setTimeout(() => {
            const validation = validateGameState();
            console.warn("Loaded message timeout - attempting recovery", validation);

            // Clear loading state regardless
            setIsLoading(false);

            // Progress stage if cards are properly distributed
            if (validation.isFullyDistributed) {
                if (bootStage < BootStage.MULLIGAN) {
                    setBootStage(BootStage.MULLIGAN);
                } else if (bootStage === BootStage.MULLIGAN_DONE) {
                    setBootStage(BootStage.GAME_IN_PROGRESS);
                }
            }
        }, 15000); // 15 second timeout
    }, [bootStage, setBootStage, setIsLoading, validateGameState]);

    const startLoadingStateTimeout = useCallback(() => {
        if (loadingStateTimeoutRef.current) clearTimeout(loadingStateTimeoutRef.current);

        loadingStateTimeoutRef.current = setTimeout(() => {
            const validation = validateGameState();
            console.warn("Loading state timeout - attempting recovery", validation);

            // Always clear loading state
            setIsLoading(false);

            // Try to recover based on current state
            if (!validation.isGameSetup) {
                websocket.sendMessage("/joinGame:" + gameId);
            } else if (!validation.isFullyDistributed) {
                if (isPlayerOne) {
                    websocket.sendMessage("/distributeCards:" + gameId);
                } else {
                    // Give player 2 a chance to take over
                    setTimeout(() => websocket.sendMessage("/distributeCards:" + gameId), 2000);
                }
            } else {
                // Everything looks good, just progress the stage
                if (bootStage < BootStage.MULLIGAN) {
                    setBootStage(BootStage.MULLIGAN);
                }
            }
        }, 30000); // 30 second loading timeout
    }, [setIsLoading, validateGameState, websocket, gameId, isPlayerOne, bootStage, setBootStage]);

    const attemptRecovery = useCallback(() => {
        const validation = validateGameState();
        console.log("Attempting recovery for stage:", bootStage, "Validation:", validation);

        switch (bootStage) {
            case BootStage.CLEAR:
                // Stuck at game start - rejoin
                websocket.sendMessage("/joinGame:" + gameId);
                break;

            case BootStage.SHOW_STARTING_PLAYER:
                if (!validation.isGameSetup) {
                    // Missing game setup, restart
                    websocket.sendMessage("/joinGame:" + gameId);
                } else if (isPlayerOne) {
                    // Player 1 should request starting player
                    websocket.sendMessage("/getStartingPlayers:" + gameId);
                } else {
                    // Player 2 waits, but can take over if needed
                    setTimeout(() => {
                        if (bootStage === BootStage.SHOW_STARTING_PLAYER) {
                            websocket.sendMessage("/getStartingPlayers:" + gameId);
                        }
                    }, 5000);
                }
                break;

            default:
                // For other stages, try to progress from current state
                if (!validation.isFullyDistributed && isPlayerOne) {
                    websocket.sendMessage("/distributeCards:" + gameId);
                } else if (!validation.isFullyDistributed && !isPlayerOne) {
                    // Player 2 can take over distribution if needed
                    websocket.sendMessage("/distributeCards:" + gameId);
                } else if (validation.isFullyDistributed && bootStage < BootStage.MULLIGAN) {
                    // Cards are distributed but stage is wrong, fix it
                    setBootStage(BootStage.MULLIGAN);
                }
                break;
        }
    }, [bootStage, gameId, isPlayerOne, websocket, validateGameState, setBootStage]);

    const startBootStageTimeout = useCallback(() => {
        if (bootStageTimeoutRef.current) clearTimeout(bootStageTimeoutRef.current);

        bootStageTimeoutRef.current = setTimeout(() => {
            console.warn("Boot stage timeout - attempting recovery for stage:", bootStage);
            attemptRecovery();

            // Set a final timeout for complete failure
            bootStageTimeoutRef.current = setTimeout(() => {
                console.error("Recovery failed - showing error");
                setEndModal(true);
                setEndModalText("Unable to start game after multiple attempts. Please restart the match.");
            }, 20000); // 20 second final timeout after recovery attempt
        }, 30000); // 30 second initial timeout before recovery
    }, [bootStage, attemptRecovery, setEndModal, setEndModalText]);

    const clearBootTimeouts = useCallback(() => {
        if (distributionTimeoutRef.current) {
            clearTimeout(distributionTimeoutRef.current);
            distributionTimeoutRef.current = null;
        }
        if (loadedTimeoutRef.current) {
            clearTimeout(loadedTimeoutRef.current);
            loadedTimeoutRef.current = null;
        }
        if (loadingStateTimeoutRef.current) {
            clearTimeout(loadingStateTimeoutRef.current);
            loadingStateTimeoutRef.current = null;
        }
        if (bootStageTimeoutRef.current) {
            clearTimeout(bootStageTimeoutRef.current);
            bootStageTimeoutRef.current = null;
        }
    }, []);

    // Monitor boot stage progression and auto-correct inconsistencies
    useEffect(() => {
        if (bootStage < BootStage.MULLIGAN) {
            startBootStageTimeout();
        } else {
            // Clear boot stage timeout when game is in progress or during mulligan
            if (bootStageTimeoutRef.current) {
                clearTimeout(bootStageTimeoutRef.current);
                bootStageTimeoutRef.current = null;
            }
        }

        // Periodic health check to auto-correct stage mismatches
        const healthCheckInterval = setInterval(() => {
            const validation = validateGameState();

            // Auto-correct stage if cards are distributed but stage is wrong
            if (validation.isFullyDistributed && bootStage < BootStage.MULLIGAN) {
                setBootStage(BootStage.MULLIGAN);
            }

            // Stop health checks once game is in progress
            if (bootStage >= BootStage.GAME_IN_PROGRESS) {
                clearInterval(healthCheckInterval);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(healthCheckInterval);
    }, [bootStage, startBootStageTimeout, validateGameState, setBootStage]);

    // Cleanup timeouts on unmount
    useEffect(() => () => clearBootTimeouts(), [clearBootTimeouts]);

    return { sendMessage: websocket.sendMessage, sendUpdate };
}
