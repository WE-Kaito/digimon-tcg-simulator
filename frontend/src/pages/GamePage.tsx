import GameBackground from "../components/game/GameBackground.tsx";
import styled from "@emotion/styled";
import {useMediaQuery} from "@mui/material";
import carbackSrc from "../assets/cardBack.jpg";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import PlayerBoardSide from "../components/game/PlayerBoardSide/PlayerBoardSide.tsx";
import {useStore} from "../hooks/useStore.ts";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import {useContextMenu} from "react-contexify";
import SoundBar from "../components/SoundBar.tsx";
import MemoryBar from "../components/game/MemoryBar.tsx";
import PhaseIndicator from "../components/game/PhaseIndicator.tsx";
import useGameWebSocket from "../hooks/useGameWebSocket.ts";
import {useSound} from "../hooks/useSound.ts";
import ContextMenus from "../components/game/ContextMenus.tsx";
import RevealArea from "../components/game/RevealArea.tsx";
import OpponentBoardSide from "../components/game/OpponentBoardSide/OpponentBoardSide.tsx";
import {DndContext, MouseSensor, TouchSensor, pointerWithin, useSensor} from "@dnd-kit/core";
import useDropZone from "../hooks/useDropZone.ts";
import AttackArrows from "../components/game/AttackArrows.tsx";
import {useGame} from "../hooks/useGame.ts";
import {BootStage} from "../utils/types.ts";
import {SendMessage} from "react-use-websocket";
import CardModal from "../components/game/CardModal.tsx";
import StackModal from "../components/game/StackModal.tsx";

const mediaQueries = [
    '(orientation: landscape) and (-webkit-min-device-pixel-ratio: 2) and (pointer: coarse)',
    '(orientation: landscape) and (min-resolution: 192dpi) and (pointer: coarse)',
    '(orientation: landscape) and (min-resolution: 2dppx) and (pointer: coarse)',
    '(max-height: 820px)',
    '(max-width: 1400px)'
].join(',');

/**
 * To be used in Game components to send messages to multiplayer opponent through WebSocket
 * It summarizes the most common messages that are sent to the opponent
 */
export type WSUtils = {
    matchInfo: { gameId: string, user: string, opponentName: string };
    sendMessage: SendMessage;
    sendPhaseUpdate: () => void;
    sendMoveCard: (cardId: string, from: string, to: string) => void;
    sendSfx: (sfx: string) => void;
    sendChatMessage: (message: string) => void;
    nextPhase: () => void;
    sendUpdate: () => void;
}

export default function GamePage() {
    const selectCard = useStore((state) => state.selectCard);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const user = useStore((state) => state.user);
    const gameId = useGame(state => state.gameId);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];
    const [bootStage, setBootStage] = useGame((state) => [state.bootStage, state.setBootStage]);

    const [playAttackSfx, playEffectAttackSfx, playNextPhaseSfx] = useSound((state) => [
        state.playAttackSfx,
        state.playEffectAttackSfx,
        state.playNextPhaseSfx
    ]);

    const [setArrowFrom, setArrowTo, setIsEffectArrow, setPhase, getOpponentReady, setMessages] = useGame((state) => [
        state.setArrowFrom,
        state.setArrowTo,
        state.setIsEffectArrow,
        state.setPhase,
        state.getOpponentReady,
        state.setMessages,
        state.openedCardModal
    ]);

    const {show: showDetailsImageMenu} = useContextMenu({id: "detailsImageMenu"});

    // TODO: reevaluate all the states below
    const [endScreen, setEndScreen] = useState<boolean>(false);
    const [endScreenMessage, setEndScreenMessage] = useState<string>("");
    const [restartOrder, setRestartOrder] = useState<"second" | "first">("second");
    const [restartMoodle, setRestartMoodle] = useState<boolean>(false); // see below
    const [isRematch, setIsRematch] = useState<boolean>(false);

    const [clearAttackAnimation, setClearAttackAnimation] = useState<(() => void) | null>(null); // to clear the previous timeRef
    const [phaseLoading, setPhaseLoading] = useState(false); // helps prevent unexpected multiple phase changes

    const timeoutRef = useRef<number | null>(null);

    // This reliably aborts and restarts attack animation whenever it is triggered
    const restartAttackAnimation = useCallback((effect?: boolean) => {
        if (effect) playEffectAttackSfx();
        else playAttackSfx();

        const cancelAttackAnimation = () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            setArrowFrom('');
            setArrowTo('');
            setIsEffectArrow(false);
        };

        timeoutRef.current = setTimeout(() => {
            setArrowFrom('');
            setArrowTo('');
            setIsEffectArrow(false);
        }, 3500);

        setClearAttackAnimation(() => cancelAttackAnimation);
    }, [playAttackSfx, playEffectAttackSfx]);

    const {sendMessage, sendUpdate} = useGameWebSocket({
        isRematch,
        setIsRematch,
        clearAttackAnimation,
        restartAttackAnimation,
        setEndScreen,
        setEndScreenMessage,
        setRestartOrder,
        setRestartMoodle
    });

    const handleDragEnd = useDropZone({
        sendMessage,
        restartAttackAnimation,
        clearAttackAnimation,
    });

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

    function sendMoveCard(cardId: string, from: string, to: string) {
        sendMessage(`${gameId}:/moveCard:${opponentName}:${cardId}:${from}:${to}`);
        if ((bootStage === BootStage.MULLIGAN) && getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
    }

    function sendChatMessage(message: string) {
        if (!message.length) return;
        setMessages(user + "﹕" + message);
        sendMessage(`${gameId}:/chatMessage:${opponentName}:${message}`);
    }

    function sendSfx(sfx: string) {
        const timeout = setTimeout(() => sendMessage(`${gameId}:/${sfx}:${opponentName}`), 10);
        return () => clearTimeout(timeout);
    }

    const wsUtils: WSUtils = {
        matchInfo: { gameId, user, opponentName },
        sendMessage,
        sendMoveCard,
        sendChatMessage,
        sendSfx,
        sendPhaseUpdate,
        nextPhase,
        sendUpdate,
    }

    // Require the mouse to move by 3 pixels before activate dragging, ensures click events are still possible
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 3,
        },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            tolerance: 10,
        },
    });

    // Layout ##########################################################################################################
    const isMobile = useMediaQuery(mediaQueries);
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const setCardWidth = useStore((state) => state.setCardWidth);
    const boardLayoutRef = useRef<HTMLDivElement>(null);
    const [boardMaxWidth, setBoardMaxWidth] = useState('unset');

    function handleResize() {
        const container = boardLayoutRef.current;
        if (container) {
            const { clientHeight: height, clientWidth: width } = container;
            setBoardMaxWidth(width > height * (19 / 9) ? `${height * (19 / 9)}px` : 'unset');
            setCardWidth(width / 19);
        }
    }

    // TODO: make resizing more consistent
    useLayoutEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useLayoutEffect(() => {
        handleResize();
        boardLayoutRef.current?.scrollTo(boardLayoutRef.current?.scrollWidth / 3, 0)
    }, [isMobile]);
    useEffect(() => window.scrollTo(0, 0), [isPortrait]);
    // #################################################################################################################

    return (
        <>
            <GameBackground/>
            <ContextMenus wsUtils={wsUtils}/>
            <AttackArrows/>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", maxHeight: "100vh"}}>
                {!isMobile && <DetailsContainer  isMobile={isMobile}>
                    <CardImg src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc} alt={"cardImg"}
                             onContextMenu={(e) => showDetailsImageMenu({event: e})}
                             onClick={() => selectCard(null)}
                             {...((!selectedCard && !hoverCard) && {
                                 style: { pointerEvents: "none", opacity: 0.25, filter: "saturate(0.5)" }
                             })}
                    />
                    <CardDetails/>
                </DetailsContainer>}
                <Container isMobile={isMobile} style={{ maxHeight: isMobile ? "unset" : "100%" }}>
                    <TopStack isMobile={isMobile}>
                        <div style={{ background: "darkolivegreen", width: 500, justifySelf: "flex-start", alignSelf: isMobile ? "unset" : "flex-start", maxWidth: "100vw", height: 80 }}>Nameplate ME</div>
                        <div style={{background: "darkolivegreen", width: 500, height: 80, maxWidth: "100vw" }}>Nameplate Opponent</div>
                        {isMobile && <SettingsContainer>
                            <SoundBar/>
                        </SettingsContainer>}
                    </TopStack>

                    <BoardContainer isMobile={isMobile}>
                        <DndContext onDragEnd={handleDragEnd} autoScroll={false} collisionDetection={pointerWithin}
                                    sensors={[mouseSensor, touchSensor]}>
                            <BoardLayout isMobile={isMobile} ref={boardLayoutRef} maxWidth={boardMaxWidth}>
                                <RevealArea />
                                <StackModal />
                                <CardModal wsUtils={wsUtils} />
                                <MemoryBar wsUtils={wsUtils} />
                                <PhaseIndicator wsUtils={wsUtils} />
                                <OpponentBoardSide wsUtils={wsUtils} />
                                <PlayerBoardSide wsUtils={wsUtils} />
                            </BoardLayout>
                        </DndContext>
                    </BoardContainer>

                    {isMobile && <DetailsContainer  isMobile={isMobile}>
                        <CardImg src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc} alt={"cardImg"}
                                 onContextMenu={(e) => showDetailsImageMenu({event: e})}
                                 onClick={() => selectCard(null)}
                                 {...((!selectedCard && !hoverCard) && {
                                     style: { pointerEvents: "none", opacity: 0.25, filter: "saturate(0.5)" }
                                 })}
                        />
                        <CardDetails isMobile={isMobile}/>
                    </DetailsContainer>}

                    <BottomStack isMobile={isMobile}>
                        {!isMobile && <SettingsContainer>
                            <SoundBar/>
                        </SettingsContainer>}
                        <LogContainer isMobile={isMobile}>Log</LogContainer>
                        <ChatContainer isMobile={isMobile}>Chat</ChatContainer>
                    </BottomStack>
                </Container>
            </div>
        </>
    );
}

const Container = styled.div<{ isMobile: boolean }>`
  width: ${({isMobile}) => isMobile ? "100vw" : "calc(100vw - 400px)"};
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  position: relative;
`;

const TopStack = styled.div<{ isMobile: boolean }>`
  background: rgba(0,0,0,0.2);
  order: ${({isMobile}) => isMobile ? 4 : 1};
  display: flex;
  flex-direction: ${({isMobile}) => isMobile ? "column" : "row"};
  width: 100%;
  justify-content: ${({isMobile}) => isMobile ? "center" : "space-between"};
  align-items: ${({isMobile}) => isMobile ? "center" : "unset"};
`;

const BottomStack = styled.div<{ isMobile: boolean }>`
  background: rgba(0,0,0,0.2);
  order: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  height: ${({isMobile}) => isMobile ? "fit-content" : "150px"};
  @media (max-width: 1000px) {
    justify-content: center;
  }
;`

const DetailsContainer = styled.div<{ isMobile: boolean }>`
  background: rgba(0,0,0,0.2);
  display: flex;
  width: ${({isMobile}) => isMobile ? "100%" : "400px"};
  max-height: ${({isMobile}) => isMobile ? "fit-content" : "100vh"};
  flex-wrap: ${({isMobile}) => isMobile ? "wrap" : "unset"};
  flex-direction: ${({isMobile}) => isMobile ? "row" : "column"};
  justify-content: ${({isMobile}) => isMobile ? "space-evenly" : "flex-start"};
  align-items: flex-start;
  order: ${({isMobile}) => isMobile ? 2 : "unset"};
  gap: 5px;
  padding-top: 5px;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    display: none;
  }
`;

const CardImg = styled.img`
  width: 100%;
  max-width: 400px;
  max-height: 100%;
  border-radius: 3.5%;
  aspect-ratio: 5 / 7;
  //width: 107px; // 150 * (5/7)
  z-index: 1000;
`;

const BoardContainer = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 1 : 2};
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
  width: ${({isMobile}) => isMobile ? "unset" : "calc(100vw - 400px)"}; // 400px = Details width, may change
  height: ${({isMobile}) => isMobile ? "fit-content" : "calc(100vh - 230px)"};
  max-height: ${({isMobile}) => isMobile ? "unset" : "calc(100vh - 230px)"};
  
  container-type: inline-size;
  container-name: board-container;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
  
  @media (max-width: 1400px) {
    display: block;
    border-radius: 0;
    scrollbar-width: thin;
  }
  @media (max-height: 499px) {
    min-height: 100vh;
    max-height: 100vh;
  }
`;

const BoardLayout = styled.div<{ isMobile: boolean, maxWidth: string }>`
  position: relative;
  aspect-ratio: 19 / 9;
  width: ${({isMobile}) => isMobile ? "unset" : "100%"};
  max-width: ${({maxWidth}) => maxWidth};
  min-height: ${({isMobile}) => isMobile ? "450px" : "unset"};
  max-height: 100%;
  
  border-radius: 15px;
  padding: 5px;
  
  display: grid;
  grid-template-columns: repeat(35, 1fr);
  grid-template-rows: repeat(14, 1fr);

  container-type: inline-size;
  container-name: board-layout;
  // maybe as "change camera" button:
  //transform: perspective(2000px) rotateX(35deg) rotateZ(0deg);
  //padding: 0 5vw 0 3.5vw;
  @container board-container (max-width: 900px) {
    width: unset;
    height: 100%;
    border-radius: unset;
  }
  @media (max-height: 499px) {
    min-height: 100vh;
    max-height: 100vh;
  }
`;

const SettingsContainer = styled.div`
  height: fit-content;
  max-height: 100%;
  width: 320px;
`;

const ChatContainer = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 2 : 1};
  background: darkgoldenrod;
  width: 100%;
  max-width: 600px;
  height: ${({isMobile}) => isMobile ? "200px" : "150px"};
  contain: size;
`;

const LogContainer = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 1 : 2};
  background: darkorchid;
  width: 100%;
  max-width: 400px;
  height: ${({isMobile}) => isMobile ? "200px" : "150px"};
  @media (max-width: 1000px) {
    max-width: 600px;
  }
`;
