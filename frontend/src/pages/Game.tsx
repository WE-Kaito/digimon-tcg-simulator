import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {CardTypeGame, DraggedItem, DraggedStack, GameDistribution, Player} from "../utils/types.ts";
import {
    profilePicture,
    calculateCardRotation,
    calculateCardOffsetY,
    calculateCardOffsetX,
    getOpponentSfx, getConsecutiveDigimonIndex, getTamerCardIndex, convertForLog
} from "../utils/functions.ts";
import {useGame} from "../hooks/useGame.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";
import SurrenderMoodle from "../components/game/SurrenderMoodle.tsx";
import deckBack from "../assets/deckBack.png";
import eggBack from "../assets/eggBack.jpg";
import Card from "../components/Card.tsx";
import cardBack from "../assets/cardBack.jpg";
import noiseBG from "../assets/noiseBG.png";
import hackmonButton from "../assets/hackmon-chip.png";
import CardDetails from "../components/CardDetails.tsx";
import {useDrop} from "react-dnd";
import DeckMoodle from "../components/game/DeckMoodle.tsx";
import mySecurityAnimation from "../assets/lotties/mySecurity.json";
import opponentSecurityAnimation from "../assets/lotties/opponentSecurity.json";
import Lottie from "lottie-react";
import {Fade, Flip, Zoom} from "react-awesome-reveal";
import MemoryBar from "../components/game/MemoryBar.tsx";
import {notifyRequestedRestart, notifySecurityView} from "../utils/toasts.ts";
import RestartMoodle from "../components/game/RestartMoodle.tsx";
import AttackArrows from "../components/game/AttackArrows.tsx";
import {
    playAttackSfx,
    playDrawCardSfx,
    playCardToHandSfx,
    playRevealCardSfx,
    playPlaceCardSfx,
    playTrashCardSfx,
    playStartSfx,
    playSecurityRevealSfx,
    playShuffleDeckSfx,
    playLoadMemorybarSfx
} from "../utils/sound.ts";
import GameChat from "../components/game/GameChat.tsx";
import CardStack from "../components/game/CardStack.tsx";

export default function Game({user}: { user: string }) {

    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://www.digi-tcg.online/api/ws/game";
    const navigate = useNavigate();

    const selectedCard = useStore((state) => state.selectedCard);
    const selectCard = useStore((state) => state.selectCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const clearBoard = useGame((state) => state.clearBoard);
    const distributeCards = useGame((state) => state.distributeCards);
    const getUpdatedGame = useGame((state) => state.getUpdatedGame);
    const shuffleSecurity = useGame((state) => state.shuffleSecurity);

    const moveCard = useGame((state) => state.moveCard);
    const sendCardToDeck = useGame((state) => state.sendCardToDeck);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];

    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [timerOpen, setTimerOpen] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(5);
    const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
    const [deckMoodle, setDeckMoodle] = useState<boolean>(false);
    const [eggDeckMoodle, setEggDeckMoodle] = useState<boolean>(false);
    const [securityMoodle, setSecurityMoodle] = useState<boolean>(false);
    const [cardToSend, setCardToSend] = useState<{ id: string, location: string }>({id: "", location: ""});
    const [trashMoodle, setTrashMoodle] = useState<boolean>(false);
    const [opponentTrashMoodle, setOpponentTrashMoodle] = useState<boolean>(false);
    const [securityContentMoodle, setSecurityContentMoodle] = useState<boolean>(false);
    const [restartMoodle, setRestartMoodle] = useState<boolean>(false);
    const [startingPlayer, setStartingPlayer] = useState<string>("");
    const [showStartingPlayer, setShowStartingPlayer] = useState<boolean>(false);
    const [memoryBarLoading, setMemoryBarLoading] = useState<boolean>(true);
    const [showAttackArrow, setShowAttackArrow] = useState<boolean>(false);
    const [arrowFrom, setArrowFrom] = useState<string>("");
    const [arrowTo, setArrowTo] = useState<string>("");
    const [attackFromOpponent, setAttackFromOpponent] = useState<boolean>(false);
    const [gameHasStarted, setGameHasStarted] = useState<boolean>(false);
    const [isMySecondRowVisible, setIsMySecondRowVisible] = useState<boolean>(false);
    const [isOpponentSecondRowVisible, setIsOpponentSecondRowVisible] = useState<boolean>(false);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [restartObj, setRestartObj] = useState<{ me: Player, opponent: Player }>({
        me: {username: "", avatarName: ""},
        opponent: {username: "", avatarName: ""}
    });
    const [userCount, setUserCount] = useState<number>(0);

    const setMessages = useGame((state) => state.setMessages);
    const mulligan = useGame((state) => state.mulligan);
    const mulliganAllowed = useGame((state) => state.mulliganAllowed);
    const setMulliganAllowed = useGame((state) => state.setMulliganAllowed);
    const createToken = useGame((state) => state.createToken);
    const setMemory = useGame(state => state.setMemory);
    const opponentReady = useGame(state => state.opponentReady);
    const setOpponentReady = useGame(state => state.setOpponentReady);

    const myHand = useGame((state) => state.myHand);
    const myDeckField = useGame((state) => state.myDeckField);
    const myEggDeck = useGame((state) => state.myEggDeck);
    const myTrash = useGame((state) => state.myTrash);
    const mySecurity = useGame((state) => state.mySecurity);
    const myTamer = useGame((state) => state.myTamer);
    const myDelay = useGame((state) => state.myDelay);
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
    const myBreedingArea = useGame((state) => state.myBreedingArea);

    const opponentHand = useGame((state) => state.opponentHand);
    const opponentDeckField = useGame((state) => state.opponentDeckField);
    const opponentEggDeck = useGame((state) => state.opponentEggDeck);
    const opponentTrash = useGame((state) => state.opponentTrash);
    const opponentSecurity = useGame((state) => state.opponentSecurity);
    const opponentTamer = useGame((state) => state.opponentTamer);
    const opponentDelay = useGame((state) => state.opponentDelay);
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
    const opponentBreedingArea = useGame((state) => state.opponentBreedingArea);

    const mySecondRowWarning = (!isMySecondRowVisible && (myDigi6.length + myDigi7.length + myDigi8.length + myDigi9.length + myDigi10.length) > 0) || (isMySecondRowVisible && (myDigi1.length + myDigi2.length + myDigi3.length + myDigi4.length + myDigi5.length) > 0);
    const opponentSecondRowWarning = (!isOpponentSecondRowVisible && (opponentDigi6.length + opponentDigi7.length + opponentDigi8.length + opponentDigi9.length + opponentDigi10.length) > 0) || (isOpponentSecondRowVisible && (opponentDigi1.length + opponentDigi2.length + opponentDigi3.length + opponentDigi4.length + opponentDigi5.length) > 0);

    let interval: any;
    const websocket = useWebSocket(websocketURL, {

        onOpen: () => {
            websocket.sendMessage("/startGame:" + gameId);
        },

        onMessage: (event) => {

            if (event.data.startsWith("[START_GAME]:")) {
                setStartingPlayer("");
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const me = players.slice().filter((player: Player) => player.username === user)[0];
                const opponent = players.slice().filter((player: Player) => player.username !== user)[0];
                setUpGame(me, opponent);
                setGameHasStarted(false);
                setRestartObj({me, opponent});
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const newGame: GameDistribution = JSON.parse(event.data.substring("[DISTRIBUTE_CARDS]:".length));
                distributeCards(user, newGame, gameId);
                return;
            }

            if (event.data.startsWith("[STARTING_PLAYER]:")) {
                const firstPlayer = event.data.substring("[STARTING_PLAYER]:".length);
                setMemoryBarLoading(true);
                setStartingPlayer(firstPlayer);
                setShowStartingPlayer(true);
                playStartSfx();
                const timeout1 = setTimeout(() => {
                    playDrawCardSfx();
                    setIsChatOpen(true);
                    setMessages("[STARTING_PLAYER]≔" + firstPlayer);
                    setMulliganAllowed(true);
                    setOpponentReady(false);
                }, 4300);
                const timeout2 = setTimeout(() => {
                    setShowStartingPlayer(false);
                    setMemoryBarLoading(false);
                    playLoadMemorybarSfx();
                    interval = setInterval(() => {
                        websocket.sendMessage("/heartbeat/")
                    }, 5000);
                }, 5500);
                return () => {
                    clearTimeout(timeout1);
                    clearTimeout(timeout2)
                };
            }

            if (event.data.startsWith("[MOVE_CARD]:")) {
                const parts = event.data.substring("[MOVE_CARD]:".length).split(":");
                const cardId = parts[0];
                const from = parts[1];
                const to = parts[2];
                moveCard(cardId, from, to);
                if (!opponentReady) setOpponentReady(true);
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
                setArrowFrom(parts[0]);
                setArrowTo(parts[1]);
                setAttackFromOpponent(true);
                setShowAttackArrow(true);
                endAttackAnimation();
                return;
            }

            if (event.data.startsWith("[USER_COUNT]:")) {
                const userCount = event.data.substring("[USER_COUNT]:".length);
                setUserCount(parseInt(userCount));
                return;
            }

            switch (event.data) {
                case "[SURRENDER]": {
                    startTimer();
                    break;
                }
                case "[SECURITY_VIEWED]": {
                    notifySecurityView();
                    break;
                }
                case "[PLAYER_LEFT]": {
                    setOpponentLeft(true);
                    startTimer();
                    break;
                }
                case ("[RESTART]"): {
                    setRestartMoodle(true);
                    break;
                }
                case ("[SEND_UPDATE]"): {
                    sendUpdate();
                    break;
                }
                case ("[ACCEPT_RESTART]"): {
                    clearBoard();
                    setUpGame(restartObj.me, restartObj.opponent);
                    setGameHasStarted(false);
                    break;
                }
                case ("[HEARTBEAT]"): {
                    break;
                }
                case ("[PLAYER_READY]"): {
                    setOpponentReady(true);
                    if (!mulliganAllowed) setGameHasStarted(true);
                    break;
                }
                default: {
                    getOpponentSfx(event.data);
                }
            }
        }
    });

    function sendChatMessage(message: string) {
        if (message.length > 0) {
            setMessages(user + "﹕" + message);
            websocket.sendMessage(`${gameId}:/chatMessage:${opponentName}:${message}`);
        }
    }

    function endAttackAnimation() {
        playAttackSfx();
        const timeout = setTimeout(() => {
            setShowAttackArrow(false);
            setArrowFrom('');
            setArrowTo('');
            setAttackFromOpponent(false);
        }, 3500);
        return () => clearTimeout(timeout);
    }

    function chunkString(str: string, size: number): string[] {
        const chunks = [];
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.substring(i, i + size));
        }
        return chunks;
    }

    function sendUpdate() {
        const updatedGame: string = getUpdatedGame(gameId, user);
        const chunks = chunkString(updatedGame, 1000);
        const timeoutIds: number[] = [];
        for (const chunk of chunks) {
            const timeoutId = setTimeout(() => {
                websocket.sendMessage(`${gameId}:/updateGame:${chunk}`);
            }, 10);
            timeoutIds.push(timeoutId);
        }
        if (!gameHasStarted && opponentReady && !mulliganAllowed) setGameHasStarted(true);
        return () => {
            timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
        };
    }

    function sendSingleUpdate(cardId: string, from: string, to: string) {
        websocket.sendMessage(`${gameId}:/moveCard:${opponentName}:${cardId}:${from}:${to}`);
        if (!gameHasStarted && opponentReady) setGameHasStarted(true);
    }

    function sendMemoryUpdate(memory: number) {
        websocket.sendMessage(`${gameId}:/updateMemory:${opponentName}:${memory}`);
    }

    function sendSfx(sfx: string) {
        const timeout = setTimeout(() => {
            websocket.sendMessage(gameId + ":/" + sfx + ":" + opponentName);
        }, 10);
        return () => clearTimeout(timeout);
    }

    function handleDropToOpponent(from: string, to: string) {
        if (!from || !to) return;
        setArrowFrom(from);
        setArrowTo(to);
        setShowAttackArrow(true);
        websocket.sendMessage(gameId + ":/attack:" + opponentName + ":" + from + ":" + to);
        endAttackAnimation();
    }

    function handleDropToField(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendSingleUpdate(cardId, from, to);
        to === "myTrash" ? playTrashCardSfx() : playPlaceCardSfx();
        sendSfx(to === "myTrash" ? "playTrashCardSfx" : "playPlaceCardSfx");
        if (from !== to) sendChatMessage(`[FIELD_UPDATE]≔【${cardName}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
    }

    function handleDropToStackBottom(cardId: string, from: string, to: string, cardName: string) {
        if (!cardId || !from || !to) return;
        sendCardToDeck("Top", {id: cardId, location: from}, to);
        playPlaceCardSfx();
        sendSfx("playPlaceCardSfx");
        sendChatMessage(`[FIELD_UPDATE]≔【${cardName}】﹕${convertForLog(from)} ➟ ${convertForLog(to)}`);
        if (from === to){
            const timer = setTimeout(() => {
                sendUpdate();
            }, 30);
            return () => clearTimeout(timer);
        } else sendUpdate();
    }

    function getFieldId(isOpponent: boolean, location1arr: CardTypeGame[], location2arr: CardTypeGame[], location1: string, location2: string): string {
        if (location1arr.length === 0 && (isOpponent ? !isOpponentSecondRowVisible : !isMySecondRowVisible)) return location1;
        if (location2arr.length === 0 && (isOpponent ? isOpponentSecondRowVisible : isMySecondRowVisible)) return location2;
        return "";
    }

    function isCardStack(item: DraggedItem | DraggedStack): item is DraggedStack {
        const {index} = item as DraggedStack;
        return index > 0;
    }

    const moveCardStack = useGame((state) => state.moveCardStack);

    const [, dropToDigi1] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi1", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi1', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi2] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi2", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi2', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi3] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi3", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi3', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi4] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi4", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi4', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi5] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi5", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi5', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi6] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi6", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi6', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi7] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi7", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi7', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi8] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi8", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi8', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi9] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi9", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi9', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi10] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myDigi10", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myDigi10', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToHand] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, name} = item;
            moveCard(id, location, 'myHand');
            sendSingleUpdate(id, location, 'myHand');
            playCardToHandSfx();
            if (location !== "myHand") sendChatMessage(`[FIELD_UPDATE]≔【${name}】﹕${convertForLog(location)} ➟ ${convertForLog("myHand")}`);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToBreedingArea] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myBreedingArea", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myBreedingArea', name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToTamer] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, name, type} = item;
            if (type === "Digi-Egg" || type === "Option") return;
            handleDropToField(id, location, 'myTamer', name);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDelay] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, name} = item;
            handleDropToField(id, location, 'myDelay', name);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [{isOverDeckTop}, dropToDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, type, name} = item;
            if (type === "Token") return;
            sendChatMessage(`[FIELD_UPDATE]≔【${location === "myHand" ? "???" : name}】﹕${convertForLog(cardToSend.location)} ➟ Deck Top`);
            sendCardToDeck("Top", {id, location}, "myDeckField");
            sendUpdate();
            playDrawCardSfx();
        },
        collect: (monitor) => ({
            isOverDeckTop: !!monitor.isOver(),
        }),
    }));

    const [{isOverBottom, canDropToDeckBottom}, dropToDeckBottom] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, type, name} = item;
            if (type === "Token") return;
            sendChatMessage(`[FIELD_UPDATE]≔【${location === "myHand" ? "???" : name}】﹕${convertForLog(cardToSend.location)} ➟ Deck Bottom`);
            sendCardToDeck("Bottom", {id, location}, "myDeckField");
            sendUpdate();
            playDrawCardSfx();
        },
        collect: (monitor) => ({
            isOverBottom: !!monitor.isOver(),
            canDropToDeckBottom: !!monitor.canDrop(),
        }),
    }));

    const [, dropToEggDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, type} = item;
            if (type === "Token") return;
            setCardToSend({id, location});
            setEggDeckMoodle(true);
            setDeckMoodle(false);
            setSecurityMoodle(false);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            highlighted: monitor.canDrop(),
        }),
    }));

    const [, dropToSecurity] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, type} = item;
            if (type === "Token") return;
            setCardToSend({id, location});
            setSecurityMoodle(true);
            setDeckMoodle(false);
            setEggDeckMoodle(false);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [{isOverTrash}, dropToTrash] = useDrop(() => ({
        accept: ["card", "card-stack"],
        drop: (item: DraggedItem | DraggedStack) => {
            if (isCardStack(item)) {
                const {index, location} = item as DraggedStack;
                moveCardStack(index, location, "myTrash", handleDropToField);
            } else {
                const {id, location, name} = item as DraggedItem;
                handleDropToField(id, location, 'myTrash', name);
            }
        },
        collect: (monitor) => ({
            isOverTrash: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi1] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi1');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi2] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi2');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi3] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi3');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi4] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi4');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi5] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi5');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi6] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi6');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi7] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi7');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi8] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi8');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi9] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi9');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentDigi10] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentDigi10');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToOpponentSecurity] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {location} = item;
            handleDropToOpponent(location, 'opponentSecurity');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    useEffect(() => {
        if (timer === 0) navigate("/lobby");
    }, [timer, navigate]);

    useEffect(() => {
        setDeckMoodle(false);
        setEggDeckMoodle(false);
        setSecurityMoodle(false);
        if (opponentTrash.length === 0) {
            setOpponentTrashMoodle(false);
        }
        if (myTrash.length === 0) {
            setTrashMoodle(false);
        }
    }, [myHand, myTrash, myDeckField, myEggDeck, myBreedingArea, myTamer, myDelay, myReveal, myDigi1, myDigi2, myDigi3, myDigi4, myDigi5, myDigi6, myDigi7, myDigi8, myDigi9, myDigi10]);

    useEffect(() => {
        clearBoard();
        return () => {
            clearInterval(interval);
        };
    }, []);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${opponentName}`);
        startTimer();
    }

    function acceptRestart() {
        clearBoard();
        setRestartMoodle(false);
        websocket.sendMessage(`${gameId}:/acceptRestart:${opponentName}`);
        websocket.sendMessage("/restartGame:" + gameId);
    }

    function startTimer() {
        setTimerOpen(true);
        const timeoutIDs: number[] = [];
        for (let i = 5; i > 0; i--) {
            const timeoutId = setTimeout(() => {
                setTimer((timer) => timer - 1);
            }, i * 1000);
            timeoutIDs.push(timeoutId);
        }
        return () => {
            timeoutIDs.forEach(clearTimeout)
        };
    }

    return (
        <BackGround>
            {user === "Kaito" &&
                <span style={{position: "absolute", top: 15, left: 15}}>users ingame: {userCount}</span>}
            {showAttackArrow && <AttackArrows fromOpponent={attackFromOpponent} from={arrowFrom} to={arrowTo}/>}
            <BackGroundPattern/>
            {(surrenderOpen || timerOpen) &&
                <SurrenderMoodle timer={timer} timerOpen={timerOpen} surrenderOpen={surrenderOpen}
                                 setSurrenderOpen={setSurrenderOpen} opponentLeft={opponentLeft}
                                 handleSurrender={handleSurrender}/>}
            {restartMoodle && <RestartMoodle setRestartMoodle={setRestartMoodle} sendAcceptRestart={acceptRestart}/>}
            {showStartingPlayer &&
                <Fade direction={"right"}
                      style={{zIndex: 1000, position: "absolute", left: "40%", transform: "translateX(-50%)"}}>
                    <StartingName>1st: {startingPlayer}</StartingName></Fade>}

            <Wrapper chatOpen={isChatOpen}>
                <ChatSideBar chatOpen={isChatOpen} onClick={() => setIsChatOpen(true)}>
                    {isChatOpen ? <GameChat user={user} sendChatMessage={sendChatMessage}
                                            closeChat={() => setIsChatOpen(false)}/> : <span>›</span>}
                </ChatSideBar>

                {myReveal.length > 0 && <RevealContainer style={{top: opponentReveal.length === 0 ? "435px" : "600px"}}>
                    {myReveal?.map((card) =>
                        <Flip key={card.id}><Card card={card} location="myReveal"
                                                  sendSfx={sendSfx} sendUpdate={sendUpdate}/></Flip>)}
                </RevealContainer>}
                {opponentReveal.length > 0 && <RevealContainer>
                    {opponentReveal?.map((card) =>
                        <Flip key={card.id}><Card card={card} location="opponentReveal"
                                                  sendSfx={sendSfx} sendUpdate={sendUpdate}/></Flip>)}
                </RevealContainer>}

                <InfoContainer>
                    <InfoSpan>
                        <a href="https://www.youtube.com/watch?v=ghZYuIi5mu4&ab_channel=OfficialBandaiCardGamesChannel"
                           target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color: "dodgerblue"}}>🛈 </span>Tutorial
                        </a>
                        <a href="https://world.digimoncard.com/rule/pdf/general_rules.pdf" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color: "dodgerblue"}}>🛈 </span>Rulings
                        </a>
                        <a style={{position: "absolute", left: 32, top: 33}}
                           href="https://github.com/WE-Kaito/digimon-tcg-simulator/wiki#game-%EF%B8%8F" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color: "dodgerblue"}}>🛈 </span>Controls
                        </a>
                    </InfoSpan>
                    <CardImage onClick={() => selectCard(null)}
                               src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                               alt={selectedCard?.name ?? "Card"}/>
                    <CardDetails/>
                </InfoContainer>

                {trashMoodle && <TrashView>
                    {myTrash.map((card) => <Card key={card.id} card={card} location="myTrash"/>)}
                </TrashView>}

                {opponentTrashMoodle && <TrashView>
                    {opponentTrash.map((card) => <Card key={card.id} card={card} location="opponentTrash"/>)}
                </TrashView>}

                {securityContentMoodle && <SecurityView>
                    {mySecurity.map((card) => <Card key={card.id} card={card} location="mySecurity"/>)}
                </SecurityView>}

                <FieldContainer>
                    <div style={{display: "flex"}}>
                        <OpponentContainerMain>

                            <PlayerContainer>
                                <PlayerImage alt="opponent" src={profilePicture(opponentAvatar)} opponent={true}
                                             onClick={() => {
                                                 websocket.sendMessage(`${gameId}:/restartRequest:${opponentName}`);
                                                 notifyRequestedRestart();
                                             }}
                                />
                                <UserName>{opponentName}</UserName>
                            </PlayerContainer>

                            <OpponentDeckContainer>
                                <img alt="deck" src={deckBack} width="105px"/>
                                <TrashSpan
                                    style={{transform: "translateX(15px)"}}>{opponentDeckField.length}</TrashSpan>
                            </OpponentDeckContainer>

                            <OpponentTrashContainer>
                                <TrashSpan style={{transform: "translateX(-9px)"}}>{opponentTrash.length}</TrashSpan>
                                {opponentTrash.length === 0 ? <TrashPlaceholder>Trash</TrashPlaceholder>
                                    : <TrashCardImage src={opponentTrash[opponentTrash.length - 1].image_url}
                                                      alt={"opponentTrash"}
                                                      onClick={() => {
                                                          setOpponentTrashMoodle(!opponentTrashMoodle);
                                                          setTrashMoodle(false);
                                                      }}
                                                      title="Open opponents trash"/>}
                            </OpponentTrashContainer>

                            <BattleArea5 ref={isOpponentSecondRowVisible ? dropToOpponentDigi10 : dropToOpponentDigi5}
                                         id={getFieldId(true, opponentDigi5, opponentDigi10, "opponentDigi5", "opponentDigi10")}>
                                {isOpponentSecondRowVisible
                                    ? <CardStack cards={opponentDigi10} location={"opponentDigi10"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>
                                    : <CardStack cards={opponentDigi5} location={"opponentDigi5"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>}
                            </BattleArea5>
                            <BattleArea4 ref={isOpponentSecondRowVisible ? dropToOpponentDigi9 : dropToOpponentDigi4}
                                         id={getFieldId(true, opponentDigi4, opponentDigi9, "opponentDigi4", "opponentDigi9")}>
                                {isOpponentSecondRowVisible
                                    ? <CardStack cards={opponentDigi9} location={"opponentDigi9"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>
                                    : <CardStack cards={opponentDigi4} location={"opponentDigi4"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>}
                            </BattleArea4>
                            <BattleArea3 ref={isOpponentSecondRowVisible ? dropToOpponentDigi8 : dropToOpponentDigi3}
                                         id={getFieldId(true, opponentDigi3, opponentDigi8, "opponentDigi3", "opponentDigi8")}>
                                {!isOpponentSecondRowVisible && opponentDigi3.length === 0 &&
                                    <FieldSpan>Battle Area</FieldSpan>}
                                {isOpponentSecondRowVisible
                                    ? <CardStack cards={opponentDigi8} location={"opponentDigi8"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>
                                    : <CardStack cards={opponentDigi3} location={"opponentDigi3"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>}
                            </BattleArea3>
                            <BattleArea2 ref={isOpponentSecondRowVisible ? dropToOpponentDigi7 : dropToOpponentDigi2}
                                         id={getFieldId(true, opponentDigi2, opponentDigi7, "opponentDigi2", "opponentDigi7")}>
                                {isOpponentSecondRowVisible
                                    ? <CardStack cards={opponentDigi7} location={"opponentDigi7"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>
                                    : <CardStack cards={opponentDigi2} location={"opponentDigi2"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>}
                            </BattleArea2>
                            <BattleArea1 ref={isOpponentSecondRowVisible ? dropToOpponentDigi6 : dropToOpponentDigi1}
                                         id={getFieldId(true, opponentDigi1, opponentDigi6, "opponentDigi1", "opponentDigi6")}>
                                {isOpponentSecondRowVisible
                                    ? <CardStack cards={opponentDigi6} location={"opponentDigi6"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>
                                    : <CardStack cards={opponentDigi1} location={"opponentDigi1"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate} opponentSide={true}/>}
                            </BattleArea1>

                            <DelayAreaContainer style={{marginTop: "1px", height: "205px"}}>
                                {opponentDelay.length === 0 && <FieldSpan>Delay</FieldSpan>}
                                {opponentDelay.map((card, index) =>
                                    <DelayCardContainer key={card.id} cardIndex={index}>
                                        <Fade direction={"down"} duration={500}>
                                            <Card card={card} location={"opponentDelay"}/>
                                        </Fade></DelayCardContainer>)}
                            </DelayAreaContainer>

                            <TamerAreaContainer style={{height: "205px"}}>
                                {opponentTamer.length === 0 && <FieldSpan>Tamers</FieldSpan>}
                                {opponentTamer.map((card, index) =>
                                    <TamerCardContainer key={card.id} cardIndex={index}
                                                        digimonIndex={getConsecutiveDigimonIndex(card, opponentTamer)}
                                                        tamerIndex={getTamerCardIndex(card, opponentTamer)}>
                                        <Fade direction={"left"} duration={500}>
                                            <Card card={card} location={"opponentTamer"}/>
                                        </Fade></TamerCardContainer>)}
                            </TamerAreaContainer>

                            <OpponentHandContainer>
                                <HandCards cardCount={opponentHand.length}
                                           style={{transform: `translateX(-${opponentHand.length * (opponentHand.length < 11 ? 2.5 : 1.5)}px)`}}>
                                    {opponentHand.map((card, index) =>
                                        <HandListItem cardCount={opponentHand.length} cardIndex={index}
                                                      key={card.id}><OppenentHandCard alt="card" src={cardBack}/>
                                        </HandListItem>)}
                                </HandCards>
                                {opponentHand.length > 5 && <MyHandSpan
                                    style={{transform: "rotate(180deg)"}}>{opponentHand.length}</MyHandSpan>}
                            </OpponentHandContainer>

                        </OpponentContainerMain>

                        <OpponentContainerSide>
                            <EggDeckContainer>
                                {opponentEggDeck.length !== 0 &&
                                    <div style={{
                                        width: "100%",
                                        display: "flex",
                                        fontStyle: "italic",
                                        transform: "translateX(-5px)",
                                        justifyContent: "center",
                                        fontFamily: "Awsumsans, sans-serif"
                                    }}>{opponentEggDeck.length}</div>}
                                {opponentEggDeck.length !== 0 && <img alt="egg-deck" src={eggBack} width="105px"
                                                                      style={{transform: "translateX(-5px) rotate(180deg)"}}/>}
                            </EggDeckContainer>

                            <SecurityStackContainer ref={dropToOpponentSecurity}>
                                <SecuritySpan style={{cursor: "default"}}
                                              id="opponentSecurity">{opponentSecurity.length}</SecuritySpan>
                                <Lottie animationData={opponentSecurityAnimation} loop={true}
                                        style={{width: "160px"}}/>
                                <OpponentSwitchRowButton1 disabled={showAttackArrow}
                                                          onClick={() => setIsOpponentSecondRowVisible(false)}
                                                          secondRowVisible={!isOpponentSecondRowVisible}/>
                                <OpponentSwitchRowButton2 disabled={showAttackArrow}
                                                          onClick={() => setIsOpponentSecondRowVisible(true)}
                                                          secondRowVisible={isOpponentSecondRowVisible}/>
                                {opponentSecondRowWarning && <OpponentSecondRowWarning>!</OpponentSecondRowWarning>}
                            </SecurityStackContainer>

                            <BreedingAreaContainer>
                                <CardStack cards={opponentBreedingArea} location={"opponentBreedingArea"}
                                           sendSfx={sendSfx} sendUpdate={sendUpdate} opponentSide={true}/>
                                {opponentBreedingArea.length === 0 && <FieldSpan>Breeding<br/>Area</FieldSpan>}
                            </BreedingAreaContainer>

                        </OpponentContainerSide>
                    </div>

                    {memoryBarLoading ? <div style={{height: "100px"}}/> :
                        <Zoom><MemoryBar sendMemoryUpdate={sendMemoryUpdate} sendSfx={sendSfx}
                                         sendChatMessage={sendChatMessage}/></Zoom>}

                    <div style={{display: "flex"}}>
                        <MyContainerSide>
                            <EggDeckContainer ref={dropToEggDeck}>
                                {eggDeckMoodle &&
                                    <DeckMoodle sendUpdate={sendUpdate} cardToSend={cardToSend} to={"myEggDeck"}
                                                setMoodle={setEggDeckMoodle} sendChatMessage={sendChatMessage}/>}
                                {myEggDeck.length !== 0 &&
                                    <EggDeck alt="egg-deck" src={eggBack}
                                             onClick={() => {
                                                 if (!opponentReady) return;
                                                 moveCard(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
                                                 sendSingleUpdate(myEggDeck[0].id, "myEggDeck", "myBreedingArea");
                                                 playDrawCardSfx();
                                                 sendSfx("playPlaceCardSfx");
                                                 sendChatMessage(`[FIELD_UPDATE]≔【${myEggDeck[0].name}】﹕Egg-Deck ➟ Breeding`);
                                             }}/>}
                                {myEggDeck.length !== 0 &&
                                    <div style={{
                                        width: "100%", display: "flex", fontStyle: "italic",
                                        justifyContent: "center", fontFamily: "Awsumsans, sans-serif",
                                        transform: "translateY(-25px)"
                                    }}>{myEggDeck.length}</div>}

                                <TokenButton alt="create token" src={hackmonButton} onClick={() => {
                                    createToken();
                                    playPlaceCardSfx();
                                    sendUpdate();
                                    sendSfx("playPlaceCardSfx");
                                    sendChatMessage("[FIELD_UPDATE]≔【Spawn Token】");
                                }}/>
                            </EggDeckContainer>

                            <SecurityStackContainer ref={dropToSecurity}>
                                {securityMoodle &&
                                    <DeckMoodle sendUpdate={sendUpdate} cardToSend={cardToSend} to={"mySecurity"}
                                                setMoodle={setSecurityMoodle} sendChatMessage={sendChatMessage}/>}
                                <MySecuritySpan id="mySecurity" cardCount={mySecurity.length} onClick={() => {
                                    if (opponentReveal.length === 0) moveCard(mySecurity[0].id, "mySecurity", "myReveal");
                                    sendSingleUpdate(mySecurity[0].id, "mySecurity", "myReveal");
                                    playSecurityRevealSfx();
                                    sendSfx("playSecurityRevealSfx");
                                    sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security ➟ Reveal`);
                                }}>{mySecurity.length}</MySecuritySpan>
                                <Lottie animationData={mySecurityAnimation} loop={true}
                                        style={{width: "160px", transform: "translate(23px, -14px)"}}/>

                                {!securityContentMoodle ?
                                    <SendButton title="Open Security Stack"
                                                style={{left: 20, top: 10}}
                                                onClick={() => {
                                                    setSecurityContentMoodle(true);
                                                    setTrashMoodle(false);
                                                    websocket.sendMessage(gameId + ":/openedSecurity:" + opponentName);
                                                    sendChatMessage(`[FIELD_UPDATE]≔【Opened Security】`);
                                                }}
                                    >🔎</SendButton>
                                    :
                                    <SendButton title="Close and shuffle Security Stack"
                                                style={{left: 20, top: 10}}
                                                onClick={() => {
                                                    setSecurityContentMoodle(false);
                                                    shuffleSecurity();
                                                    sendUpdate();
                                                    playShuffleDeckSfx();
                                                    sendSfx("playShuffleDeckSfx");
                                                    sendChatMessage(`[FIELD_UPDATE]≔【Closed Security】`);
                                                }}>❌🔄</SendButton>}

                                <SendButtonSmall title="Trash the top card of your Security Stack"
                                                 style={{left: 20, top: 45}}
                                                 onClick={() => {
                                                     moveCard(mySecurity[0].id, "mySecurity", "myTrash");
                                                     sendSingleUpdate(mySecurity[0].id, "mySecurity", "myTrash");
                                                     websocket.sendMessage(gameId + ":/playTrashCardSfx:" + opponentName);
                                                     sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security Top ➟ Trash`);
                                                 }}>🗑️<MiniArrowSpan>▲</MiniArrowSpan></SendButtonSmall>

                                <SendButtonSmall title="Trash the bottom card of your Security Stack"
                                                 style={{left: 20, top: 80}}
                                                 onClick={() => {
                                                     moveCard(mySecurity[mySecurity.length - 1].id, "mySecurity", "myTrash");
                                                     sendSingleUpdate(mySecurity[mySecurity.length - 1].id, "mySecurity", "myTrash");
                                                     websocket.sendMessage(gameId + ":/playTrashCardSfx:" + opponentName);
                                                     sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[mySecurity.length - 1].name}】﹕Security Bot ➟ Trash`);
                                                 }}>🗑️<MiniArrowSpan>▼</MiniArrowSpan></SendButtonSmall>

                                <SendButtonSmall title="Take the top card of your Security Stack"
                                                 style={{left: 50, top: 45}}
                                                 onClick={() => {
                                                     moveCard(mySecurity[0].id, "mySecurity", "myHand");
                                                     sendSingleUpdate(mySecurity[0].id, "mySecurity", "myHand");
                                                     websocket.sendMessage(gameId + ":/playDrawCardSfx:" + opponentName);
                                                     sendChatMessage(`[FIELD_UPDATE]≔【???】﹕Security Top ➟ Hand`);
                                                 }}>✋🏻<MiniArrowSpan>▲</MiniArrowSpan></SendButtonSmall>


                                <SendButtonSmall title="Take the bottom card of your Security Stack"
                                                 style={{left: 50, top: 80}}
                                                 onClick={() => {
                                                     moveCard(mySecurity[mySecurity.length - 1].id, "mySecurity", "myHand");
                                                     sendSingleUpdate(mySecurity[mySecurity.length - 1].id, "mySecurity", "myHand");
                                                     websocket.sendMessage(gameId + ":/playDrawCardSfx:" + opponentName);
                                                     sendChatMessage(`[FIELD_UPDATE]≔【???】﹕Security Bot ➟ Hand`);
                                                 }}>✋🏻<MiniArrowSpan>▼</MiniArrowSpan></SendButtonSmall>

                                <SendButton title="Shuffle your Security Stack"
                                            style={{left: 20, top: 115}}
                                            onClick={() => {
                                                shuffleSecurity();
                                                sendUpdate();
                                                playShuffleDeckSfx();
                                                sendChatMessage(`[FIELD_UPDATE]≔【↻ Security Stack】`);
                                                sendSfx("playShuffleDeckSfx");
                                            }}>🔄</SendButton>

                                <MySwitchRowButton1 disabled={showAttackArrow}
                                                    onClick={() => setIsMySecondRowVisible(false)}
                                                    secondRowVisible={!isMySecondRowVisible}/>
                                <MySwitchRowButton2 disabled={showAttackArrow}
                                                    onClick={() => setIsMySecondRowVisible(true)}
                                                    secondRowVisible={isMySecondRowVisible}/>
                                {mySecondRowWarning && <MySecondRowWarning>!</MySecondRowWarning>}
                            </SecurityStackContainer>

                            <BreedingAreaContainer ref={dropToBreedingArea}>
                                {<CardStack cards={myBreedingArea} location={"myBreedingArea"} sendSfx={sendSfx}
                                            sendUpdate={sendUpdate}/>}
                                {myBreedingArea.length === 0 && <FieldSpan>Breeding<br/>Area</FieldSpan>}
                            </BreedingAreaContainer>
                        </MyContainerSide>

                        <MyContainerMain>

                            <PlayerContainer>
                                <UserName>{user}</UserName>
                                <PlayerImage alt="me" src={profilePicture(myAvatar)}
                                             onClick={() => setSurrenderOpen(!surrenderOpen)}
                                             title="Surrender"/>
                            </PlayerContainer>

                            <DeckContainer>

                                {deckMoodle &&
                                    <DeckMoodle sendUpdate={sendUpdate} cardToSend={cardToSend} to={"myDeckField"}
                                                setMoodle={setDeckMoodle} sendChatMessage={sendChatMessage}/>}

                                {!mulliganAllowed && !opponentReady &&
                                    <MulliganSpan style={{top: 3}}>Waiting for opponent...</MulliganSpan>}
                                {mulliganAllowed &&
                                    <>
                                        <MulliganSpan>KEEP HAND?</MulliganSpan>
                                        <MulliganButton onClick={() => {
                                            mulligan();
                                            sendUpdate();
                                            websocket.sendMessage(gameId + ":/playerReady:" + opponentName);
                                            playShuffleDeckSfx();
                                            sendSfx("playShuffleDeckSfx");
                                            sendChatMessage(`[FIELD_UPDATE]≔【MULLIGAN】`);
                                            if (opponentReady) setGameHasStarted(true);
                                        }}>N</MulliganButton>
                                        <MulliganButton2 onClick={() => {
                                            setMulliganAllowed(false);
                                            websocket.sendMessage(gameId + ":/playerReady:" + opponentName);
                                            if (opponentReady) setGameHasStarted(true);
                                        }}>
                                            Y
                                        </MulliganButton2>
                                    </>}

                                <TrashSpan style={{transform: gameHasStarted ? "translate(-14px, -40px)" : "translate(-14px, 0)",}}>
                                    {myDeckField.length}</TrashSpan>
                                <Deck ref={dropToDeck} alt="deck" src={deckBack} gameHasStarted={gameHasStarted} isOver={isOverDeckTop}
                                      onClick={() => {
                                          if (!opponentReady) return;
                                          moveCard(myDeckField[0].id, "myDeckField", "myHand");
                                          sendSingleUpdate(myDeckField[0].id, "myDeckField", "myHand");
                                          playDrawCardSfx();
                                          sendSfx("playDrawCardSfx");
                                          sendChatMessage(`[FIELD_UPDATE]≔【Draw Card】`);
                                      }}/>

                                { gameHasStarted && <DeckBottomZone ref={dropToDeckBottom} isOver={isOverBottom}>
                                    <DBZSpan isOver={isOverBottom} canDrop={canDropToDeckBottom}>⇑ ⇑ ⇑</DBZSpan></DeckBottomZone>}

                                <SendToTrashButton title="Send top card from your deck to Trash"
                                                   onClick={() => {
                                                       if (!opponentReady) return;
                                                       moveCard(myDeckField[0].id, "myDeckField", "myTrash");
                                                       sendSingleUpdate(myDeckField[0].id, "myDeckField", "myTrash");
                                                       playTrashCardSfx();
                                                       sendSfx("playTrashCardSfx");
                                                       sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Trash`);
                                                   }}>↱</SendToTrashButton>
                                <SendButton title="Send top card from your deck to Security Stack" style={{left: -115}}
                                            onClick={() => {
                                                if (!opponentReady) return;
                                                const id = myDeckField[0].id;
                                                const location = "myDeckField";
                                                sendCardToDeck("Top", {id, location}, "mySecurity");
                                                sendUpdate();
                                                websocket.sendMessage(gameId + ":/playDrawCardSfx:" + opponentName);
                                                sendChatMessage(`[FIELD_UPDATE]≔【Top Deck Card】﹕➟ Security Top`);
                                            }}>⛊️+1</SendButton>
                                <SendButton title="Reveal the top card of your deck" onClick={() => {
                                    if (!opponentReady) return;
                                    moveCard(myDeckField[0].id, "myDeckField", "myReveal");
                                    sendSingleUpdate(myDeckField[0].id, "myDeckField", "myReveal");
                                    playRevealCardSfx();
                                    sendSfx("playRevealSfx");
                                    sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Reveal`);
                                }}
                                            disabled={opponentReveal.length > 0} style={{left: -52}}>👁️+1</SendButton>
                            </DeckContainer>

                            <TrashContainer>
                                {myTrash.length === 0 ? <TrashPlaceholder ref={dropToTrash} isOver={isOverTrash}>Trash</TrashPlaceholder>
                                    : <TrashCardImage ref={dropToTrash} src={myTrash[myTrash.length - 1].image_url} alt={"myTrash"}
                                                      onClick={() => {
                                                          setTrashMoodle(!trashMoodle);
                                                          setOpponentTrashMoodle(false);
                                                      }}
                                                      title="Open your trash" isOver={isOverTrash}/>}
                                <TrashSpan style={{transform: "translateX(12px)"}}>{myTrash.length}</TrashSpan>
                            </TrashContainer>

                            <BattleArea1 ref={isMySecondRowVisible ? dropToDigi6 : dropToDigi1}
                                         id={getFieldId(false, myDigi1, myDigi6, "myDigi1", "myDigi6")}>
                                {isMySecondRowVisible
                                    ? <CardStack cards={myDigi6} location={"myDigi6"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>
                                    : <CardStack cards={myDigi1} location={"myDigi1"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>}
                            </BattleArea1>
                            <BattleArea2 ref={isMySecondRowVisible ? dropToDigi7 : dropToDigi2}
                                         id={getFieldId(false, myDigi2, myDigi7, "myDigi2", "myDigi7")}>
                                {isMySecondRowVisible
                                    ? <CardStack cards={myDigi7} location={"myDigi7"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>
                                    : <CardStack cards={myDigi2} location={"myDigi2"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>}
                            </BattleArea2>
                            <BattleArea3 ref={isMySecondRowVisible ? dropToDigi8 : dropToDigi3}
                                         id={getFieldId(false, myDigi3, myDigi8, "myDigi3", "myDigi8")}>
                                {!isMySecondRowVisible && myDigi3.length === 0 && <FieldSpan>Battle Area</FieldSpan>}
                                {isMySecondRowVisible
                                    ? <CardStack cards={myDigi8} location={"myDigi8"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>
                                    : <CardStack cards={myDigi3} location={"myDigi3"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>}
                            </BattleArea3>
                            <BattleArea4 ref={isMySecondRowVisible ? dropToDigi9 : dropToDigi4}
                                         id={getFieldId(false, myDigi4, myDigi9, "myDigi4", "myDigi9")}>
                                {isMySecondRowVisible
                                    ? <CardStack cards={myDigi9} location={"myDigi9"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>
                                    : <CardStack cards={myDigi4} location={"myDigi4"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>}
                            </BattleArea4>
                            <BattleArea5 ref={isMySecondRowVisible ? dropToDigi10 : dropToDigi5}
                                         id={getFieldId(false, myDigi5, myDigi10, "myDigi5", "myDigi10")}>
                                {isMySecondRowVisible
                                    ? <CardStack cards={myDigi10} location={"myDigi10"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>
                                    : <CardStack cards={myDigi5} location={"myDigi5"} sendSfx={sendSfx}
                                                 sendUpdate={sendUpdate}  handleDropToStackBottom={handleDropToStackBottom}/>}
                            </BattleArea5>

                            <DelayAreaContainer ref={dropToDelay} style={{transform: "translateY(1px)"}}>
                                {myDelay.map((card, index) =>
                                    <DelayCardContainer key={card.id} cardIndex={index}>
                                        <Card card={card} location={"myDelay"}/></DelayCardContainer>)}
                                {myDelay.length === 0 && <FieldSpan>Delay</FieldSpan>}
                            </DelayAreaContainer>

                            <TamerAreaContainer ref={dropToTamer}>
                                {myTamer.map((card, index) =>
                                    <TamerCardContainer key={card.id} cardIndex={index}
                                                        digimonIndex={getConsecutiveDigimonIndex(card, myTamer)}
                                                        tamerIndex={getTamerCardIndex(card, myTamer)}>
                                        <Card card={card} location={"myTamer"}
                                              sendSfx={sendSfx} sendUpdate={sendUpdate}/></TamerCardContainer>)}
                                {myTamer.length === 0 && <FieldSpan>Tamers</FieldSpan>}
                            </TamerAreaContainer>

                            <HandContainer ref={dropToHand}>
                                <HandCards cardCount={myHand.length}
                                           style={{transform: `translateX(-${myHand.length > 12 ? (myHand.length * 0.5) : 0}px)`}}>
                                    {myHand.map((card, index) =>
                                        <HandListItem cardCount={myHand.length} cardIndex={index} key={card.id}>
                                            <Card card={card} location={"myHand"}/></HandListItem>)}
                                </HandCards>
                                {myHand.length > 5 && <MyHandSpan>{myHand.length}</MyHandSpan>}
                            </HandContainer>

                        </MyContainerMain>
                    </div>
                </FieldContainer>
            </Wrapper>
        </BackGround>
    );
}

const MyContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1.2fr 1fr;
  grid-template-areas: "digi1 digi1 digi2 digi2 digi3 digi3 digi4 digi4 digi5 digi5 trash trash deck deck"
                        "delay delay tamer tamer tamer hand hand hand hand hand hand player player player";
`;

const OpponentContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1fr 1.2fr;
  grid-template-areas: "player player player hand hand hand hand hand hand tamer tamer tamer delay delay"
                        "deck deck trash trash digi5 digi5 digi4 digi4 digi3 digi3 digi2 digi2 digi1 digi1";
`;

const SwitchRowButton = styled.button<{ secondRowVisible: boolean }>`
  width: 10px;
  height: 10px;
  padding: 0;
  margin: 5px;
  background: ${({secondRowVisible}) => secondRowVisible ? "#fff" : "#151515"};
  filter: ${({secondRowVisible}) => secondRowVisible ? "drop-shadow(0px 0px 2px ghostwhite)" : "none"};
  position: absolute;
`;

const SecondRowWarning = styled.span`
  font-size: 48px;
  font-family: Naston, sans-serif;
  color: crimson;
  filter: drop-shadow(0px 0px 2px crimson);
  position: absolute;
  cursor: default;
`;

const MySecondRowWarning = styled(SecondRowWarning)`
  right: 9px;
  top: 55px;
`;

const OpponentSecondRowWarning = styled(SecondRowWarning)`
  left: 9px;
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
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1.5fr;
  grid-template-areas: "security-stack security-stack"
                        "egg-deck breed";
`;

const OpponentContainerSide = styled.div`
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1.5fr 1fr;
  grid-template-areas: "breed egg-deck"
                        "security-stack security-stack";
`;

const InfoContainer = styled.div`
  height: 1000px;
  width: 310px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div<{ chatOpen: boolean }>`
  position: relative;
  height: 1000px;
  width: 1600px;
  display: flex;
  background: rgba(47, 45, 45, 0.45);
  border-radius: 15px;
  transform: translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  transition: transform 0.4s ease-in-out;

  @media (max-height: 1199px) {
    transform: scale(1) translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  }
  @media (max-height: 1080px) {
    transform: scale(0.9) translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  }
  @media (max-height: 900px) {
    transform: scale(0.7) translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  }
  @media (min-height: 1200px) {
    transform: scale(1.2) translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  }
  @media only screen and (min-device-width: 300px) and (max-device-width: 550px) and (orientation: landscape) and (-webkit-min-device-pixel-ratio: 2) {
    transform: scale(0.35) translateX(${({chatOpen}) => chatOpen ? "-100px" : "0"});
  }
  @media only screen and (min-device-width: 300px) and (max-device-width: 550px) and (orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) {
    transform: scale(0.6) translateX(${({chatOpen}) => chatOpen ? "-120px" : "-20px"});
  }
`;

const ChatSideBar = styled.div<{ chatOpen: boolean }>`
  position: absolute;
  right: ${({chatOpen}) => chatOpen ? "-250px" : "-25px"};
  top: 0;
  height: 100%;
  width: ${({chatOpen}) => chatOpen ? "280px" : "40px"};
  background: linear-gradient(to right, rgba(15, 15, 15, 0) 5%, ${({chatOpen}) => chatOpen ? "rgba(30, 30, 30, 0.5) 10%" : "rgba(15, 15, 15, 0.15) 35%"});
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({chatOpen}) => chatOpen ? "default" : "pointer"};
  transition: all 0.4s ease-out;

  span {
    visibility: ${({chatOpen}) => chatOpen ? "hidden" : "visible"};
    transition: all 0.15s ease;
    cursor: pointer;
    opacity: 0.1;
    font-size: 44px;
    margin-bottom: 10px;
    margin-left: 12px;
  }

  &:hover {
    ${({chatOpen}) =>
            !chatOpen &&
            `
      background: linear-gradient(to right, rgba(25, 25, 25, 0) 5%, rgba(25, 25, 25, 0.5) 30%);
      width: 50px;
      right: -35px;
      
      span {
        margin-left: 14px;
        opacity: 0.6;
        font-size: 54px;
      }
    `}
  }
`;

const MiniArrowSpan = styled.span`
  position: absolute;
  left: 13px;
  top: 0;
  font-size: 10px;
  filter: drop-shadow(0 0 2px #000000);
`;

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: player;
  align-items: center;
  justify-content: center;
`;

const PlayerImage = styled.img<{opponent?:boolean}>`
  cursor: pointer;
  width: 160px;
  transition: all 0.1s ease;
  transform: ${({opponent}) => opponent ? "rotateY(180deg)" : "none"};
  
  &:hover {
    filter: drop-shadow(0 0 2px ${({opponent}) => opponent ? "#43d789" : "#bb2848"});
    width: 144px;
    margin-left: 8px;
    padding: 8px;
  }
`;

const UserName = styled.span`
  font-size: 20px;
  align-self: flex-start;
  margin-left: 27px;
  font-family: 'Cousine', sans-serif;
`;

const MyHandSpan = styled.span`
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  font-size: 20px;
  opacity: 0.4;

  position: absolute;
  bottom: 0;
  transform: translateX(7px);
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

const Deck = styled.img<{gameHasStarted?: boolean, isOver?: boolean}>`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;
  transform: ${({gameHasStarted}) => gameHasStarted ? "translateY(-37px)" : "translateY(0)"};
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0 0 1px #eceaea) saturate(1.1) brightness(0.95)" : "none"};
  
  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const DeckBottomZone = styled.div<{isOver: boolean}>`
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

const DBZSpan = styled.span<{isOver: boolean, canDrop: boolean}>`
  visibility: ${({canDrop}) => canDrop ? "visible" : "hidden"};
  color: ${({isOver}) => isOver ? "rgba(218,216,213,0.88)" : "rgba(161, 157, 154, 0.3)"};
  cursor: default;
  transition: all 0.1s ease;
  transform: translateY(1px) scale(${({isOver}) => isOver ? "1.05" : "1"});
`;

const EggDeck = styled(Deck)`
  transform: translateY(-25px);

  &:hover {
    filter: drop-shadow(0 0 3px #dd33e8);
    outline: #dd33e8 solid 1px;
  }
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
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0 0 10px 10px;
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

const SecuritySpan = styled.span`
  position: absolute;
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-style: normal;
  font-size: 35px;
  color: #cb6377;
  text-shadow: #111921 1px 1px 1px;
  left: 132px;
`;

const MySecuritySpan = styled(SecuritySpan)<{ cardCount: number }>`
  cursor: pointer;
  color: #5ba2cb;
  transition: all 0.15s ease;
  transform: translate(${({cardCount}) => cardCount === 1 ? 28 : 23}px, -13px);

  &:hover {
    filter: drop-shadow(0 0 5px #1b82e8) saturate(1.5);
    font-size: 42px;
    color: #f9f9f9;
    transform: translate(${({cardCount}) => cardCount === 1 ? 28 : 21}px, -14px);
  }

  @media (min-width: 2000px) {
    transform: translate(${({cardCount}) => cardCount === 1 ? 29 : 24}px, -13px);
    &:hover {
      transform: translate(${({cardCount}) => cardCount === 1 ? 29 : 22}px, -14px);
    }
  }

`;

const TamerCardContainer = styled.div<{ cardIndex: number, digimonIndex: number, tamerIndex: number }>`
  position: absolute;
  top: 10px;
  left: ${({tamerIndex}) => (tamerIndex * 40) + 5}px;
  z-index: ${({cardIndex}) => 20 - cardIndex};
  transform: ${({digimonIndex, cardIndex}) =>
          cardIndex !== 0 ? (digimonIndex !== 0 ? `translate(-40px, ${digimonIndex * 25}px)` : "none") : "none"};

  &:hover {
    z-index: 100;
  }
`;

const DelayCardContainer = styled.div<{ cardIndex: number }>`
  position: absolute;
  bottom: ${props => (props.cardIndex * 35) + 10}px;
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

  left: 59.5%;
  top: 27%;
  transform: translate(-50%, -50%);

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
  width: 55px;
  height: 30px;
  z-index: 10;
  padding: 0;
  border-radius: 5px;
  opacity: 0.65;

  &:hover {
    opacity: 1;
    border-color: #e8a71b;
  }
`;

const SendButtonSmall = styled(SendButton)`
  width: 25px;
  font-size: 0.9em;
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
  text-shadow: 0px 0px 1px #111921;
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

const TokenButton = styled.img`
  position: absolute;
  width: 50px;
  height: 50px;
  z-index: 5;
  left: 49px;
  bottom: 17px;
  transition: all 0.15s ease;
  opacity: 0.5;

  &:hover {
    opacity: 1;
    cursor: pointer;
    width: 52px;
    height: 52px;
    transform: translateX(-1px);
  }
`;

const SendToTrashButton = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  font-size: 40px;
  z-index: 10;
  left: -49px;
  bottom: 48px;
  color: #e0e0e0;
  transform: rotate(-90deg);
  opacity: 0.65;

  &:hover {
    opacity: 1;
    cursor: pointer;
    color: #e8a71b;
  }

  &:active {
    opacity: 1;
    color: #e0e0e0;
    filter: drop-shadow(0 0 2px #e8a71b);
    transform: translateX(1px) rotate(-90deg);
  }
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

const BreedingAreaContainer = styled(BattleAreaContainer)`
  margin: 1px;
  grid-area: breed;
`;

const DelayAreaContainer = styled(BattleAreaContainer)`
  grid-area: delay;
`;

const TamerAreaContainer = styled(BattleAreaContainer)`
  margin: 1px 0 1px 0;
  grid-area: tamer;
  flex-direction: row;
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

const OppenentHandCard = styled.img`
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
  width: 307px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  outline: #0c0c0c solid 1px;
  transform: translateY(2px);
`;

const InfoSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  font-family: Cuisine, sans-serif;
  font-size: 24px;
  opacity: 0.7;

  a {
    color: ghostwhite;

    &:hover {
      color: dodgerblue;
      opacity: 1;
    }
  }
`;

const FieldSpan = styled.span`
  color: rgba(119, 145, 197, 0.8);
  font-family: Naston, sans-serif;
`;

const TrashPlaceholder = styled.div<{isOver?: boolean}>`
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

const TrashCardImage = styled.img<{isOver?: boolean}>`
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
  left: 760px;
  top: 435px;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transform: scale(2);
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

const BackGround = styled.div`
  display: flex;
  z-index: -10;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(253deg, #193131, #092d4b, #4a1f64);
  background-size: 300% 300%;
  -webkit-animation: Background 25s ease infinite;
  -moz-animation: Background 25s ease infinite;
  animation: Background 25s ease infinite;

  @media only screen and (min-device-width: 300px) and (max-device-width: 550px) and (orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) {
    width: 310vw;
  }

  @-webkit-keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @-moz-keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
`;

const BackGroundPattern = styled.div`
  position: fixed;
  top: -50vh;
  left: -50vw;
  width: 200vw;
  height: 200vh;
  background: transparent url(${noiseBG}) repeat 0 0;
  background-repeat: repeat;
  animation: bg-animation .2s infinite;
  opacity: .4;
  z-index: 0;

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
