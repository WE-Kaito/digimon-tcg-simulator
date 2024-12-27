import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {
    AttackPhase,
    BootStage, CardModifiers,
    CardTypeGame,
    FieldCardContextMenuItemProps,
    HandCardContextMenuItemProps,
    Phase,
    Player
} from "../utils/types.ts";
import {profilePicture} from "../utils/avatars.ts";
import {
    calculateCardOffsetX,
    calculateCardOffsetY,
    calculateCardRotation,
    convertForLog, getAttributeImage, getCardTypeImage,
    getOpponentSfx,
    handleImageError, isTrue, numbersWithModifiers
} from "../utils/functions.ts";
import {useGame} from "../hooks/useGame.ts";
import {CSSProperties, useCallback, useEffect, useRef, useState} from "react";
import styled from "@emotion/styled";
import SurrenderRestartWindow from "../components/game/SurrenderRestartWindow.tsx";
import EndWindow from "../components/game/EndWindow.tsx";
import Card, {CardAnimationContainer} from "../components/Card.tsx";
import noiseBG from "../assets/noiseBG.png";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import SendToDeckModalButtons from "../components/game/SendToDeckModalButtons.tsx";
import targetAnimation from "../assets/lotties/target-animation.json";
import effectAnimation from "../assets/lotties/activate-effect-animation.json";
import Lottie from "lottie-react";
import {Fade, Flip, Zoom} from "react-awesome-reveal";
import MemoryBar from "../components/game/MemoryBar.tsx";
import {notifyOpponentDisconnect, notifyRequestedRestart, notifySecurityView} from "../utils/toasts.ts";
import AttackArrows from "../components/game/AttackArrows.tsx";
import GameChat from "../components/game/GameChat.tsx";
import CardStack from "../components/game/CardStack.tsx";
import {Item, ItemParams, Menu, Separator, useContextMenu} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import {getSleeve} from "../utils/sleeves.ts";
import {Button as MuiButton} from "@mui/material";
import {
    AddModerator as RecoveryIcon,
    AdsClick as TargetIcon,
    BackHand as HandIcon,
    Curtains as RevealIcon,
    DeleteForever as TrashIcon,
    LocalFireDepartment as EffectIcon,
    Pageview as OpenSecurityIcon,
    RestoreFromTrash as TrashFromDeckIcon,
    ShuffleOnOutlined as ShuffleIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Wifi as ConnectingIcon,
    WifiOff as OfflineIcon,
    Backspace as ClearIcon,
    GavelRounded as RulingsIcon,
    SportsEsportsRounded as ControlsIcon
} from '@mui/icons-material';
import PhaseIndicator from "../components/game/PhaseIndicator.tsx";
import UnsuspendAllButton from "../components/game/UnsuspendAllButton.tsx";
import RestartPrompt from "../components/game/RestartPrompt.tsx";
import AttackResolveButton from "../components/game/AttackResolveButton.tsx";
import useDropZone from "../hooks/useDropZone.ts";
import {findTokenByName} from "../utils/tokens.ts";
import TokenButton from "../components/game/TokenButton.tsx";
import ModifierMenu from "../components/game/ModifierMenu.tsx";
import cardBackSrc from "../assets/cardBack.jpg";
import deckBackSrc from "../assets/deckBack.png";
import eggBackSrc from "../assets/eggBack.jpg";
import stackIconSrc from "../assets/stackIcon.png";
import {useSound} from "../hooks/useSound.ts";
import SoundBar from "../components/SoundBar.tsx";
import SecurityStack from "../components/game/SecurityStack.tsx";

export default function Game({user}: { user: string }) {
    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://project-drasil.online/api/ws/game";

    const selectedCard = useStore((state) => state.selectedCard);
    const selectCard = useStore((state) => state.selectCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const gameId = useGame((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const clearBoard = useGame((state) => state.clearBoard);
    const distributeCards = useGame((state) => state.distributeCards);
    const getMyFieldAsString = useGame((state) => state.getMyFieldAsString);
    const updateOpponentField = useGame((state) => state.updateOpponentField);
    const shuffleSecurity = useGame((state) => state.shuffleSecurity);
    const setCardIdWithEffect = useGame((state) => state.setCardIdWithEffect);
    const setCardIdWithTarget = useGame((state) => state.setCardIdWithTarget);
    const getIsCardTarget = useGame((state) => state.getIsCardTarget);
    const setModifiers = useGame((state) => state.setModifiers);
    const getCardLocationById = useGame((state) => state.getCardLocationById);
    const cardIdWithEffect = useGame((state) => state.cardIdWithEffect);
    const cardIdWithTarget = useGame((state) => state.cardIdWithTarget);

    const cardToSend = useGame((state) => state.cardToSend);
    const contextCard = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[])?.find(card => card.id === cardToSend.id));

    const moveCard = useGame((state) => state.moveCard);
    const moveCardToStack = useGame((state) => state.moveCardToStack);
    const tiltCard = useGame((state) => state.tiltCard);
    const unsuspendAll = useGame((state) => state.unsuspendAll);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const mySleeve = useGame((state) => state.mySleeve);
    const opponentSleeve = useGame((state) => state.opponentSleeve);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];

    const [endScreen, setEndScreen] = useState<boolean>(false);
    const [endScreenMessage, setEndScreenMessage] = useState<string>("");
    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [eggDeckMoodle, setEggDeckMoodle] = useState<boolean>(false);
    const [securityMoodle, setSecurityMoodle] = useState<boolean>(false);
    const [trashMoodle, setTrashMoodle] = useState<boolean>(false);
    const [opponentTrashMoodle, setOpponentTrashMoodle] = useState<boolean>(false);
    const [securityContentMoodle, setSecurityContentMoodle] = useState<boolean>(false);
    const [restartMoodle, setRestartMoodle] = useState<boolean>(false);
    const [restartPromptModal, setRestartPromptModal] = useState<boolean>(false);
    const [startingPlayer, setStartingPlayer] = useState<string>("");
    const [showAttackArrow, setShowAttackArrow] = useState<boolean>(false);
    const [arrowFrom, setArrowFrom] = useState<string>("");
    const [arrowTo, setArrowTo] = useState<string>("");
    const [attackFromOpponent, setAttackFromOpponent] = useState<boolean>(false);
    const [isMySecondRowVisible, setIsMySecondRowVisible] = useState<boolean>(false);
    const [isOpponentSecondRowVisible, setIsOpponentSecondRowVisible] = useState<boolean>(false)
    const [isHandHidden, setIsHandHidden] = useState<boolean>(false);
    const [isRematch, setIsRematch] = useState<boolean>(false);

    const [restartOrder, setRestartOrder] = useState<"second" | "first">("second");
    const [isEffect, setIsEffect] = useState<boolean>(false);
    const [clearAttackAnimation, setClearAttackAnimation] = useState<(() => void) | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isOpponentOnline, setIsOpponentOnline] = useState(true);
    const [resetOnlineCheck, setResetOnlineCheck] = useState<(() => void) | null>(null);

    const setMessages = useGame((state) => state.setMessages);
    const mulligan = useGame((state) => state.mulligan);
    const createToken = useGame((state) => state.createToken);
    const setMemory = useGame((state) => state.setMemory);
    const setPhase = useGame((state) => state.setPhase);
    const setTurn = useGame((state) => state.setTurn);
    const getOpponentReady = useGame((state) => state.getOpponentReady);
    const setOpponentReady = useGame((state) => state.setOpponentReady);
    const nextPhaseTrigger = useGame((state) => state.nextPhaseTrigger);

    const isLoading = useGame((state) => state.isLoading);
    const setIsLoading = useGame((state) => state.setIsLoading);

    const restartObject = useGame((state) => state.restartObject);
    const setRestartObject = useGame((state) => state.setRestartObject);
    const bootStage = useGame((state) => state.bootStage);
    const setBootStage = useGame((state) => state.setBootStage);

    const isMyTurn = useGame((state) => state.isMyTurn);
    const getIsMyTurn = useGame((state) => state.getIsMyTurn);
    const getPhase = useGame((state) => state.getPhase);
    const setMyAttackPhase = useGame((state) => state.setMyAttackPhase);
    const setOpponentAttackPhase = useGame((state) => state.setOpponentAttackPhase);
    const myAttackPhase = useGame((state) => state.myAttackPhase);
    const opponentAttackPhase = useGame((state) => state.opponentAttackPhase);
    const getMyAttackPhase = useGame((state) => state.getMyAttackPhase);
    const getOpponentAttackPhase = useGame((state) => state.getOpponentAttackPhase);

    const myHand = useGame((state) => state.myHand);
    const myDeckField = useGame((state) => state.myDeckField);
    const myEggDeck = useGame((state) => state.myEggDeck);
    const myTrash = useGame((state) => state.myTrash);
    const mySecurity = useGame((state) => state.mySecurity);
    const myReveal = useGame((state) => state.myReveal);

    const myDigi1 = useGame((state) => state.myDigi1);
    const myDigi2 = useGame((state) => state.myDigi2);
    const myDigi3 = useGame((state) => state.myDigi3);
    const myDigi4 = useGame((state) => state.myDigi4);
    const myDigi5 = useGame((state) => state.myDigi5);
    const myDigi6 = useGame((state) => state.myDigi6);
    const myDigi7 = useGame((state) => state.myDigi7);
    const myDigi8 = useGame((state) => state.myDigi8);
    const myDigi9 = useGame((state) => state.myDigi9);
    const myDigi10 = useGame((state) => state.myDigi10);
    const myDigi11 = useGame((state) => state.myDigi11);
    const myDigi12 = useGame((state) => state.myDigi12);
    const myDigi13 = useGame((state) => state.myDigi13);
    const myDigi14 = useGame((state) => state.myDigi14);
    const myDigi15 = useGame((state) => state.myDigi15);
    const myBreedingArea = useGame((state) => state.myBreedingArea);

    const opponentHand = useGame((state) => state.opponentHand);
    const opponentDeckField = useGame((state) => state.opponentDeckField);
    const opponentEggDeck = useGame((state) => state.opponentEggDeck);
    const opponentTrash = useGame((state) => state.opponentTrash);
    const opponentReveal = useGame((state) => state.opponentReveal);

    const opponentDigi1 = useGame((state) => state.opponentDigi1);
    const opponentDigi2 = useGame((state) => state.opponentDigi2);
    const opponentDigi3 = useGame((state) => state.opponentDigi3);
    const opponentDigi4 = useGame((state) => state.opponentDigi4);
    const opponentDigi5 = useGame((state) => state.opponentDigi5);
    const opponentDigi6 = useGame((state) => state.opponentDigi6);
    const opponentDigi7 = useGame((state) => state.opponentDigi7);
    const opponentDigi8 = useGame((state) => state.opponentDigi8);
    const opponentDigi9 = useGame((state) => state.opponentDigi9);
    const opponentDigi10 = useGame((state) => state.opponentDigi10);
    const opponentDigi11 = useGame((state) => state.opponentDigi11);
    const opponentDigi12 = useGame((state) => state.opponentDigi12);
    const opponentDigi13 = useGame((state) => state.opponentDigi13);
    const opponentDigi14 = useGame((state) => state.opponentDigi14);
    const opponentDigi15 = useGame((state) => state.opponentDigi15);
    const opponentBreedingArea = useGame((state) => state.opponentBreedingArea);

    const playActivateEffectSfx = useSound((state) => state.playActivateEffectSfx);
    const playAttackSfx = useSound((state) => state.playAttackSfx);
    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);
    const playLoadMemorybarSfx = useSound((state) => state.playLoadMemorybarSfx);
    const playEffectAttackSfx = useSound((state) => state.playEffectAttackSfx);
    const playModifyCardSfx = useSound((state) => state.playModifyCardSfx);
    const playNextAttackPhaseSfx = useSound((state) => state.playNextAttackPhaseSfx);
    const playRevealCardSfx = useSound((state) => state.playRevealCardSfx);
    const playSecurityRevealSfx = useSound((state) => state.playSecurityRevealSfx);
    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);
    const playStartSfx = useSound((state) => state.playStartSfx);
    const playSuspendSfx = useSound((state) => state.playSuspendSfx);
    const playTargetCardSfx = useSound((state) => state.playTargetCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);
    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);
    const playOpponentPlaceCardSfx = useSound((state) => state.playOpponentPlaceCardSfx);
    const playPassTurnSfx = useSound((state) => state.playPassTurnSfx);

    const mySecondRowWarning = (!isMySecondRowVisible && (myDigi6.length + myDigi7.length + myDigi8.length + myDigi9.length + myDigi10.length) > 0) || (isMySecondRowVisible && (myDigi1.length + myDigi2.length + myDigi3.length + myDigi4.length + myDigi5.length) > 0);
    const opponentSecondRowWarning = (!isOpponentSecondRowVisible && (opponentDigi6.length + opponentDigi7.length + opponentDigi8.length + opponentDigi9.length + opponentDigi10.length) > 0) || (isOpponentSecondRowVisible && (opponentDigi1.length + opponentDigi2.length + opponentDigi3.length + opponentDigi4.length + opponentDigi5.length) > 0);

    const gameHasStarted = bootStage === BootStage.GAME_IN_PROGRESS;

    const isPlayerOne = user === gameId.split("‗")[0];

    let interval: ReturnType<typeof setInterval>;

    const websocket = useWebSocket(websocketURL, {

        onOpen: () => {
            if(bootStage > BootStage.SHOW_STARTING_PLAYER) {
                setIsLoading(false);
                websocket.sendMessage("/reconnect:" + gameId);
            }
            else websocket.sendMessage("/joinGame:" + gameId);
        },

        onMessage: (event) => {

            if((event.data === "[PLAYERS_READY]") && isPlayerOne && bootStage < BootStage.MULLIGAN) {
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
                setRestartObject({me, opponent});
                if (isPlayerOne && !isRematch) websocket.sendMessage("/getStartingPlayers:" + gameId)
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const chunk = event.data.substring("[DISTRIBUTE_CARDS]:".length);
                distributeCards(user, chunk, gameId, sendLoaded, playDrawCardSfx)
                setSecurityContentMoodle(false);
                return;
            }

            if (event.data.startsWith("[UPDATE_OPPONENT]:")) {
                const chunk = event.data.substring("[UPDATE_OPPONENT]:".length);
                updateOpponentField(chunk, sendLoaded);
                return;
            }

            if (event.data.startsWith("[STARTING_PLAYER]:")) {
                const firstPlayer = event.data.substring("[STARTING_PLAYER]:".length);

                setBootStage(BootStage.SHOW_STARTING_PLAYER);
                setStartingPlayer(firstPlayer);
                playStartSfx();

                const timeout1 = setTimeout(() => {
                    setMessages("[STARTING_PLAYER]≔" + firstPlayer);
                    if (firstPlayer === user) setTurn(true);
                    setOpponentReady(false);
                    if (isPlayerOne) websocket.sendMessage("/distributeCards:" + gameId);
                }, 4800);

                const timeout2 = setTimeout(() => {
                    playLoadMemorybarSfx();
                }, 5500);

                return () => {
                    clearTimeout(timeout1);
                    clearTimeout(timeout2);
                };
            }

            if (event.data.startsWith("[MOVE_CARD]:")) {
                const parts = event.data.substring("[MOVE_CARD]:".length).split(":");
                const cardId = parts[0];
                const from = parts[1];
                const to = parts[2];
                moveCard(cardId, from, to);
                if (!getOpponentReady()) setOpponentReady(true);
                if (getOpponentReady() && (bootStage >= BootStage.MULLIGAN)) setBootStage(BootStage.GAME_IN_PROGRESS);
                return;
            }

            if (event.data.startsWith("[MOVE_CARD_TO_STACK]:")) {
                const parts = event.data.substring("[MOVE_CARD_TO_STACK]:".length).split(":");
                const topOrBottom = parts[0];
                const cardId = parts[1];
                const from = parts[2];
                const to = parts[3];
                const sendFaceUp = isTrue(parts[4]);
                moveCardToStack(topOrBottom, cardId, from, to, sendFaceUp);
                return;
            }

            if (event.data.startsWith("[TILT_CARD]:")) {
                const parts = event.data.substring("[TILT_CARD]:".length).split(":");

                const cardId = parts[0];
                const location = parts[1];
                tiltCard(cardId, location, playSuspendSfx, playUnsuspendSfx);
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

            if (event.data.startsWith("[ATTACK]:")) {
                const parts = event.data.substring("[ATTACK]:".length).split(":");
                switch (parts[0]) {
                    case "opponentDigi1":
                    case "opponentDigi2":
                    case "opponentDigi3":
                    case "opponentDigi4":
                    case "opponentDigi5":
                        setIsOpponentSecondRowVisible(false);
                        break;
                    case "opponentDigi6":
                    case "opponentDigi7":
                    case "opponentDigi8":
                    case "opponentDigi9":
                    case "opponentDigi10":
                        setIsOpponentSecondRowVisible(true);
                        break;
                }
                switch (parts[1]) {
                    case "myDigi1":
                    case "myDigi2":
                    case "myDigi3":
                    case "myDigi4":
                    case "myDigi5":
                        setIsMySecondRowVisible(false);
                        break;
                    case "myDigi6":
                    case "myDigi7":
                    case "myDigi8":
                    case "myDigi9":
                    case "myDigi10":
                        setIsMySecondRowVisible(true);
                        break;
                }
                clearAttackAnimation?.();
                setArrowFrom(parts[0]);
                setArrowTo(parts[1]);
                setIsEffect(parts[2] === "true");
                setAttackFromOpponent(true);
                setShowAttackArrow(true);
                endAttackAnimation(parts[2] === "true");
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
                createToken(token, "opponent", id)
                return;
            }

            if (event.data.startsWith("[SET_MODIFIERS]:")) {
                const parts = event.data.substring("[SET_MODIFIERS]:".length).split(":");
                const id = parts[0];
                const location = parts[1];
                const modifiers : CardModifiers = JSON.parse(parts.slice(2).join(":"));
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
                    setEndScreen(true);
                    setEndScreenMessage("🎉 Your opponent surrendered!");
                    break;
                }
                case "[SECURITY_VIEWED]": {
                    notifySecurityView();
                    break;
                }
                case ("[RESTART_AS_FIRST]"): {
                    setRestartOrder("second");
                    setRestartMoodle(true);
                    break;
                }
                case ("[RESTART_AS_SECOND]"): {
                    setRestartOrder("first");
                    setRestartMoodle(true);
                    break;
                }
                case ("[ACCEPT_RESTART]"): {
                    setIsRematch(true);
                    setMyAttackPhase(false);
                    setOpponentAttackPhase(false);
                    clearBoard();
                    setEndScreen(false);
                    setUpGame(restartObject.me, restartObject.opponent);
                    break;
                }
                case ("[PLAYER_READY]"): {
                    setOpponentReady(true);
                    if (bootStage === BootStage.MULLIGAN_DONE) setBootStage(BootStage.GAME_IN_PROGRESS);
                    break;
                }
                case ("[UPDATE_PHASE]"): {
                    if (getPhase() === Phase.MAIN) setTurn(true);
                    setPhase();
                    break;
                }
                case ("[RESOLVE_COUNTER_BLOCK]"): {
                    setMyAttackPhase(AttackPhase.RESOLVE_ATTACK);
                    break;
                }
                case ("[UNSUSPEND_ALL]"): {
                    unsuspendAll("opponent");
                    break;
                }
                case ("[LOADED]"): {
                    setIsLoading(false);
                    break;
                }
                case ("[OPPONENT_RECONNECTED]"): {
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
                        playUnsuspendSfx
                    });
                }
            }
        }
    });

    function sendChatMessage(message: string) {
        if (message.length <= 0) return;
        setMessages(user + "﹕" + message);
        websocket.sendMessage(`${gameId}:/chatMessage:${opponentName}:${message}`);
    }

    const timeoutRef = useRef<number | null>(null);

    const endAttackAnimation = useCallback((effect?: boolean) => {
        if (effect) playEffectAttackSfx();
        else playAttackSfx();

        const cancelAttackAnimation = () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            setShowAttackArrow(false);
            setArrowFrom('');
            setArrowTo('');
            setAttackFromOpponent(false);
            setIsEffect(false);
        };

        timeoutRef.current = setTimeout(() => {
            setShowAttackArrow(false);
            setArrowFrom('');
            setArrowTo('');
            setAttackFromOpponent(false);
            setIsEffect(false);
        }, 3500);

        setClearAttackAnimation(() => cancelAttackAnimation);
    }, [setShowAttackArrow]);

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
        }, 8000);

        setResetOnlineCheck(() => cancelSetOffline);
    }, [setIsOpponentOnline]);

    useEffect(() => {
      if (!endScreen && !isOpponentOnline) {
        notifyOpponentDisconnect();
      }
    }, [endScreen, isOpponentOnline]);

    function chunkString(str: string, size: number): string[] {
        const chunks = [];
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.substring(i, i + size));
        }
        return chunks;
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

    function sendMoveCard(cardId: string, from: string, to: string) {
        websocket.sendMessage(`${gameId}:/moveCard:${opponentName}:${cardId}:${from}:${to}`);
        if ((bootStage === BootStage.MULLIGAN) && getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
    }

    function sendAttackArrows(from: string, to: string, isEffect: boolean) {
        websocket.sendMessage(gameId + ":/attack:" + opponentName + ":" + from + ":" + to + ":" + isEffect);
    }

    function sendCardToStack(topOrBottom: "Top" | "Bottom", cardId: string, location: string, to: string, sendFaceUp = false) {
        websocket.sendMessage(`${gameId}:/moveCardToStack:${opponentName}:${topOrBottom}:${cardId}:${location}:${to}:${sendFaceUp}`);
    }

    function sendTiltCard(cardId: string, location: string) {
        websocket.sendMessage(`${gameId}:/tiltCard:${opponentName}:${cardId}:${location}`);
    }

    function sendUnsuspendAll() {
        websocket.sendMessage(`${gameId}:/unsuspendAll:${opponentName}`);
    }

    function sendMemoryUpdate(memory: number) {
        websocket.sendMessage(`${gameId}:/updateMemory:${opponentName}:${memory}`);
    }

    function sendPhaseUpdate() {
        websocket.sendMessage(`${gameId}:/updatePhase:${opponentName}`);
    }

    function sendTokenMessage(tokenName: string, id: string) {
        websocket.sendMessage(`${gameId}:/createToken:${opponentName}:${id}:${tokenName}`);
        sendSfx("playPlaceCardSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【Spawn ${tokenName}-Token】`);
    }

    function sendSfx(sfx: string) {
        const timeout = setTimeout(() => {
            websocket.sendMessage(gameId + ":/" + sfx + ":" + opponentName);
        }, 10);
        return () => clearTimeout(timeout);
    }

    function getFieldId(isOpponent: boolean, location1arr: CardTypeGame[], location2arr: CardTypeGame[], location1: string, location2: string): string {
        if (location1arr.length === 0 && (isOpponent ? !isOpponentSecondRowVisible : !isMySecondRowVisible)) return location1;
        if (location2arr.length === 0 && (isOpponent ? isOpponentSecondRowVisible : isMySecondRowVisible)) return location2;
        return "";
    }

    const [phaseLoading, setPhaseLoading] = useState(false);

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

    function resolveMyAttack(initiating?: boolean) {
        if (initiating && getPhase() === Phase.MAIN) {
            setMyAttackPhase(AttackPhase.WHEN_ATTACKING);
            sendAttackPhaseUpdate(AttackPhase.WHEN_ATTACKING);
        } else {
            const attackPhase = getMyAttackPhase();
            if (!attackPhase) return;
            else if (attackPhase === AttackPhase.WHEN_ATTACKING) {
                setMyAttackPhase(AttackPhase.COUNTER_BLOCK);
                sendAttackPhaseUpdate(AttackPhase.COUNTER_BLOCK);
            } else if (attackPhase === AttackPhase.RESOLVE_ATTACK) {
                setMyAttackPhase(false);
                sendAttackPhaseUpdate(false);
            }
        }
        playNextAttackPhaseSfx();
        sendSfx("playNextAttackPhaseSfx");
    }

    function sendAttackPhaseUpdate(attackPhase: AttackPhase | false) {
        websocket.sendMessage(`${gameId}:/updateAttackPhase:${opponentName}:${attackPhase}`);
    }

    function sendSetModifiers(cardId: string, location: string, modifiers: CardModifiers) {
        websocket.sendMessage(`${gameId}:/setModifiers:${opponentName}:${cardId}:${location}:${JSON.stringify(modifiers)}`);
        sendSfx("playModifyCardSfx");
    }

    function resolveOpponentAttack() {
        setOpponentAttackPhase(AttackPhase.RESOLVE_ATTACK);
        websocket.sendMessage(`${gameId}:/resolveCounterBlock:${opponentName}`);
        playNextAttackPhaseSfx();
        sendSfx("playNextAttackPhaseSfx");
    }

    useEffect(() => {
        setEggDeckMoodle(false);
        setSecurityMoodle(false);
        if (opponentTrash.length === 0) setOpponentTrashMoodle(false);
        if (myTrash.length === 0) setTrashMoodle(false);

        if ((!!getMyAttackPhase() && !!getOpponentAttackPhase())
            || (getIsMyTurn() && !!getOpponentAttackPhase())
            || (!getIsMyTurn() && !!getMyAttackPhase())) {
            setMyAttackPhase(false);
            setOpponentAttackPhase(false);
        }

        nextPhaseTrigger(nextPhase);
        // eslint-disable-next-line
    }, [
        myHand, myTrash, myDeckField, myEggDeck, myBreedingArea, myReveal, myDigi1, myDigi2, myDigi3, myDigi4,
        myDigi5, myDigi6, myDigi7, myDigi8, myDigi9, myDigi10, myDigi11, myDigi12, myDigi13, myDigi14, myDigi15, isMyTurn
    ]);

    useEffect(() => {
        const handleOnlineStatusChange = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        interval = setInterval(() => {
            websocket.sendMessage(`${gameId}:/online:${opponentName}`);
            setIsOnline(navigator.onLine);
        }, 5000);

        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
            clearInterval(interval);
        };
    }, []);

    const [cardImageUrl, setCardImageUrl] = useState((hoverCard ?? selectedCard)?.imgUrl ?? cardBackSrc);

    useEffect(() => {
        setCardImageUrl((hoverCard ?? selectedCard)?.imgUrl ?? cardBackSrc);
    }, [selectedCard, hoverCard]);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${opponentName}`);
        setSurrenderOpen(false);
        setEndScreen(true);
        setEndScreenMessage("🏳️ You surrendered.");
        if (onlineCheckTimeoutRef.current !== null) {
          clearTimeout(onlineCheckTimeoutRef.current);
          onlineCheckTimeoutRef.current = null;
        }
    }

    function acceptRestart() {
        clearBoard();
        setEndScreen(false);
        setRestartMoodle(false);
        setIsRematch(true);
        websocket.sendMessage(`${gameId}:/acceptRestart:${opponentName}`);
        websocket.sendMessage(`${gameId}:/restartGame:${restartOrder === "first" ? user : opponentName}`);
    }

    const sendLoaded = () => websocket.sendMessage(`${gameId}:/loaded:${opponentName}`);

    function moveDeckCard(to: string, bottomCard?: boolean) {
        if (!getOpponentReady()) return;
        const cardId = (bottomCard) ? myDeckField[myDeckField.length - 1].id : myDeckField[0].id;
        switch (to) {
            case "myReveal":
                playRevealCardSfx();
                sendSfx("playRevealSfx");
                moveCard(cardId, "myDeckField", "myReveal");
                sendMoveCard(cardId, "myDeckField", "myReveal");
                if (bottomCard) sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[myDeckField.length - 1].name}】﹕Deck Bottom ➟ Reveal`);
                else sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Reveal`);
                break;
            case "myTrash":
                playTrashCardSfx();
                sendSfx("playTrashCardSfx");
                moveCard(cardId, "myDeckField", "myTrash");
                sendMoveCard(cardId, "myDeckField", "myTrash");
                sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Trash`);
                break;
            case "mySecurity":
                playUnsuspendSfx();
                sendSfx("playUnsuspendCardSfx");
                moveCardToStack("Top", cardId, "myDeckField", "mySecurity");
                sendCardToStack("Top", cardId, "myDeckField", "mySecurity");
                sendChatMessage(`[FIELD_UPDATE]≔【Top Deck Card】﹕➟ Security Top`)
                break;
            case "myHand":
                playDrawCardSfx();
                sendSfx("playDrawCardSfx");
                moveCard(cardId, "myDeckField", "myHand");
                sendMoveCard(cardId, "myDeckField", "myHand");
                sendChatMessage(`[FIELD_UPDATE]≔【Draw Card】`);
                break;
        }
    }

    function handleMulligan(mulliganWanted: boolean) {
        if (mulliganWanted) {
            mulligan();
            sendUpdate();
            playShuffleDeckSfx();
            sendSfx("playShuffleDeckSfx");
            sendChatMessage(`[FIELD_UPDATE]≔【MULLIGAN】`);
        }
        websocket.sendMessage(gameId + ":/playerReady:" + opponentName);
        if (getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
        else setBootStage(BootStage.MULLIGAN_DONE);
    }

    function handleOpenSecurity(onOpenOrClose: "onOpen" | "onClose") {
        if (onOpenOrClose === "onOpen") {
            setSecurityContentMoodle(true);
            setTrashMoodle(false);
            websocket.sendMessage(gameId + ":/openedSecurity:" + opponentName);
            sendChatMessage(`[FIELD_UPDATE]≔【Opened Security】`);
        } else {
            setSecurityContentMoodle(false);
            handleShuffleSecurity();
            sendChatMessage(`[FIELD_UPDATE]≔【Closed Security】`);
        }
    }

    function handleShuffleSecurity() {
        shuffleSecurity();
        sendUpdate();
        playShuffleDeckSfx();
        sendChatMessage(`[FIELD_UPDATE]≔【↻ Security Stack】`);
        sendSfx("playShuffleDeckSfx");
    }

    function moveSecurityCard(to: "myTrash" | "myHand", bottomCard?: boolean) {
        if (!getOpponentReady()) return;
        const card = (bottomCard) ? mySecurity[mySecurity.length - 1] : mySecurity[0];
        moveCard(card.id, "mySecurity", to);
        sendMoveCard(card.id, "mySecurity", to);
        sendChatMessage(`[FIELD_UPDATE]≔【${to === "myHand" ? "Card" : card.name}】﹕Security ${bottomCard ? "Bot" : "Top"} ➟ ${convertForLog(to)}`);
        sendSfx((to === "myHand") ? "playDrawCardSfx" : "playTrashCardSfx");
        (to === "myHand") ? playDrawCardSfx() : playTrashCardSfx();
    }

    function revealHandCard({props}: ItemParams<HandCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        moveCard(myHand[props.index].id, "myHand", "myReveal");
        sendMoveCard(myHand[props.index].id, "myHand", "myReveal");
        sendChatMessage(`[FIELD_UPDATE]≔【${myHand[props.index].name}】﹕Hand ➟ Reveal`);
        playRevealCardSfx();
        sendSfx("playRevealSfx");
    }

    function activateEffectAnimation({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        const {name, id, location} = props;
        websocket.sendMessage(`${gameId}:/activateEffect:${opponentName}:${id}`);
        sendChatMessage(`[FIELD_UPDATE]≔【${name} at ${convertForLog(location)}】﹕✨ EFFECT ✨`);
        setCardIdWithEffect(id);
        playActivateEffectSfx();
        sendSfx("playActivateEffectSfx");
        clearCardEffect();
    }

    function clearCardEffect() {
        const timer = setTimeout(() => setCardIdWithEffect(""), 2600);
        return () => clearTimeout(timer);
    }

    function activateTargetAnimation({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        const {name, id, location} = props;
        const logName = (location === "opponentHand") ? `ID: …${id.slice(-5)}` : name;
        websocket.sendMessage(`${gameId}:/activateTarget:${opponentName}:${id}`);
        sendChatMessage(`[FIELD_UPDATE]≔【${logName} at ${convertForLog(location)}】﹕💥 TARGETED 💥`);
        setCardIdWithTarget(id);
        playTargetCardSfx();
        sendSfx("playTargetCardSfx");
        clearCardTarget();
    }

    function resetModifiers({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (props === undefined) return;
        const modifiers = { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: contextCard?.color ?? []};
        setModifiers(props?.id, props?.location, modifiers);
        sendSetModifiers(props?.id, props?.location, modifiers);
        playModifyCardSfx();
    }

    function clearCardTarget() {
        const timer = setTimeout(() => setCardIdWithTarget(""), 3500);
        return () => clearTimeout(timer);
    }

    function sendSecurityReveal(){
        if (opponentReveal.length === 0) moveCard(mySecurity[0].id, "mySecurity", "myReveal");
        sendMoveCard(mySecurity[0].id, "mySecurity", "myReveal");
        playSecurityRevealSfx();
        sendSfx("playSecurityRevealSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security ➟ Reveal`);
    }

    const {
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
    } = useDropZone({
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
        clearAttackAnimation: clearAttackAnimation ?? (() => {
        })
    });

    const {show: showDeckMenu} = useContextMenu({id: "deckMenu"});
    const {show: showDetailsImageMenu} = useContextMenu({id: "detailsImageMenu"});
    const {show: showHandCardMenu} = useContextMenu({id: "handCardMenu", props: {index: -1}});
    const {show: showFieldCardMenu} = useContextMenu({id: "fieldCardMenu", props: {index: -1, location: "", id: ""}});
    const {show: showOpponentCardMenu} = useContextMenu({id: "opponentCardMenu", props: {index: -1, location: "", id: ""}});

    const effectInMyTrash = getCardLocationById(cardIdWithEffect ?? "") === "myTrash";
    const effectInOpponentTrash = getCardLocationById(cardIdWithEffect ?? "") === "opponentTrash";
    const targetInMyTrash = getCardLocationById(cardIdWithTarget ?? "") === "myTrash";
    const targetInOpponentTrash = getCardLocationById(cardIdWithTarget ?? "") === "opponentTrash";

    const color1 = localStorage.getItem("color1") ?? "#214d44";
    const color2 = localStorage.getItem("color2") ?? "#0b3d65";
    const color3 = localStorage.getItem("color3") ?? "#522170";

    const hasModifierMenu = contextCard?.cardType === "Digimon" || numbersWithModifiers.includes(String(contextCard?.cardNumber));
    const hideMenuItemStyle = hasModifierMenu ? {} : { visibility: "hidden", position: "absolute"};

    return <>
        {/*Div to preload asset images*/}
        <div style={{position: "absolute", pointerEvents: "none", visibility: "hidden"}}>
            <img width={30} alt={"cardType1"} src={getCardTypeImage("Digimon")}/>
            <img width={30} alt={"cardType2"} src={getCardTypeImage("Option")}/>
            <img width={30} alt={"cardType3"} src={getCardTypeImage("Tamer")}/>
            <img width={30} alt={"cardType4"} src={getCardTypeImage("DigiEgg")}/>

            <img width={30} alt={"attribute1"} src={getAttributeImage("Virus")}/>
            <img width={30} alt={"attribute2"} src={getAttributeImage("Data")}/>
            <img width={30} alt={"attribute3"} src={getAttributeImage("Vaccine")}/>
            <img width={30} alt={"attribute4"} src={getAttributeImage("Free")}/>
            <img width={30} alt={"attribute5"} src={getAttributeImage("Variable")}/>
            <img width={30} alt={"attribute6"} src={getAttributeImage("Unknown")}/>
            <img width={30} alt={"attribute7"} src={stackIconSrc}/>
            <img width={30} alt={"attribute8"} src={cardBackSrc}/>
        </div>

        {isLoading && <LoadingOverlayDiv/>}
        <BackGroundPattern/>
        <BackGround color1={color1} color2={color2} color3={color3}/>

        <OuterWrapperRefactorLater>
            <OuterWrapper>

                <StyledMenu id={"deckMenu"} theme="dark">
                    <Item onClick={() => moveDeckCard("myReveal", true)}>Reveal Bottom Deck Card ↺</Item>
                </StyledMenu>

                <StyledMenu id={"handCardMenu"} theme="dark">
                    <Item onClick={revealHandCard}>
                        <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                            <span>Reveal Card</span> <RevealIcon/></div>
                    </Item>
                </StyledMenu>

                <StyledMenu id={"fieldCardMenu"} theme="dark">
                    <Item onClick={activateEffectAnimation}>
                        <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                            <span>Activate Effect</span> <EffectIcon/></div>
                    </Item>
                    <Item onClick={activateTargetAnimation}>
                        <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                            <span>Target Card</span> <TargetIcon/></div>
                    </Item>
                    {hasModifierMenu && <Separator/>}
                        <Item onClick={resetModifiers} style={(hideMenuItemStyle as CSSProperties | undefined)}>
                            <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                                <span>Clear Modifiers</span> <ClearIcon/></div>
                        </Item>
                        <ModifierMenu sendSetModifiers={sendSetModifiers}/>
                </StyledMenu>

                <StyledMenu id={"opponentCardMenu"} theme="dark">
                    <Item onClick={activateTargetAnimation}>
                        <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                            <span>Target Card</span> <TargetIcon/></div>
                    </Item>
                </StyledMenu>

                <StyledMenu id={"securityStackMenu"} theme="dark">
                    <Item onClick={() => handleOpenSecurity("onOpen")}>
                        <StyledOpenSecurityIcon color={"warning"} sx={{marginRight: 1}}/>
                        Open Security Stack
                    </Item>
                    <Item onClick={() => moveSecurityCard("myTrash")}>
                        <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                            <StyledTrashIcon color={"error"}/><MiniArrowSpan>▲</MiniArrowSpan>
                        </div>
                        Trash Top Card
                    </Item>
                    <Item onClick={() => moveSecurityCard("myTrash", true)}>
                        <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                            <StyledTrashIcon color={"error"}/><MiniArrowSpan>▼</MiniArrowSpan>
                        </div>
                        Trash Bot Card
                    </Item>
                    <Item onClick={() => moveSecurityCard("myHand")}>
                        <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                            <StyledHandIcon fontSize="inherit"/>
                            <MiniArrowSpanHand>▲</MiniArrowSpanHand>
                        </div>
                        Take Top Card
                    </Item>
                    <Item onClick={() => moveSecurityCard("myHand", true)}>
                        <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                            <StyledHandIcon fontSize="inherit"/>
                            <MiniArrowSpanHand>▼</MiniArrowSpanHand>
                        </div>
                       Take Bot Card
                    </Item>
                    <Item onClick={handleShuffleSecurity}>
                        <StyledShuffleIcon sx={{color: "#42a5f5", fontSize: 20, marginRight: 1.6}}/>
                        Shuffle Security Stack
                    </Item>
                </StyledMenu>

                {selectedCard && <StyledMenu id={"detailsImageMenu"} theme="dark">
                    <Item onClick={() => window.open(selectedCard.imgUrl, '_blank')}>Open Image in new Tab ↗</Item>
                </StyledMenu>}

                {showAttackArrow &&
                    <AttackArrows fromOpponent={attackFromOpponent} from={arrowFrom} to={arrowTo} isEffect={isEffect}/>}

                {surrenderOpen &&
                    <SurrenderRestartWindow setSurrenderOpen={setSurrenderOpen} handleSurrender={handleSurrender}/>}
                {restartMoodle &&
                    <SurrenderRestartWindow restartOrder={restartOrder} setRestartMoodle={setRestartMoodle}
                                            handleAcceptRestart={acceptRestart}/>}
                {endScreen && <EndWindow message={endScreenMessage}/>}

                {restartPromptModal && <RestartPrompt closeModal={() => setRestartPromptModal(false)}
                                                      sendRequest={(request: "AsSecond" | "AsFirst") => {
                                                          websocket.sendMessage(`${gameId}:/restartRequest${request}:${opponentName}`);
                                                          notifyRequestedRestart();
                                                          setRestartPromptModal(false);
                                                      }}/>}

                {(bootStage === BootStage.SHOW_STARTING_PLAYER) &&
                    <Fade direction={"right"}
                          style={{zIndex: 1000, position: "absolute", left: "40%", transform: "translateX(-50%)"}}>
                        <StartingName>1st: {startingPlayer}</StartingName></Fade>}

                <Wrapper>

                    <UserName>{!isOpponentOnline && isOnline &&
                        <OfflineIcon sx={{transform: "translate(-2px,4px)"}} color={"error"}/>}{opponentName}</UserName>
                    <UserName style={{top: "unset", bottom: -30}}>
                        {[0, 2, 3].includes(websocket.readyState) &&
                            <ConnectingIcon sx={{transform: "translate(-2px,4px)"}} color={"warning"}/>}
                        {!isOnline &&
                            <OfflineIcon sx={{transform: "translate(-2px,4px)"}} color={"error"}/>}
                        {user}
                    </UserName>

                    {myReveal.length > 0 &&
                        <RevealContainer style={{top: opponentReveal.length === 0 ? "435px" : "600px"}}>
                            {myReveal?.map((card) =>
                                <Flip key={card.id}><Card card={card} location="myReveal" sendSfx={sendSfx}/></Flip>)}
                        </RevealContainer>}
                    {opponentReveal.length > 0 && <RevealContainer>
                        {opponentReveal?.map((card) =>
                            <Flip key={card.id}><Card card={card} location="opponentReveal" sendSfx={sendSfx}/></Flip>)}
                    </RevealContainer>}

                    <InfoContainer>
                        <InfoSpan>
                                <SoundBar/>
                                <span style={{color: "dodgerblue", transform: "translate(3px, -2px)"}}>🛈 </span>
                                <a href="https://world.digimoncard.com/rule/pdf/general_rules.pdf"
                                   target="_blank" rel="noopener noreferrer" title={"Rulings"}>
                                    <RulingsIcon/>
                                </a>
                                <a href="https://github.com/WE-Kaito/digimon-tcg-simulator/wiki/Features-&-Controls#game-%EF%B8%8F"
                                    target="_blank" rel="noopener noreferrer" title={"Controls"}>
                                    <ControlsIcon/>
                                </a>
                        </InfoSpan>

                        <CardImage onClick={() => selectCard(null)}
                                   onContextMenu={(e) => showDetailsImageMenu({event: e})}
                                   src={cardImageUrl}
                                   alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}
                                   onError={() => setCardImageUrl(cardBackSrc)}/>

                        <CardDetails/>
                    </InfoContainer>

                    {trashMoodle && <TrashView>
                        {myTrash.map((card, index) => <div key={card.id} onContextMenu={(e) => showFieldCardMenu?.({
                            event: e,
                            props: {index, location: "myTrash", id: card.id, name: card.name}
                        })}
                        ><Card card={card} location="myTrash" /></div>)}
                    </TrashView>}

                    {opponentTrashMoodle && <TrashView>
                        {opponentTrash.map((card, index) => <div key={card.id} onContextMenu={(e) => showOpponentCardMenu?.({
                            event: e,
                            props: {index, location: "opponentTrash", id: card.id, name: card.name}
                        })}
                        ><Card card={card} location="opponentTrash" /></div>)}
                    </TrashView>}

                    {securityContentMoodle
                        && <SecurityView>
                            {mySecurity.map((card) => <Card key={card.id} card={card} location="mySecurity"/>)}
                        </SecurityView>}
                    {securityContentMoodle
                        && <CloseSecurityButton variant="contained" onClick={() => handleOpenSecurity("onClose")}>
                            Shuffle & Close</CloseSecurityButton>}

                    <FieldContainer>
                        <div style={{display: "flex"}}>
                            <OpponentContainerMain>

                                {(bootStage > BootStage.SHOW_STARTING_PLAYER) &&
                                    <PhaseIndicator sendPhaseUpdate={sendPhaseUpdate} sendSfx={sendSfx}
                                                    gameHasStarted={gameHasStarted}/>}

                                <OpponentDeckContainer>
                                    {opponentSleeve === "Default"
                                        ? <img alt="deck" src={deckBackSrc} width="105px"/>
                                        : <div style={{width: "105px", position: "relative"}}>
                                            <OpponentDeckSleeve alt="sleeve" src={getSleeve(opponentSleeve)}/>
                                            <img alt="deck" src={deckBackSrc} width="105px"/>
                                        </div>}
                                    <TrashSpan
                                        style={{transform: "translateX(15px)"}}>{opponentDeckField.length}</TrashSpan>
                                </OpponentDeckContainer>

                                <OpponentTrashContainer>
                                    <TrashSpan
                                        style={{transform: "translate(-9px, -2px)"}}>{opponentTrash.length}</TrashSpan>
                                    {opponentTrash.length === 0 ? <TrashPlaceholder>Trash</TrashPlaceholder>
                                        : <TrashCardImage src={opponentTrash[opponentTrash.length - 1].imgUrl}
                                                          alt={"opponentTrash"}
                                                          onClick={() => {
                                                              setOpponentTrashMoodle(!opponentTrashMoodle);
                                                              setTrashMoodle(false);
                                                          }}
                                                          onError={handleImageError}
                                                          title="Open opponents trash"/>}
                                    {effectInOpponentTrash && <TrashLottie isOpponentTrash animationData={effectAnimation} loop={true}/>}
                                    {targetInOpponentTrash && <TrashLottie isOpponentTrash animationData={targetAnimation} loop={true}/>}
                                </OpponentTrashContainer>

                                <OpponentLowerBattleArea>
                                    <BattleArea15 ref={dropToOpponentDigi15} id={"opponentDigi15"}>
                                        <CardStack cards={opponentDigi15} location={"opponentDigi15"}
                                                   showOpponentCardMenu={showOpponentCardMenu}
                                                   opponentSide={true}/>
                                    </BattleArea15>
                                    <BattleArea14 ref={dropToOpponentDigi14} id={"opponentDigi14"}>
                                        <CardStack cards={opponentDigi14} location={"opponentDigi14"}
                                                   showOpponentCardMenu={showOpponentCardMenu}
                                                   opponentSide={true}/>
                                    </BattleArea14>
                                    <BattleArea13 ref={dropToOpponentDigi13} id={"opponentDigi13"}>
                                        <CardStack cards={opponentDigi13} location={"opponentDigi13"}
                                                   showOpponentCardMenu={showOpponentCardMenu}
                                                   opponentSide={true}/>
                                    </BattleArea13>
                                    <BattleArea12 ref={dropToOpponentDigi12} id={"opponentDigi12"}>
                                        <CardStack cards={opponentDigi12} location={"opponentDigi12"}
                                                   showOpponentCardMenu={showOpponentCardMenu}
                                                   opponentSide={true}/>
                                    </BattleArea12>
                                    <BattleArea11 ref={dropToOpponentDigi11} id={"opponentDigi11"}>
                                        <CardStack cards={opponentDigi11} location={"opponentDigi11"}
                                                   showOpponentCardMenu={showOpponentCardMenu}
                                                   opponentSide={true}/>
                                    </BattleArea11>
                                </OpponentLowerBattleArea>

                                <BattleArea5
                                    ref={isOpponentSecondRowVisible ? dropToOpponentDigi10 : dropToOpponentDigi5}
                                    id={getFieldId(true, opponentDigi5, opponentDigi10, "opponentDigi5", "opponentDigi10")}>
                                    {isOpponentSecondRowVisible
                                        ? <CardStack cards={opponentDigi10} location={"opponentDigi10"}
                                                     opponentSide={true}
                                                     showOpponentCardMenu={showOpponentCardMenu}/>
                                        :
                                        <CardStack cards={opponentDigi5} location={"opponentDigi5"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>}
                                </BattleArea5>
                                <BattleArea4
                                    ref={isOpponentSecondRowVisible ? dropToOpponentDigi9 : dropToOpponentDigi4}
                                    id={getFieldId(true, opponentDigi4, opponentDigi9, "opponentDigi4", "opponentDigi9")}>
                                    {isOpponentSecondRowVisible
                                        ?
                                        <CardStack cards={opponentDigi9} location={"opponentDigi9"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>
                                        :
                                        <CardStack cards={opponentDigi4} location={"opponentDigi4"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>}
                                </BattleArea4>
                                <BattleArea3
                                    ref={isOpponentSecondRowVisible ? dropToOpponentDigi8 : dropToOpponentDigi3}
                                    id={getFieldId(true, opponentDigi3, opponentDigi8, "opponentDigi3", "opponentDigi8")}>
                                    {!isOpponentSecondRowVisible && opponentDigi3.length === 0 &&
                                        <FieldSpan>Battle Area</FieldSpan>}
                                    {isOpponentSecondRowVisible
                                        ?
                                        <CardStack cards={opponentDigi8} location={"opponentDigi8"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>
                                        :
                                        <CardStack cards={opponentDigi3} location={"opponentDigi3"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>}
                                </BattleArea3>
                                <BattleArea2
                                    ref={isOpponentSecondRowVisible ? dropToOpponentDigi7 : dropToOpponentDigi2}
                                    id={getFieldId(true, opponentDigi2, opponentDigi7, "opponentDigi2", "opponentDigi7")}>
                                    {isOpponentSecondRowVisible
                                        ?
                                        <CardStack cards={opponentDigi7} location={"opponentDigi7"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>
                                        :
                                        <CardStack cards={opponentDigi2} location={"opponentDigi2"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>}
                                </BattleArea2>
                                <BattleArea1
                                    ref={isOpponentSecondRowVisible ? dropToOpponentDigi6 : dropToOpponentDigi1}
                                    id={getFieldId(true, opponentDigi1, opponentDigi6, "opponentDigi1", "opponentDigi6")}>
                                    {isOpponentSecondRowVisible
                                        ?
                                        <CardStack cards={opponentDigi6} location={"opponentDigi6"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>
                                        :
                                        <CardStack cards={opponentDigi1} location={"opponentDigi1"} opponentSide={true}
                                                   showOpponentCardMenu={showOpponentCardMenu}/>}
                                </BattleArea1>

                                <OpponentHandContainer>
                                    <HandCards cardCount={opponentHand.length}
                                               style={{transform: `translateX(-${opponentHand.length * (opponentHand.length < 11 ? 2.5 : 1.5)}px)`}}>
                                        {opponentHand.map((card, index) =>
                                            <HandListItem cardCount={opponentHand.length} cardIndex={index}
                                                          key={card.id}
                                                          onContextMenu={(e) => showOpponentCardMenu?.({
                                                              event: e,
                                                              props: {
                                                                  index,
                                                                  location: "opponentHand",
                                                                  id: card.id,
                                                                  name: card.name
                                                              }
                                                          })}>
                                                <div style={{
                                                    position: "relative",
                                                    filter: getIsCardTarget(card.id) ? "drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1)" : "unset"
                                                }}>
                                                    {getIsCardTarget(card.id) &&
                                                        <CardAnimationContainer>
                                                            <Lottie animationData={targetAnimation} loop={true}/>
                                                        </CardAnimationContainer>}
                                                    <FaceDownCard alt="card"
                                                                      src={getSleeve(opponentSleeve)}/>
                                                </div>
                                            </HandListItem>)}
                                    </HandCards>
                                    {opponentHand.length > 5 && <MyHandSpan
                                        style={{transform: "rotate(180deg)"}}>{opponentHand.length}</MyHandSpan>}
                                </OpponentHandContainer>

                            </OpponentContainerMain>

                            <OpponentContainerSide>

                                {getMyAttackPhase() && <AttackResolveButton resolveAttack={() => resolveMyAttack()}
                                                                            myAttackPhase={myAttackPhase}/>}

                                <EggDeckContainer>
                                    {opponentEggDeck.length !== 0 &&
                                        <EggDeckSpan
                                            style={{transform: "translateX(-5px)"}}>{opponentEggDeck.length}</EggDeckSpan>}
                                    {opponentEggDeck.length !== 0 && <img alt="egg-deck" src={eggBackSrc} width="95px"
                                                                          style={{transform: "translateX(-5px) rotate(180deg)"}}/>}
                                </EggDeckContainer>

                                <SecurityStackContainer ref={dropToOpponentSecurity}>

                                    <SecurityStack isOpponent />

                                    <OpponentSwitchRowButton1 disabled={showAttackArrow}
                                                              onClick={() => setIsOpponentSecondRowVisible(false)}
                                                              secondRowVisible={!isOpponentSecondRowVisible}/>
                                    <OpponentSwitchRowButton2 disabled={showAttackArrow}
                                                              onClick={() => setIsOpponentSecondRowVisible(true)}
                                                              secondRowVisible={isOpponentSecondRowVisible}/>
                                    {opponentSecondRowWarning && <OpponentSecondRowWarning>!</OpponentSecondRowWarning>}
                                </SecurityStackContainer>

                                <PlayerImage alt="opponent" src={profilePicture(opponentAvatar)} opponent={true}
                                             style={{top: "unset", left: "unset", right: 20, bottom: 0}}
                                             onClick={() => setRestartPromptModal(true)}/>

                                <BreedingAreaContainer {...(opponentBreedingArea.length === 0 && { id: "opponentBreedingArea" })}>
                                    <CardStack cards={opponentBreedingArea} location={"opponentBreedingArea"}
                                               showOpponentCardMenu={showOpponentCardMenu}
                                               opponentSide={true}/>
                                    {opponentBreedingArea.length === 0 && <FieldSpan>Breeding<br/>Area</FieldSpan>}
                                </BreedingAreaContainer>

                            </OpponentContainerSide>
                        </div>

                        {(bootStage > BootStage.SHOW_STARTING_PLAYER)
                            ? <Zoom><MemoryBar sendMemoryUpdate={sendMemoryUpdate} sendSfx={sendSfx}
                                               sendChatMessage={sendChatMessage}/></Zoom>
                            : <div style={{height: "100px"}}/>}

                        <div style={{display: "flex"}}>
                            <MyContainerSide>

                                {getOpponentAttackPhase() && <AttackResolveButton resolveAttack={resolveOpponentAttack}
                                                                                  opponentAttackPhase={opponentAttackPhase}/>}

                                <UnsuspendAllButton sendSfx={sendSfx} sendUnsuspendAll={sendUnsuspendAll}/>

                                <EggDeckContainer ref={dropToEggDeck}>
                                    {eggDeckMoodle &&
                                        <SendToDeckModalButtons sendCardToStack={sendCardToStack} to={"myEggDeck"}
                                                                setMoodle={setEggDeckMoodle} sendChatMessage={sendChatMessage}/>}
                                    {myEggDeck.length !== 0 &&
                                        <EggDeck alt="egg-deck" src={eggBackSrc}
                                                 onClick={() => {
                                                     if (!getOpponentReady()) return;
                                                     moveCard(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
                                                     sendMoveCard(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
                                                     playDrawCardSfx();
                                                     sendSfx("playPlaceCardSfx");
                                                     sendChatMessage(`[FIELD_UPDATE]≔【${myEggDeck[0].name}】﹕Egg-Deck ➟ Breeding`);
                                                     nextPhaseTrigger(nextPhase, Phase.BREEDING);
                                                 }}/>}
                                    {myEggDeck.length !== 0 &&
                                        <EggDeckSpan>{myEggDeck.length}</EggDeckSpan>}

                                    <TokenButton sendTokenMessage={sendTokenMessage}/>
                                </EggDeckContainer>

                                <SecurityStackContainer ref={dropToSecurity}>

                                    <SecurityStack sendSecurityReveal={sendSecurityReveal} />

                                    {securityMoodle &&
                                        <SendToDeckModalButtons sendCardToStack={sendCardToStack} to={"mySecurity"}
                                                                setMoodle={setSecurityMoodle} sendChatMessage={sendChatMessage}/>}



                                    <MySwitchRowButton1 disabled={showAttackArrow}
                                                        onClick={() => setIsMySecondRowVisible(false)}
                                                        secondRowVisible={!isMySecondRowVisible}/>
                                    <MySwitchRowButton2 disabled={showAttackArrow}
                                                        onClick={() => setIsMySecondRowVisible(true)}
                                                        secondRowVisible={isMySecondRowVisible}/>
                                    {mySecondRowWarning && <MySecondRowWarning>!</MySecondRowWarning>}
                                    {mySecondRowWarning && <MySecondRowWarning>!</MySecondRowWarning>}

                                </SecurityStackContainer>

                                <PlayerImage alt="me" src={profilePicture(myAvatar)}
                                             onClick={() => setSurrenderOpen(!surrenderOpen)}
                                             title="Surrender"/>

                                {('ontouchstart' in window && !!navigator.maxTouchPoints) &&
                                    <div style={{position: "absolute", display: "flex", gap: 3, top: 130}}>
                                        <MobileSSButton onClick={() => handleOpenSecurity("onOpen")}>
                                            <OpenSecurityIcon style={{transform: "translateY(1px)"}} color={"warning"}/>
                                        </MobileSSButton>
                                        <MobileSSButton onClick={() => moveSecurityCard("myTrash")}>
                                            <div style={{position: "relative", transform: "translate(-1px, 2px)"}}>
                                                <TrashIcon color={"error"}/><MiniArrowSpan
                                                style={{transform: "translate(-4px, -4px) scale(1.5)"}}>▲</MiniArrowSpan>
                                            </div>
                                        </MobileSSButton>
                                        <MobileSSButton onClick={() => moveSecurityCard("myTrash", true)}>
                                            <div style={{position: "relative", transform: "translate(-1px, 2px)"}}>
                                                <TrashIcon color={"error"}/><MiniArrowSpan
                                                style={{transform: "translate(-4px, -4px) scale(1.5)"}}>▼</MiniArrowSpan>
                                            </div>
                                        </MobileSSButton>
                                        <MobileSSButton onClick={() => moveSecurityCard("myHand")}>
                                            <div style={{position: "relative", marginLeft: 2}}>
                                                ✋🏻
                                                <MiniArrowSpanHand
                                                    style={{transform: "translate(-4px, -4px) scale(1.5)"}}>▲</MiniArrowSpanHand>
                                            </div>
                                        </MobileSSButton>
                                        <MobileSSButton onClick={() => moveSecurityCard("myHand", true)}>
                                            <div style={{position: "relative", marginLeft: 2}}>
                                                ✋🏻
                                                <MiniArrowSpanHand
                                                    style={{transform: "translate(-4px, -4px) scale(1.5)"}}>▼</MiniArrowSpanHand>
                                            </div>
                                        </MobileSSButton>

                                        <MobileSSButton onClick={handleShuffleSecurity}>
                                            <ShuffleIcon sx={{color: "#42a5f5", fontSize: 20}}/>
                                        </MobileSSButton>

                                    </div>
                                }

                                <BreedingAreaContainer ref={dropToBreedingArea}  {...(myBreedingArea.length === 0 && { id: "myBreedingArea" })}>
                                    {<CardStack cards={myBreedingArea} location={"myBreedingArea"} sendSfx={sendSfx}
                                                showFieldCardMenu={showFieldCardMenu}
                                                sendTiltCard={sendTiltCard}/>}
                                    {myBreedingArea.length === 0 && <FieldSpan>Breeding<br/>Area</FieldSpan>}
                                </BreedingAreaContainer>
                            </MyContainerSide>

                            <MyContainerMain>

                                <DeckContainer>

                                    {bootStage === BootStage.MULLIGAN_DONE && !getOpponentReady() &&
                                        <MulliganSpan style={{top: 3}}>Waiting for opponent...</MulliganSpan>}
                                    {bootStage === BootStage.MULLIGAN &&
                                        <>
                                            <MulliganSpan>KEEP HAND?</MulliganSpan>
                                            <MulliganButton onClick={() => handleMulligan(true)}>N</MulliganButton>
                                            <MulliganButton2 onClick={() => handleMulligan(false)}>Y</MulliganButton2>
                                        </>}

                                    <TrashSpan
                                        style={{transform: gameHasStarted ? "translate(-14px, -50px)" : "translate(-14px, 0)",}}>
                                        {myDeckField.length}</TrashSpan>
                                    {mySleeve === "Default"
                                        ?
                                        <Deck ref={dropToDeck} alt="deck" src={deckBackSrc} gameHasStarted={gameHasStarted}
                                              isOver={isOverDeckTop} onContextMenu={(e) => showDeckMenu({event: e})}
                                              onClick={() => {
                                                  nextPhaseTrigger(nextPhase, Phase.DRAW);
                                                  moveDeckCard("myHand")
                                              }}/>
                                        : <div style={{width: "105px", position: "relative"}}>
                                            <MyDeckSleeve alt="sleeve" src={getSleeve(mySleeve)}
                                                          gameHasStarted={gameHasStarted}/>
                                            <Deck ref={dropToDeck} alt="deck" src={deckBackSrc}
                                                  gameHasStarted={gameHasStarted}
                                                  isOver={isOverDeckTop} onContextMenu={(e) => showDeckMenu({event: e})}
                                                  onClick={() => {
                                                      if (getPhase() === Phase.DRAW && isMyTurn) nextPhase();
                                                      moveDeckCard("myHand")
                                                  }}/>
                                        </div>
                                    }
                                    {gameHasStarted && <DeckBottomZone ref={dropToDeckBottom} isOver={isOverBottom}>
                                        <DBZSpan isOver={isOverBottom} canDrop={canDropToDeckBottom}>⇑ ⇑
                                            ⇑</DBZSpan></DeckBottomZone>}

                                    <SendButton title="Send top card from your deck to Security Stack"
                                                style={{left: -131}}
                                                onClick={() => moveDeckCard("mySecurity")}>
                                        <RecoveryIcon sx={{fontSize: 36}}/>
                                    </SendButton>
                                    <SendButton title="Send top card from your deck to Trash" style={{left: -84}}
                                                onClick={() => moveDeckCard("myTrash")}>
                                        <TrashFromDeckIcon sx={{fontSize: 41}}/>
                                    </SendButton>
                                    <SendButton title="Reveal the top card of your deck"
                                                onClick={() => moveDeckCard("myReveal")}
                                                disabled={opponentReveal.length > 0} style={{left: -37}}
                                    ><RevealIcon sx={{fontSize: 41}}/>
                                    </SendButton>
                                </DeckContainer>

                                <TrashContainer>
                                    {myTrash.length === 0 ?
                                        <TrashPlaceholder ref={dropToTrash}
                                                          isOver={isOverTrash}>Trash</TrashPlaceholder>
                                        : <TrashCardImage ref={dropToTrash} src={myTrash[myTrash.length - 1].imgUrl}
                                                          alt={"myTrash"}
                                                          onClick={() => {
                                                              setTrashMoodle(!trashMoodle);
                                                              setOpponentTrashMoodle(false);
                                                          }}
                                                          onError={handleImageError}
                                                          title="Open your trash" isOver={isOverTrash}/>}
                                    <TrashSpan style={{transform: "translateX(12px)"}}>{myTrash.length}</TrashSpan>
                                    {effectInMyTrash && <TrashLottie animationData={effectAnimation} loop={true}/>}
                                    {targetInMyTrash && <TrashLottie animationData={targetAnimation} loop={true}/>}
                                </TrashContainer>

                                <BattleArea1 ref={isMySecondRowVisible ? dropToDigi6 : dropToDigi1}
                                             id={getFieldId(false, myDigi1, myDigi6, "myDigi1", "myDigi6")}>
                                    {isMySecondRowVisible
                                        ? <CardStack cards={myDigi6} location={"myDigi6"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>
                                        : <CardStack cards={myDigi1} location={"myDigi1"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>}
                                </BattleArea1>
                                <BattleArea2 ref={isMySecondRowVisible ? dropToDigi7 : dropToDigi2}
                                             id={getFieldId(false, myDigi2, myDigi7, "myDigi2", "myDigi7")}>
                                    {isMySecondRowVisible
                                        ? <CardStack cards={myDigi7} location={"myDigi7"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>
                                        : <CardStack cards={myDigi2} location={"myDigi2"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>}
                                </BattleArea2>
                                <BattleArea3 ref={isMySecondRowVisible ? dropToDigi8 : dropToDigi3}
                                             id={getFieldId(false, myDigi3, myDigi8, "myDigi3", "myDigi8")}>
                                    {!isMySecondRowVisible && myDigi3.length === 0 &&
                                        <FieldSpan>Battle Area</FieldSpan>}
                                    {isMySecondRowVisible
                                        ? <CardStack cards={myDigi8} location={"myDigi8"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>
                                        : <CardStack cards={myDigi3} location={"myDigi3"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>}
                                </BattleArea3>
                                <BattleArea4 ref={isMySecondRowVisible ? dropToDigi9 : dropToDigi4}
                                             id={getFieldId(false, myDigi4, myDigi9, "myDigi4", "myDigi9")}>
                                    {isMySecondRowVisible
                                        ? <CardStack cards={myDigi9} location={"myDigi9"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>
                                        : <CardStack cards={myDigi4} location={"myDigi4"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>}
                                </BattleArea4>
                                <BattleArea5 ref={isMySecondRowVisible ? dropToDigi10 : dropToDigi5}
                                             id={getFieldId(false, myDigi5, myDigi10, "myDigi5", "myDigi10")}>
                                    {isMySecondRowVisible
                                        ? <CardStack cards={myDigi10} location={"myDigi10"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>
                                        : <CardStack cards={myDigi5} location={"myDigi5"} sendSfx={sendSfx}
                                                     sendTiltCard={sendTiltCard}
                                                     handleDropToStackBottom={handleDropToStackBottom}
                                                     showFieldCardMenu={showFieldCardMenu}/>}
                                </BattleArea5>

                                <LowerBattleArea>
                                    <BattleArea11 ref={dropToDigi11} id={"myDigi11"}>
                                        <CardStack cards={myDigi11} location={"myDigi11"} sendSfx={sendSfx}
                                                   sendTiltCard={sendTiltCard}
                                                   handleDropToStackBottom={handleDropToStackBottom}
                                                   showFieldCardMenu={showFieldCardMenu}/>
                                    </BattleArea11>
                                    <BattleArea12 ref={dropToDigi12} id={"myDigi12"}>
                                        <CardStack cards={myDigi12} location={"myDigi12"} sendSfx={sendSfx}
                                                   sendTiltCard={sendTiltCard}
                                                   handleDropToStackBottom={handleDropToStackBottom}
                                                   showFieldCardMenu={showFieldCardMenu}/>
                                    </BattleArea12>
                                    <BattleArea13 ref={dropToDigi13} id={"myDigi13"}>
                                        <CardStack cards={myDigi13} location={"myDigi13"} sendSfx={sendSfx}
                                                   sendTiltCard={sendTiltCard}
                                                   handleDropToStackBottom={handleDropToStackBottom}
                                                   showFieldCardMenu={showFieldCardMenu}/>
                                    </BattleArea13>
                                    <BattleArea14 ref={dropToDigi14} id={"myDigi14"}>
                                        <CardStack cards={myDigi14} location={"myDigi14"} sendSfx={sendSfx}
                                                   sendTiltCard={sendTiltCard}
                                                   handleDropToStackBottom={handleDropToStackBottom}
                                                   showFieldCardMenu={showFieldCardMenu}/>
                                    </BattleArea14>
                                    <BattleArea15 ref={dropToDigi15} id={"myDigi15"}>
                                        <CardStack cards={myDigi15} location={"myDigi15"} sendSfx={sendSfx}
                                                   sendTiltCard={sendTiltCard}
                                                   handleDropToStackBottom={handleDropToStackBottom}
                                                   showFieldCardMenu={showFieldCardMenu}/>
                                    </BattleArea15>
                                </LowerBattleArea>

                                <HandContainer ref={dropToHand}>
                                    <HandCards cardCount={myHand.length}
                                               style={{transform: `translateX(-${myHand.length > 12 ? (myHand.length * 0.5) : 0}px)`}}>
                                        {myHand.map((card, index) =>
                                            <HandListItem cardCount={myHand.length} cardIndex={index} key={card.id}
                                                          onContextMenu={(e) => showHandCardMenu({
                                                              event: e,
                                                              props: {index}
                                                          })}>
                                                {isHandHidden
                                                    ? <FaceDownCard alt="card" src={getSleeve(mySleeve)}/>
                                                    : <Card card={card} location={"myHand"}/>}
                                            </HandListItem>)}
                                    </HandCards>
                                    {myHand.length > 5 && <MyHandSpan>{myHand.length}</MyHandSpan>}
                                    <HideHandIconButton onClick={() => setIsHandHidden(!isHandHidden)} isActive={isHandHidden}
                                                        title={"Hide hand"}>
                                        {isHandHidden
                                            ? <VisibilityOffIcon fontSize={"small"}/>
                                            : <VisibilityIcon fontSize={"small"}/>}
                                    </HideHandIconButton>
                                </HandContainer>

                            </MyContainerMain>
                        </div>
                    </FieldContainer>

                    <GameChat user={user} sendChatMessage={sendChatMessage}/>

                </Wrapper>
            </OuterWrapper>
        </OuterWrapperRefactorLater>
    </>
}

const OpponentContainerMain = styled.div`
  position: relative;
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(28, 1fr);
  grid-template-rows: 1fr 1.2fr;
  grid-template-areas: "hand hand hand hand hand hand hand hand hand hand hand hand hand ba ba ba ba ba ba ba ba ba ba ba ba ba ba ba"
                        "deck deck deck deck trash trash trash trash digi5 digi5 digi5 digi5 digi4 digi4 digi4 digi4 digi3 digi3 digi3 digi3 digi2 digi2 digi2 digi2 digi1 digi1 digi1 digi1";
`;

const MyContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(28, 1fr);
  grid-template-rows: 1.2fr 1fr;
  grid-template-areas: "digi1 digi1 digi1 digi1 digi2 digi2 digi2 digi2 digi3 digi3 digi3 digi3 digi4 digi4 digi4 digi4 digi5 digi5 digi5 digi5 trash trash trash trash deck deck deck deck"
                        "ba ba ba ba ba ba ba ba ba ba ba ba ba ba ba hand hand hand hand hand hand hand hand hand hand hand hand hand";
`;

const LowerBattleArea = styled.div`
  grid-area: ba;
  position: relative;
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: "digi11 digi12 digi13 digi14 digi15";
`;

const OpponentLowerBattleArea = styled(LowerBattleArea)`
  grid-template-areas: "digi15 digi14 digi13 digi12 digi11";
`;

const BattleAreaContainer = styled.div`
  position: relative;
  height: 100%;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  outline: rgba(119, 145, 197, 0.6) solid 1px;
`;

const BattleArea1 = styled(BattleAreaContainer)`
  grid-area: digi1;`;

const BattleArea2 = styled(BattleAreaContainer)`
  grid-area: digi2;`;

const BattleArea3 = styled(BattleAreaContainer)`
  grid-area: digi3;`;

const BattleArea4 = styled(BattleAreaContainer)`
  grid-area: digi4;`;

const BattleArea5 = styled(BattleAreaContainer)`
  grid-area: digi5;`;

const BattleArea11 = styled(BattleAreaContainer)`
  grid-area: digi11;`;

const BattleArea12 = styled(BattleAreaContainer)`
  grid-area: digi12;`;

const BattleArea13 = styled(BattleAreaContainer)`
  grid-area: digi13;`;

const BattleArea14 = styled(BattleAreaContainer)`
  grid-area: digi14;`;

const BattleArea15 = styled(BattleAreaContainer)`
  grid-area: digi15;`;

const SwitchRowButton = styled.button<{ secondRowVisible: boolean }>`
  width: 14px;
  height: 14px;
  padding: 0;
  margin: 5px;
  background: ${({secondRowVisible}) => secondRowVisible ? "#fff" : "#151515"};
  filter: ${({secondRowVisible}) => secondRowVisible ? "drop-shadow(0px 0px 2px ghostwhite)" : "none"};
  position: absolute;
`;

const SecondRowWarning = styled.span`
  font-size: 50px;
  font-family: Naston, sans-serif;
  color: crimson;
  filter: drop-shadow(0px 0px 2px crimson);
  position: absolute;
  cursor: default;
`;

const MySecondRowWarning = styled(SecondRowWarning)`
  right: 11px;
  top: 55px;
`;

const OpponentSecondRowWarning = styled(SecondRowWarning)`
  left: 11px;
  bottom: 55px;
`;

const MySwitchRowButton1 = styled(SwitchRowButton)`
  right: 5px;
  top: 3px;
`;

const MySwitchRowButton2 = styled(SwitchRowButton)`
  right: 5px;
  top: 33px;
`;

const OpponentSwitchRowButton1 = styled(SwitchRowButton)`
  left: 5px;
  bottom: 3px;
`;

const OpponentSwitchRowButton2 = styled(SwitchRowButton)`
  left: 5px;
  bottom: 33px;
`;

const MyContainerSide = styled.div`
  position: relative;
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1.5fr;
  grid-template-areas: "security-stack security-stack"
                        "egg-deck breed";
`;

const OpponentContainerSide = styled(MyContainerSide)`
  grid-template-rows: 1.5fr 1fr;
  grid-template-areas: "breed egg-deck"
                        "security-stack security-stack";
`;

const InfoContainer = styled.div`
  height: 980px;
  width: 500px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 75px 380px 1fr;
  grid-template-areas: "info info info"
                        "img img img"  
                          "details details details";
  align-items: center;
  padding: 10px;

  background: linear-gradient(to right, rgba(12, 12, 12, 0.25) 98.25%, transparent 100%);
  border-bottom-left-radius: 15px;
  border-top-left-radius: 15px;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  position: relative;
  height: 1000px;
  width: 2170px;
  max-height: 1000px;
  max-width: 2170px;
  display: flex;
  background: rgba(47, 45, 45, 0.45);
  border-radius: 15px;
  transition: transform 0.3s ease-in-out;


@container(width > 2225px) {
  transform: scale(1.075);
} @container(width > 2450px) {
  transform: scale(1.125);
} @container(width <= 2170px) {
  transform: scale(0.95);
} @container(width <= 2040px) {
  transform: scale(0.875);
} @container(width <= 1950px) {
  transform: scale(0.86);
} @container(width <= 1900px) {
  transform: scale(0.83);
} @container(width <= 1800px) {
  transform: scale(0.78);
} @container(width <= 1700px) {
  transform: scale(0.7325);
} @container(width <= 1600px) {
  transform: scale(0.685);
} @container(width <= 1500px) {
  transform: scale(0.64);
} @container(width <= 1400px) {
  transform: scale(0.595);
} @container(width <= 1300px) {
  transform: scale(0.5475);
} @container(width <= 1200px) {
  transform: scale(0.5);
}
`;

const MiniArrowSpan = styled.span`
  position: absolute;
  left: 14px;
  top: 0;
  font-size: 10px;
  color: #646cff;
  filter: drop-shadow(0 0 2px #000000);
`;

const MiniArrowSpanHand = styled(MiniArrowSpan)`
  left: 11px;
`;

const PlayerImage = styled.img<{ opponent?: boolean }>`
  position: absolute;
  cursor: pointer;
  width: 112px;
  transition: all 0.1s ease;
  transform: ${({opponent}) => opponent ? "none" : "rotateY(180deg)"};

  top: 0;
  left: 20px;

  &:hover {
    filter: drop-shadow(0 0 2px ${({opponent}) => opponent ? "#43d789" : "#bb2848"});
  }
`;

const UserName = styled.span`
  position: absolute;
  font-size: 20px;
  font-family: 'Cousine', sans-serif;
  top: -27px;
  left: 60%;
  transform: translateX(-50%);
  opacity: 50%;
`;

const MyHandSpan = styled.span`
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  font-size: 20px;
  opacity: 0.4;

  position: absolute;
  bottom: 7px;
  left: 223px;
`;

const HideHandIconButton = styled.button<{ isActive: boolean}>`
  position: absolute;
  opacity: ${({isActive}) => isActive ? 1 : 0.3};
  color: ${({isActive}) => isActive ? "rgba(190,39,85,1)" : "unset"};
  right: 22px;
  top: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 5px;
  background: none;
  border: none;
  outline: none;
  transition: all 0.25s ease;

  &:hover {
    color: #d764c1;
    opacity: 0.75;
  }
`;

const DeckContainer = styled.div`
  position: relative;
  grid-area: deck;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0 0 10px 10px;
`;

const OpponentDeckContainer = styled.div`
  grid-area: deck;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 10px 10px 0 0;
`;

const OpponentDeckSleeve = styled.img`
  width: 100px;
  height: 140px;
  position: absolute;
  border-radius: 5px;
  transform: translateY(-1px);
`;

const MyDeckSleeve = styled.img<{ gameHasStarted?: boolean }>`
  width: 99px;
  height: 140px;
  position: absolute;
  border-radius: 5px;
  z-index: 3;
  top: ${({gameHasStarted}) => gameHasStarted ? "-47px" : "0"};
  pointer-events: none;
  transition: all 0.1s ease;
`;
const Deck = styled.img<{ gameHasStarted?: boolean, isOver?: boolean }>`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;
  transform: ${({gameHasStarted}) => gameHasStarted ? "translateY(-47px)" : "translateY(0)"};
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0 0 1px #eceaea) saturate(1.1) brightness(0.95)" : "none"};

  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const DeckBottomZone = styled.div<{ isOver: boolean }>`
  z-index: 1;
  width: 95px;
  margin-left: 5px;
  padding-top: 10px;
  height: 40px;
  border-radius: 5px;
  border: ${({isOver}) => isOver ? "#DAD8D5E0 solid 2px" : "#0c0c0c dashed 2px"};
  background: rgba(0, 0, 0, 0.35);
  position: absolute;
  bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DBZSpan = styled.span<{ isOver: boolean, canDrop: boolean }>`
  visibility: ${({canDrop}) => canDrop ? "visible" : "hidden"};
  color: ${({isOver}) => isOver ? "rgba(218,216,213,0.88)" : "rgba(161, 157, 154, 0.3)"};
  cursor: default;
  padding-bottom: 5px;
  transition: all 0.1s ease;
  transform: translateY(1px) scale(${({isOver}) => isOver ? "1.05" : "1"});
`;

const EggDeck = styled(Deck)`
  width: 95px;
  transform: translateY(-25px);

  &:hover {
    filter: drop-shadow(0 0 3px #dd33e8);
    outline: #dd33e8 solid 1px;
  }
`;

const EggDeckSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: center;
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transform: translateY(-25px);
`;

const TrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 10px 10px 0 0;
`;

const OpponentTrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0 0 10px 10px;
  transform: translateY(4px);
`;

const EggDeckContainer = styled.div`
  position: relative;
  grid-area: egg-deck;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 0 10px 10px;
`;

const SecurityStackContainer = styled.div`
  position: relative;
  grid-area: security-stack;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TrashView = styled.div`
  background: rgba(2, 1, 1, 0.95);
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  gap: 15px;
  padding: 10px;
  width: 706px;
  height: 420px;
  overflow-y: scroll;
  z-index: 150;
  border-radius: 10px;
  border: 2px solid crimson;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.5);

  left: 53.3%;
  top: 27%;
  transform: translate(-50%, -50%);

  scrollbar-width: none;

  ::-webkit-scrollbar {
    visibility: hidden;
    width: 0;
  }
`;

const SecurityView = styled(TrashView)`
  padding: 10px;
  width: 706px;
  height: 310px;
  border: 2px solid #1482dc;
  box-shadow: 2px 4px 12px rgba(33, 222, 250, 0.5);
  transform: translate(-50%, -40%);
`;

const TrashSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: center;
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transition: all 0.1s ease;
`;

const SendButton = styled.button`
  position: absolute;
  width: 43px;
  height: 45px;
  z-index: 10;
  padding: 0;
  border-radius: 5px;
  opacity: 0.65;
  bottom: 5px;
  background: none;
  border: none;
  outline: none;

  &:hover {
    opacity: 1;
    color: #fff289;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
    color: #4bf8c9;
  }
`;

const MulliganButton = styled.div`
  position: absolute;
  left: 71px;
  top: 13px;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background: #fad219;
  color: #111921;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Sansation, sans-serif;
  text-shadow: 0 0 1px #111921;
  font-size: 1.4em;
  filter: drop-shadow(3px 3px 1px #131313);
  transition: all 0.05s ease;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(2px 2px 1px #131313);
    background-color: #f8681a;
    transform: translateY(1px);
  }
`;

const MulliganButton2 = styled(MulliganButton)`
  left: 11px;

  &:hover {
    background-color: #51b60a;
  }
`;

const MulliganSpan = styled.span`
  position: absolute;
  left: 8px;
  top: -15px;
  width: 110px;
  font-family: Cuisine, sans-serif;
  font-size: 17px;
  color: #fad219;
  filter: drop-shadow(2px 2px 1px #131313);
  cursor: default;
`;

const BreedingAreaContainer = styled(BattleAreaContainer)`
  margin: 1px;
  grid-area: breed;
`;

const HandContainer = styled.div`
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  width: 100%;
  height: 100%;
  padding: 5px;
  transform: translate(10px, -2px);
`;

const OpponentHandContainer = styled(HandContainer)`
  transform: rotate(180deg) translate(30px, -5px);
  z-index: 1;
`;

const HandCards = styled.ul<{ cardCount: number }>`
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  list-style-type: none;
  position: relative;
  clear: both;
`;

const HandListItem = styled.li<{ cardCount: number, cardIndex: number }>`
  position: absolute;
  margin: 0;
  padding: 0;
  list-style-type: none;
  float: left;
  left: 5px;
  transition: all 0.2s ease;
  transform: translateX(${({
                             cardCount,
                             cardIndex
                           }) => calculateCardOffsetX(cardCount, cardIndex)}) translateY(${({
                                                                                              cardCount,
                                                                                              cardIndex
                                                                                            }) => calculateCardOffsetY(cardCount, cardIndex)}) rotate(${({
                                                                                                                                                           cardCount,
                                                                                                                                                           cardIndex
                                                                                                                                                         }) => calculateCardRotation(cardCount, cardIndex)});

  &:hover {
    z-index: 100;
  }
`;

const FaceDownCard = styled.img`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;

export const CardImage = styled.img`
  grid-area: img;
  height: 365px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  outline: #0c0c0c solid 1px;
  transform: translateY(2px);
  justify-self: center;
  z-index: 0;
`;

const InfoSpan = styled.span`
  grid-area: info;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  font-family: "League Spartan", sans-serif;
  font-size: 24px;
  padding-bottom: 40px;
  padding-right: 20px;
  a {
    color: ghostwhite;

    &:hover {
      color: #14d591;
      opacity: 1;
    }
  }
  z-index: 10;
`;

const FieldSpan = styled.span`
  color: rgba(119, 145, 197, 0.8);
  font-family: Naston, sans-serif;
`;

const TrashPlaceholder = styled.div<{ isOver?: boolean }>`
  width: 105px;
  height: 146px;
  border-radius: 5px;
  border: ${({isOver}) => isOver ? '#8d8d8d' : '#0c0c0c'} solid 2px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(220, 220, 220, 0.8);
  font-family: Naston, sans-serif;
  transition: all 0.1s ease-in-out;
`;

const TrashCardImage = styled.img<{ isOver?: boolean }>`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
  filter: drop-shadow(${({isOver}) => isOver ? '0px 0px 1px whitesmoke' : '1px 1px 2px #060e18'});

  &:hover {
    filter: drop-shadow(0px 0px 3px #af0c3d) brightness(1.1) saturate(1.2);
  }
`;

const RevealContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 435px;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transform: scale(2) translateX(-17.5%);
`;

const StartingName = styled.span`
  font-family: Sansation, sans-serif;
  font-size: 114px;
  color: ghostwhite;
  text-outline: #114ce1 3px;
  text-shadow: 0 0 8px #2764ff;
  text-transform: uppercase;
  z-index: 10000 !important;
  filter: saturate(2) brightness(2);

  @media (max-height: 1199px) {
    font-size: 116px;
  }
  @media (max-height: 1080px) {
    font-size: 100px;
  }
  @media (max-height: 900px) {
    font-size: 80px;
  }
  @media (min-height: 1200px) {
    font-size: 124px;
  }
`;

const BackGround = styled.div<{ color1: string, color2: string, color3: string }>`
  position: fixed;
  z-index: -10;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  background: linear-gradient(253deg, ${({color1}) => color1}, ${({color2}) => color2}, ${({color3}) => color3});
  background-size: 200% 200%;
  -webkit-animation: Background 25s ease infinite;
  -moz-animation: Background 25s ease infinite;
  animation: Background 25s ease infinite;

  @media only screen and (min-device-width: 300px) and (max-device-width: 550px) and (orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) {
    width: 360vw;
    height: 300vh;
  }

  @-webkit-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @-moz-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }
`;

const BackGroundPattern = styled.div`
  position: fixed;
  top: -50vh;
  left: -50vw;
  width: 200vw;
  height: 200vh;
  background: transparent url(${noiseBG}) repeat 0 0;
  animation: bg-animation .2s infinite;
  opacity: .4;
  z-index: 0;
  overflow: hidden;

  @keyframes bg-animation {
    0% {
      transform: translate(0, 0)
    }
    10% {
      transform: translate(-1%, -1%)
    }
    20% {
      transform: translate(-2%, 1%)
    }
    30% {
      transform: translate(1%, -2%)
    }
    40% {
      transform: translate(-1%, 3%)
    }
    50% {
      transform: translate(-2%, 1%)
    }
    60% {
      transform: translate(3%, 0)
    }
    70% {
      transform: translate(0, 2%)
    }
    80% {
      transform: translate(-3%, 0)
    }
    90% {
      transform: translate(2%, 1%)
    }
    100% {
      transform: translate(1%, 0)
    }
  }
`;

const CloseSecurityButton = styled(MuiButton)`
  position: fixed;
  height: 28px;
  right: 657px;
  bottom: 540px;
  z-index: 1000;
  font-family: Naston, sans-serif;`

const OuterWrapper = styled.div`
  max-height: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

@container(width <= 1000px) {
  position: absolute;
  left: 100px;
} @container(width <= 850px) {
  position: absolute;
  left: 200px;
} @container(width <= 675px) {
  position: absolute;
  left: 250px;
} @container(width <= 500px) {
  position: absolute;
  left: 300px;
} @container(width <= 400px) {
  position: absolute;
  left: 350px;
  transform: translateX(-10px);
}

  @media (max-height: 700px) {
    position: absolute;
    top: 50px;
  }

  @media (max-height: 450px) {
    position: absolute;
    top: 90px;
  }
`;

const MobileSSButton = styled.button`
  width: 42px;
  height: 42px;
  padding: 0;
`;

export const StyledMenu = styled(Menu)`
  border: 2px solid rgba(65, 135, 211, 0.72);
  
  .contexify_submenu {
    background-color: transparent;
    transform: translateX(-6px);
    box-shadow: none;
  }
  .contexify_submenu-arrow {
    background: none;
  }
  .contexify_separator {
    border-bottom: 2px solid rgba(65, 135, 211, 0.72);
  }
  .contexify_item:hover {
    font-weight: 600;
  }
`;

const StyledTrashIcon = styled(TrashIcon)`
    border-radius: 6px;  
    filter: drop-shadow( 0px 0px 1px var(--contexify-menu-bgColor));
`;

const StyledOpenSecurityIcon = styled(OpenSecurityIcon)`
    border-radius: 6px;
`;

const StyledHandIcon = styled(HandIcon)`
    border-radius: 8px;
    filter: drop-shadow(0px 0px 1px var(--contexify-menu-bgColor));
    transform: rotateY(180deg);
    color: #ffccbc;
`;

const StyledShuffleIcon = styled(ShuffleIcon)`
    border-radius: 6px;
`;

const LoadingOverlayDiv = styled.div`
    position: absolute;
    height: 100vh;
    width: 100vw;
    left: 0;
    top: 0;
    z-index: 99999;
    cursor: wait;
`;

const OuterWrapperRefactorLater = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    container-type: inline-size;
    scrollbar-width: thin;
    overflow: scroll;
`;

const TrashLottie = styled(Lottie)<{ isOpponentTrash?: boolean }>`
  position: absolute;
  top: ${({ isOpponentTrash }) => (isOpponentTrash ? '35px' : '20px')};
  left: ${({ isOpponentTrash }) => (isOpponentTrash ? '12px' : '30px')};
  max-width: 100px;
`;
