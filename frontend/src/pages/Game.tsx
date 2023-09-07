import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {DraggedItem, GameDistribution, Player} from "../utils/types.ts";
import {
    profilePicture,
    calculateCardRotation,
    calculateCardOffsetY,
    calculateCardOffsetX,
    getOpponentSfx, opponentFieldLocations
} from "../utils/functions.ts";
import {useGame} from "../hooks/useGame.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";
import SurrenderMoodle from "../components/game/SurrenderMoodle.tsx";
import deckBack from "../assets/deckBack.png";
import deckBackOpponent from "../assets/deckBackOpponent.png";
import eggBack from "../assets/eggBack.jpg";
import Card from "../components/Card.tsx";
import cardBack from "../assets/cardBack.jpg";
import noiseBG from "../assets/noiseBG.png";
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


export default function Game({user}: { user: string }) {

    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://www.digi-tcg.online/api/ws/game";
    const navigate = useNavigate();

    const selectedCard = useStore((state) => state.selectedCard);
    const selectCard = useStore((state) => state.selectCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const distributeCards = useGame((state) => state.distributeCards);
    const getUpdatedGame = useGame((state) => state.getUpdatedGame);
    const drawCardFromDeck = useGame((state) => state.drawCardFromDeck);
    const drawCardFromEggDeck = useGame((state) => state.drawCardFromEggDeck);
    const shuffleSecurity = useGame((state) => state.shuffleSecurity);

    const moveCard = useGame((state) => state.moveCard);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];

    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [timerOpen, setTimerOpen] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(5);
    const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
    const [deckMoodle, setDeckMoodle] = useState<boolean>(false);
    const [eggDeckMoodle, setEggDeckMoodle] = useState<boolean>(false);
    const [securityMoodle, setSetSecurityMoodle] = useState<boolean>(false);
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

    const setMessages = useGame((state) => state.setMessages);

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

    const websocket = useWebSocket(websocketURL, {

        onOpen: () => {
            if (!gameHasStarted) websocket.sendMessage("/startGame:" + gameId);
            setGameHasStarted(true);
        },

        onClose: () => {
            setTimeout(() => {
                websocket.sendMessage(gameId + ":/reconnect");
            }, 1000);
        },

        onMessage: (event) => {

            if (event.data.startsWith("[START_GAME]:")) {
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const me = players.slice().filter((player: Player) => player.username === user)[0];
                const opponent = players.slice().filter((player: Player) => player.username !== user)[0];
                setUpGame(me, opponent);
                return;
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const newGame: GameDistribution = JSON.parse(event.data.substring("[DISTRIBUTE_CARDS]:".length));
                distributeCards(user, newGame, gameId);
                return;
            }

            if (event.data.startsWith("[STARTING_PLAYER]:")) {
                setMemoryBarLoading(true);
                setStartingPlayer(event.data.substring("[STARTING_PLAYER]:".length));
                setShowStartingPlayer(true);
                playStartSfx();
                setTimeout(() => {
                    playDrawCardSfx();
                    setIsChatOpen(true);
                }, 3800);
                setTimeout(() => {
                    setShowStartingPlayer(false);
                    setMemoryBarLoading(false);
                    playLoadMemorybarSfx();
                }, 4500);
                return;
            }

            if (event.data.startsWith("[CHAT_MESSAGE]:")) {
                const chatMessage = event.data.substring(event.data.indexOf(":") + 1);
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
                default: {
                    getOpponentSfx(event.data);
                }
            }
        }
    });

    function sendChatMessage(message: string) {
        if (message.length > 0) {
            setMessages(user + ":" + message);
            websocket.sendMessage(`${gameId}:/chatMessage:${opponentName}:${message}`);
        }
    }

    function endAttackAnimation() {
        playAttackSfx();
        setTimeout(() => {
            setShowAttackArrow(false);
            setArrowFrom('');
            setArrowTo('');
            setAttackFromOpponent(false);
        }, 3500);
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
        for (const chunk of chunks) {
            setTimeout(() => {
                websocket.sendMessage(`${gameId}:/updateGame:${chunk}`);
            }, 10);
        }
    }

    function sendSfx(sfx: string) {
        setTimeout(() => {
            websocket.sendMessage(gameId + ":/" + sfx + ":" + opponentName);
        }, 10);
    }

    function handleDropToOpponent(from: string, to: string) {
        if (!from || !to || opponentFieldLocations.includes(from)) return;
        setArrowFrom(from);
        setArrowTo(to);
        setShowAttackArrow(true);
        websocket.sendMessage(gameId + ":/attack:" + opponentName + ":" + from + ":" + to);
        endAttackAnimation();
    }

    function handleDropToField(cardId: string, from: string, to: string) {
        if (!cardId || !from || !to) return;
        moveCard(cardId, from, to);
        sendUpdate();
        playPlaceCardSfx();
        sendSfx("playPlaceCardSfx");
    }

    const [, dropToDigi1] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi1');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi2] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi2');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi3] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi3');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi4] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi4');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi5] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi5');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi6] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi6');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi7] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi7');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi8] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi8');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi9] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi9');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi10] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDigi10');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToHand] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myHand');
            sendUpdate();
            playCardToHandSfx();
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToBreedingArea] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myBreedingArea');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToTamer] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myTamer');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDelay] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            handleDropToField(id, location, 'myDelay');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            setCardToSend({id, location});
            setDeckMoodle(true);
            setSetSecurityMoodle(false);
            setEggDeckMoodle(false);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToEggDeck] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            setCardToSend({id, location});
            setEggDeckMoodle(true);
            setDeckMoodle(false);
            setSetSecurityMoodle(false);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToSecurity] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            setCardToSend({id, location});
            setSetSecurityMoodle(true);
            setDeckMoodle(false);
            setEggDeckMoodle(false);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToTrash] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myTrash');
            sendUpdate();
            playTrashCardSfx();
            sendSfx("playTrashCardSfx");
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
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
        setSetSecurityMoodle(false);
        if (opponentTrash.length === 0) {
            setOpponentTrashMoodle(false);
        }
        if (myTrash.length === 0) {
            setTrashMoodle(false);
        }
    }, [myHand, myTrash, myDeckField, myEggDeck, myBreedingArea, myTamer, myDelay, myDigi1, myDigi2, myDigi3, myDigi4, myDigi5]);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${opponentName}`);
        startTimer();
    }

    function acceptRestart() {
        setRestartMoodle(false);
        websocket.sendMessage("/startGame:" + gameId);
    }

    function startTimer() {
        setTimerOpen(true);
        for (let i = 5; i > 0; i--) {
            setTimeout(() => {
                setTimer((timer) => timer - 1);
            }, i * 1000);
        }
    }

    return (
        <BackGround>
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

                {myReveal.length > 0 && <RevealContainer>
                    {myReveal?.map((card) =>
                        <Flip key={card.id}><Card card={card} location="myReveal"/></Flip>)}
                </RevealContainer>}
                {opponentReveal.length > 0 && <RevealContainer>
                    {opponentReveal?.map((card) =>
                        <Flip key={card.id}><Card card={card} location="opponentReveal"/></Flip>)}
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
                                <PlayerImage alt="opponent" src={profilePicture(opponentAvatar)}
                                             onClick={() => {
                                                 websocket.sendMessage(`${gameId}:/restartRequest:${opponentName}`);
                                                 notifyRequestedRestart();
                                             }}
                                />
                                <UserName>{opponentName}</UserName>
                            </PlayerContainer>

                            <OpponentDeckContainer>
                                <img alt="deck" src={deckBackOpponent} width="105px"/>
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

                            <BattleArea5 ref={isOpponentSecondRowVisible ? dropToOpponentDigi10 : dropToOpponentDigi5}>
                                {isOpponentSecondRowVisible ?
                                    opponentDigi10.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi10.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi10.length - 1 ? "opponentDigi10" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi10"}/>
                                            </Fade></CardContainer>)
                                    :
                                    opponentDigi5.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi5.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi5.length - 1 ? "opponentDigi5" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi5"}/>
                                            </Fade></CardContainer>)}
                            </BattleArea5>
                            <BattleArea4 ref={isOpponentSecondRowVisible ? dropToOpponentDigi9 : dropToOpponentDigi4}>
                                {isOpponentSecondRowVisible ?
                                    opponentDigi9.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi9.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi9.length - 1 ? "opponentDigi9" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi9"}/>
                                            </Fade></CardContainer>)
                                    :
                                    opponentDigi4.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi4.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi4.length - 1 ? "opponentDigi4" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi4"}/>
                                            </Fade></CardContainer>)}
                            </BattleArea4>
                            <BattleArea3 ref={isOpponentSecondRowVisible ? dropToOpponentDigi8 : dropToOpponentDigi3}>
                                {!isOpponentSecondRowVisible && opponentDigi3.length === 0 &&
                                    <FieldSpan>Battle Area</FieldSpan>}
                                {isOpponentSecondRowVisible ?
                                    opponentDigi8.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi8.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi8.length - 1 ? "opponentDigi8" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi8"}/>
                                            </Fade></CardContainer>)
                                    :
                                    opponentDigi3.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi3.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi3.length - 1 ? "opponentDigi3" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi3"}/>
                                            </Fade></CardContainer>)}
                            </BattleArea3>
                            <BattleArea2 ref={isOpponentSecondRowVisible ? dropToOpponentDigi7 : dropToOpponentDigi2}>
                                {isOpponentSecondRowVisible ?
                                    opponentDigi7.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi7.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi7.length - 1 ? "opponentDigi7" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi7"}/>
                                            </Fade></CardContainer>)
                                    :
                                    opponentDigi2.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi2.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi2.length - 1 ? "opponentDigi2" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi2"}/></Fade></CardContainer>)}
                            </BattleArea2>
                            <BattleArea1 ref={isOpponentSecondRowVisible ? dropToOpponentDigi6 : dropToOpponentDigi1}>
                                {isOpponentSecondRowVisible ?
                                    opponentDigi6.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi6.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi6.length - 1 ? "opponentDigi6" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi6"}/>
                                            </Fade></CardContainer>)
                                    :
                                    opponentDigi1.map((card, index) =>
                                        <CardContainer cardCount={opponentDigi1.length} key={card.id} cardIndex={index}
                                                       id={index === opponentDigi1.length - 1 ? "opponentDigi1" : ""}>
                                            <Fade direction={"down"} duration={500}>
                                                <Card card={card} location={"opponentDigi1"}/>
                                            </Fade></CardContainer>)}
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
                                    <TamerCardContainer key={card.id} cardIndex={index}>
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
                            </OpponentHandContainer>

                        </OpponentContainerMain>

                        <OpponentContainerSide>
                            <EggDeckContainer>
                                {opponentEggDeck.length !== 0 &&
                                    <div style={{
                                        width: "100%", display: "flex", fontStyle: "italic",
                                        justifyContent: "center", fontFamily: "Awsumsans, sans-serif"
                                    }}>{opponentEggDeck.length}</div>}
                                {opponentEggDeck.length !== 0 && <img alt="egg-deck" src={eggBack} width="105px"
                                                                      style={{transform: "rotate(180deg)"}}/>}
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
                                {opponentBreedingArea.map((card, index) =>
                                    <CardContainer cardCount={opponentBreedingArea.length} key={card.id}
                                                   cardIndex={index}><Fade direction={"down"} duration={500}>
                                        <Card card={card} location={"opponentBreedingArea"}/></Fade></CardContainer>)}
                                {opponentBreedingArea.length === 0 && <FieldSpan>Breeding<br/>Area</FieldSpan>}
                            </BreedingAreaContainer>

                        </OpponentContainerSide>
                    </div>

                    {memoryBarLoading ? <div style={{height: "100px"}}/> :
                        <Zoom><MemoryBar sendUpdate={sendUpdate} sendSfx={sendSfx}/></Zoom>}

                    <div style={{display: "flex"}}>
                        <MyContainerSide>
                            <EggDeckContainer ref={dropToEggDeck}>
                                {eggDeckMoodle &&
                                    <DeckMoodle sendUpdate={sendUpdate} cardToSend={cardToSend} to={"myEggDeck"}
                                                setMoodle={setEggDeckMoodle}/>}
                                {myEggDeck.length !== 0 &&
                                    <EggDeck alt="egg-deck" src={eggBack}
                                             onClick={() => {
                                                 drawCardFromEggDeck();
                                                 sendUpdate();
                                                 playDrawCardSfx();
                                                 if (myBreedingArea.length === 0) sendSfx("playPlaceCardSfx");
                                             }}/>}
                                {myEggDeck.length !== 0 &&
                                    <div style={{
                                        width: "100%", display: "flex", fontStyle: "italic",
                                        justifyContent: "center", fontFamily: "Awsumsans, sans-serif"
                                    }}>{myEggDeck.length}</div>}
                            </EggDeckContainer>

                            <SecurityStackContainer ref={dropToSecurity}>
                                {securityMoodle &&
                                    <DeckMoodle sendUpdate={sendUpdate} cardToSend={cardToSend} to={"mySecurity"}
                                                setMoodle={setSecurityContentMoodle}/>}
                                <MySecuritySpan id="mySecurity" cardCount={mySecurity.length} onClick={() => {
                                    if (opponentReveal.length === 0) moveCard(mySecurity[0].id, "mySecurity", "myReveal");
                                    sendUpdate();
                                    playSecurityRevealSfx();
                                    sendSfx("playSecurityRevealSfx");
                                }}>{mySecurity.length}</MySecuritySpan>
                                <Lottie animationData={mySecurityAnimation} loop={true} style={{width: "160px"}}/>
                                {!securityContentMoodle ?
                                    <SendButton title="Open Security Stack"
                                                style={{left: 20, top: 20, background: "none"}}
                                                onClick={() => {
                                                    setSecurityContentMoodle(true);
                                                    websocket.sendMessage(gameId + ":/openedSecurity:" + opponentName);
                                                }}
                                    >🔎</SendButton>
                                    :
                                    <SendButton title="Close and shuffle Security Stack"
                                                style={{left: 20, top: 20, background: "none"}}
                                                onClick={() => {
                                                    setSecurityContentMoodle(false);
                                                    shuffleSecurity();
                                                    sendUpdate();
                                                    playShuffleDeckSfx();
                                                    sendSfx("playShuffleDeckSfx");
                                                }}>🔄</SendButton>}
                                <MySwitchRowButton1 disabled={showAttackArrow}
                                                    onClick={() => setIsMySecondRowVisible(false)}
                                                    secondRowVisible={!isMySecondRowVisible}/>
                                <MySwitchRowButton2 disabled={showAttackArrow}
                                                    onClick={() => setIsMySecondRowVisible(true)}
                                                    secondRowVisible={isMySecondRowVisible}/>
                                {mySecondRowWarning && <MySecondRowWarning>!</MySecondRowWarning>}
                            </SecurityStackContainer>

                            <BreedingAreaContainer ref={dropToBreedingArea}>
                                {myBreedingArea.map((card, index) =>
                                    <CardContainer cardCount={myBreedingArea.length} key={card.id} cardIndex={index}>
                                        <Card card={card} location={"myBreedingArea"}/></CardContainer>)}
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
                                                setMoodle={setDeckMoodle}/>}
                                <TrashSpan style={{transform: "translateX(-14px)",}}>{myDeckField.length}</TrashSpan>
                                <Deck ref={dropToDeck} alt="deck" src={deckBack} onClick={() => {
                                    drawCardFromDeck();
                                    sendUpdate();
                                    playDrawCardSfx();
                                    sendSfx("playDrawCardSfx");
                                }}/>
                                <SendToTrashButton onClick={() => {
                                    moveCard(myDeckField[0].id, "myDeckField", "myTrash");
                                    sendUpdate();
                                    playTrashCardSfx();
                                    sendSfx("playTrashCardSfx");
                                }
                                }>
                                    ↱</SendToTrashButton>
                                <SendButton title="Send top card from your deck to Security Stack" style={{left: -115}}
                                            onClick={() => {
                                                moveCard(myDeckField[0].id, "myDeckField", "mySecurity");
                                                sendUpdate();
                                                websocket.sendMessage(gameId + ":/playDrawCardSfx:" + opponentName);
                                            }}>⛊️+1</SendButton>
                                <SendButton title="Reveal the top card of your deck" onClick={() => {
                                    moveCard(myDeckField[0].id, "myDeckField", "myReveal");
                                    sendUpdate();
                                    playRevealCardSfx();
                                    sendSfx("playRevealSfx");
                                }}
                                            disabled={opponentReveal.length > 0} style={{left: -52}}>👁️+1</SendButton>
                            </DeckContainer>

                            <TrashContainer ref={dropToTrash}>
                                {myTrash.length === 0 ? <TrashPlaceholder>Trash</TrashPlaceholder>
                                    : <TrashCardImage src={myTrash[myTrash.length - 1].image_url} alt={"myTrash"}
                                                      onClick={() => {
                                                          setTrashMoodle(!trashMoodle);
                                                          setOpponentTrashMoodle(false);
                                                      }}
                                                      title="Open your trash"/>}
                                <TrashSpan style={{transform: "translateX(12px)"}}>{myTrash.length}</TrashSpan>
                            </TrashContainer>

                            <BattleArea1 ref={isMySecondRowVisible ? dropToDigi6 : dropToDigi1}>
                                {isMySecondRowVisible ?
                                    myDigi6?.map((card, index) =>
                                        <CardContainer cardCount={myDigi6.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi6.length - 1 ? "myDigi6" : ""}>
                                            <Card card={card} location={"myDigi6"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)
                                    :
                                    myDigi1?.map((card, index) =>
                                        <CardContainer cardCount={myDigi1.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi1.length - 1 ? "myDigi1" : ""}>
                                            <Card card={card} location={"myDigi1"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)}
                            </BattleArea1>
                            <BattleArea2 ref={isMySecondRowVisible ? dropToDigi7 : dropToDigi2}>
                                {isMySecondRowVisible ?
                                    myDigi7?.map((card, index) =>
                                        <CardContainer cardCount={myDigi7.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi7.length - 1 ? "myDigi7" : ""}>
                                            <Card card={card} location={"myDigi7"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)
                                    :
                                    myDigi2?.map((card, index) =>
                                        <CardContainer cardCount={myDigi2.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi2.length - 1 ? "myDigi2" : ""}>
                                            <Card card={card} location={"myDigi2"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)}
                            </BattleArea2>
                            <BattleArea3 ref={isMySecondRowVisible ? dropToDigi8 : dropToDigi3}>
                                {!isMySecondRowVisible && myDigi3.length === 0 && <FieldSpan>Battle Area</FieldSpan>}
                                {isMySecondRowVisible ?
                                    myDigi8?.map((card, index) =>
                                        <CardContainer cardCount={myDigi8.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi8.length - 1 ? "myDigi8" : ""}>
                                            <Card card={card} location={"myDigi8"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)
                                    :
                                    myDigi3?.map((card, index) =>
                                        <CardContainer cardCount={myDigi3.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi3.length - 1 ? "myDigi3" : ""}>
                                            <Card card={card} location={"myDigi3"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)}
                            </BattleArea3>
                            <BattleArea4 ref={isMySecondRowVisible ? dropToDigi9 : dropToDigi4}>
                                {isMySecondRowVisible ?
                                    myDigi9?.map((card, index) =>
                                        <CardContainer cardCount={myDigi9.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi9.length - 1 ? "myDigi9" : ""}>
                                            <Card card={card} location={"myDigi9"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)
                                    :
                                    myDigi4?.map((card, index) =>
                                        <CardContainer cardCount={myDigi4.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi4.length - 1 ? "myDigi4" : ""}>
                                            <Card card={card} location={"myDigi4"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)}
                            </BattleArea4>
                            <BattleArea5 ref={isMySecondRowVisible ? dropToDigi10 : dropToDigi5}>
                                {isMySecondRowVisible ?
                                    myDigi10?.map((card, index) =>
                                        <CardContainer cardCount={myDigi10.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi10.length - 1 ? "myDigi10" : ""}>
                                            <Card card={card} location={"myDigi10"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)
                                    :
                                    myDigi5?.map((card, index) =>
                                        <CardContainer cardCount={myDigi5.length} key={card.id} cardIndex={index}
                                                       id={index === myDigi5.length - 1 ? "myDigi5" : ""}>
                                            <Card card={card} location={"myDigi5"} sendSfx={sendSfx}
                                                  sendUpdate={sendUpdate}/></CardContainer>)}
                            </BattleArea5>

                            <DelayAreaContainer ref={dropToDelay} style={{transform: "translateY(1px)"}}>
                                {myDelay.map((card, index) =>
                                    <DelayCardContainer key={card.id} cardIndex={index}>
                                        <Card card={card} location={"myDelay"}/></DelayCardContainer>)}
                                {myDelay.length === 0 && <FieldSpan>Delay</FieldSpan>}
                            </DelayAreaContainer>

                            <TamerAreaContainer ref={dropToTamer}>
                                {myTamer.map((card, index) =>
                                    <TamerCardContainer key={card.id} cardIndex={index}>
                                        <Card card={card} location={"myTamer"}
                                              sendSfx={sendSfx}/></TamerCardContainer>)}
                                {myTamer.length === 0 && <FieldSpan>Tamers</FieldSpan>}
                            </TamerAreaContainer>

                            <HandContainer ref={dropToHand}>
                                <HandCards cardCount={myHand.length}
                                           style={{transform: `translateX(-${myHand.length > 12 ? (myHand.length * 0.5) : 0}px)`}}>
                                    {myHand.map((card, index) =>
                                        <HandListItem cardCount={myHand.length} cardIndex={index} key={card.id}>
                                            <Card card={card} location={"myHand"}/></HandListItem>)}
                                </HandCards>
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

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: player;
  align-items: center;
  justify-content: center;
`;

const PlayerImage = styled.img`
  cursor: pointer;
  width: 160px;
  border: #0c0c0c solid 2px;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 2px #eceaea);
    border: #eceaea solid 2px;
  }
`;

const UserName = styled.span`
  font-size: 20px;
  align-self: flex-start;
  margin-left: 27px;
  font-family: 'Cousine', sans-serif;
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

const Deck = styled.img`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const EggDeck = styled(Deck)`
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
  font-style: italic;
  font-size: 35px;
  color: #cb6377;
  text-shadow: #111921 1px 1px 1px;
  left: 133px;
`;

const MySecuritySpan = styled(SecuritySpan)<{ cardCount: number }>`
  cursor: pointer;
  color: #5ba2cb;
  transition: all 0.15s ease;
  transform: translateX(${({cardCount}) => cardCount === 1 ? 4 : 0}px);

  &:hover {
    filter: drop-shadow(0 0 5px #1b82e8) saturate(1.5);
    font-size: 42px;
    color: #f9f9f9;
    transform: translate(${({cardCount}) => cardCount === 1 ? 4 : -2}px, -1px);
  }
`;

const CardContainer = styled.div<{ cardIndex: number, cardCount: number }>`
  position: absolute;
  bottom: ${({cardIndex}) => cardIndex > 5 ? ((cardIndex - 6) * 20) + 5 : (cardIndex * 20) + 5}px;
  left: ${({cardIndex, cardCount}) => cardCount > 6 ? `${cardIndex > 5 ? 50 : 5}px` : "auto"};
`;

const TamerCardContainer = styled.div<{ cardIndex: number }>`
  position: absolute;
  left: ${props => (props.cardIndex * 37) + 5}px;
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

  left: 60.5%;
  top: 27%;
  transform: translate(-50%, -50%);

  ::-webkit-scrollbar {
    visibility: hidden;
    width: 0;
  }
`;

const SecurityView = styled.div`
  background: rgba(2, 1, 1, 0.95);
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  gap: 15px;
  padding: 10px;
  width: 706px;
  height: 151px;
  overflow: hidden;
  z-index: 150;
  border-radius: 10px;
  border: 2px solid #1482dc;
  box-shadow: 2px 4px 12px rgba(33, 222, 250, 0.5);

  left: 57%;
  top: 62%;
  transform: translate(-50%, -50%);
`;

const TrashSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: center;
  font-family: Awsumsans, sans-serif;
  font-style: italic;
`;

const SendButton = styled.button`
  position: absolute;
  width: 55px;
  height: 30px;
  z-index: 10;
  padding: 0;
  border-radius: 5px;
  &:hover {
    border-color: #e8a71b;
  }
`;

const SendToTrashButton = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  font-size: 40px;
  z-index: 10;
  left: -47px;
  bottom: 48px;

  transform: rotate(-90deg);
  transition: all 0.15s ease;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(0 0 3px #e8a71b);
  }

  &:active {
    filter: drop-shadow(0 0 2px #d2157f);
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

const TrashPlaceholder = styled.div`
  width: 105px;
  height: 146px;
  border-radius: 5px;
  border: #0c0c0c solid 2px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(220, 220, 220, 0.8);
  font-family: Naston, sans-serif;
`;

const TrashCardImage = styled.img`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  filter: drop-shadow(1px 1px 2px #060e18);
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: drop-shadow(0px 0px 3px #af0c3d) brightness(1.1) saturate(1.2);
  }
`;

const RevealContainer = styled.div`
  position: absolute;
  width: 600px;
  height: 130px;
  left: 660px;
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
