import GameBackground from "../components/game/GameBackground.tsx";
import styled from "@emotion/styled";
import { IconButton, useMediaQuery } from "@mui/material";
import carbackSrc from "../assets/cardBack.jpg";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PlayerBoardSide from "../components/game/PlayerBoardSide/PlayerBoardSide.tsx";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { useContextMenu } from "react-contexify";
import SoundBar from "../components/SoundBar.tsx";
import MemoryBar from "../components/game/MemoryBar.tsx";
import useGameWebSocket from "../hooks/useGameWebSocket.ts";
import { useSound } from "../hooks/useSound.ts";
import ContextMenus from "../components/game/ContextMenus.tsx";
import OpponentBoardSide from "../components/game/OpponentBoardSide/OpponentBoardSide.tsx";
import { DndContext, MouseSensor, TouchSensor, pointerWithin, useSensor } from "@dnd-kit/core";
import useDropZone from "../hooks/useDropZone.ts";
import AttackArrows from "../components/game/AttackArrows.tsx";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { BootStage } from "../utils/types.ts";
import { SendMessage } from "react-use-websocket";
import RestartPromptModal from "../components/game/ModalDialog/RestartPromptModal.tsx";
import EndModal from "../components/game/ModalDialog/EndModal.tsx";
import TokenModal from "../components/game/ModalDialog/TokenModal.tsx";
import GameChatLog from "../components/game/GameChatLog.tsx";
import {
    Gavel as RulingsIcon,
    OpenInNew as LinkIcon,
    MobileFriendlyRounded as MobileModeOnIcon,
    SmartphoneRounded as MobileModeOffIcon,
} from "@mui/icons-material";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";
import RevealArea from "../components/game/RevealArea.tsx";
import StackModal from "../components/game/StackModal.tsx";
import DragOverlayCards from "../components/game/DragOverlayCards.tsx";
import CardModal from "../components/game/CardModal.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import { useSettingStates } from "../hooks/useSettingStates.ts";
import PhaseIndicator from "../components/game/PhaseIndicator.tsx";

const mediaQueries = [
    "(orientation: landscape) and (-webkit-min-device-pixel-ratio: 2) and (pointer: coarse)",
    "(orientation: landscape) and (min-resolution: 192dpi) and (pointer: coarse)",
    "(orientation: landscape) and (min-resolution: 2dppx) and (pointer: coarse)",
    "(max-height: 820px)",
    "(max-width: 1400px)",
].join(",");

/**
 * To be used in Game components to send messages to multiplayer opponent through WebSocket
 * It summarizes the most common messages that are sent to the opponent
 */
export type WSUtils = {
    matchInfo: { gameId: string; user: string; opponentName: string };
    sendMessage: SendMessage;
    sendPhaseUpdate: () => void;
    sendMoveCard: (cardId: string, from: string, to: string) => void;
    sendSfx: (sfx: string) => void;
    sendChatMessage: (message: string) => void;
    nextPhase: () => void;
    sendUpdate: () => void;
};

export default function GamePage() {
    const selectCard = useGeneralStates((state) => state.selectCard);
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const user = useGeneralStates((state) => state.user);

    const gameId = useGameBoardStates((state) => state.gameId);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const setBootStage = useGameBoardStates((state) => state.setBootStage);

    const playAttackSfx = useSound((state) => state.playAttackSfx);
    const playEffectAttackSfx = useSound((state) => state.playEffectAttackSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);

    const setArrowFrom = useGameBoardStates((state) => state.setArrowFrom);
    const setArrowTo = useGameBoardStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameBoardStates((state) => state.setIsEffectArrow);
    const setPhase = useGameBoardStates((state) => state.setPhase);
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);
    const setMessages = useGameBoardStates((state) => state.setMessages);

    const isMobileUi = useSettingStates((state) => state.isMobileUI);
    const setIsMobileUI = useSettingStates((state) => state.setIsMobileUI);
    const setIsStackDragMode = useGameUIStates((state) => state.setIsStackDragMode);
    const stackModal = useGameUIStates((state) => state.stackModal);
    const openedCardModal = useGameUIStates((state) => state.openedCardModal);

    const { show: showDetailsImageMenu } = useContextMenu({ id: "detailsImageMenu" });
    // const [isCameraTilted, setIsCameraTilted] = useState<boolean>(false);

    const [clearAttackAnimation, setClearAttackAnimation] = useState<(() => void) | null>(null); // to clear the previous timeRef
    const [phaseLoading, setPhaseLoading] = useState(false); // helps prevent unexpected multiple phase changes

    const timeoutRef = useRef<number | null>(null);

    // This reliably aborts and restarts attack animation whenever it is triggered
    const restartAttackAnimation = useCallback(
        (effect?: boolean) => {
            if (effect) playEffectAttackSfx();
            else playAttackSfx();

            const cancelAttackAnimation = () => {
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                setArrowFrom("");
                setArrowTo("");
                setIsEffectArrow(false);
            };

            timeoutRef.current = setTimeout(() => {
                setArrowFrom("");
                setArrowTo("");
                setIsEffectArrow(false);
            }, 3500);

            setClearAttackAnimation(() => cancelAttackAnimation);
        },
        [playAttackSfx, playEffectAttackSfx]
    );

    const { sendMessage, sendUpdate } = useGameWebSocket({
        clearAttackAnimation,
        restartAttackAnimation,
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
        if (phaseLoading) return;
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
        if (bootStage === BootStage.MULLIGAN && getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
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
    };

    // Require the mouse to move by 3 pixels before activate dragging, ensures click events are still possible
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 3,
        },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 1500,
            distance: 5,
        },
    });

    // Layout ##########################################################################################################
    const isMobile = useMediaQuery(mediaQueries);

    const iconWidth = useGeneralStates((state) => state.cardWidth * 0.45);
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const height = boardContainerRef.current ? window.outerHeight - 148 : undefined;

    useLayoutEffect(() => window.scrollTo(document.documentElement.scrollWidth - window.innerWidth, 0), []);

    return (
        <Container ref={boardContainerRef}>
            <GameBackground />
            <ContextMenus wsUtils={wsUtils} />
            <AttackArrows />
            <TokenModal wsUtils={wsUtils} />
            <EndModal />
            <RestartPromptModal wsUtils={wsUtils} />

            <DetailsContainer isMobile={isMobile} height={height}>
                <CardImg
                    src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc}
                    alt={"cardImg"}
                    onContextMenu={(e) => showDetailsImageMenu({ event: e })}
                    onClick={() => selectCard(null)}
                    {...(!selectedCard &&
                        !hoverCard && {
                            style: { pointerEvents: "none", opacity: 0.25, filter: "saturate(0.5)" },
                        })}
                />
                <CardDetails />
            </DetailsContainer>
            <DndContext
                onDragEnd={handleDragEnd}
                autoScroll={false}
                collisionDetection={pointerWithin}
                sensors={[mouseSensor, touchSensor]}
            >
                <BoardLayout height={height}>
                    <SettingsContainer>
                        <SoundBar iconFontSize={iconWidth}>
                            <a
                                href="https://world.digimoncard.com/rule/pdf/general_rules.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={"Rulings"}
                            >
                                <StyledIconButton sx={{ color: "white", position: "relative" }}>
                                    <RulingsIcon sx={{ fontSize: `${iconWidth * 0.85}px!important`, opacity: 0.8 }} />
                                    <LinkIcon
                                        sx={{
                                            color: "dodgerblue",
                                            position: "absolute",
                                            right: 0,
                                            top: 7,
                                            fontSize: `${iconWidth * 0.4}px!important`,
                                            pointerEvents: "none",
                                        }}
                                    />
                                </StyledIconButton>
                            </a>
                            <StyledIconButton
                                sx={{ color: isMobileUi ? "aquamarine" : "white", position: "relative" }}
                                onClick={() => {
                                    setIsMobileUI(!isMobileUi);
                                    setIsStackDragMode(false);
                                }}
                            >
                                {isMobileUi ? (
                                    <MobileModeOnIcon
                                        sx={{
                                            fontSize: `${iconWidth}px!important`,
                                            opacity: 0.8,
                                            transform: `translate(-${iconWidth / 10}px, -2px)`,
                                        }}
                                    />
                                ) : (
                                    <MobileModeOffIcon
                                        sx={{
                                            fontSize: `${iconWidth}px!important`,
                                            opacity: 0.8,
                                            transform: "translateY(-2px)",
                                        }}
                                    />
                                )}
                            </StyledIconButton>
                        </SoundBar>
                    </SettingsContainer>

                    <ChatAndCardDialogContainerDiv>
                        {!stackModal && !openedCardModal && <GameChatLog {...wsUtils} />}
                        {!!openedCardModal && <CardModal />}
                        {!!stackModal && <StackModal />}
                    </ChatAndCardDialogContainerDiv>

                    <RevealArea />

                    <MemoryBar wsUtils={wsUtils} />
                    <PhaseIndicator wsUtils={wsUtils} />

                    <OpponentBoardSide wsUtils={wsUtils} />
                    <PlayerBoardSide wsUtils={wsUtils} />
                </BoardLayout>

                <DragOverlayCards />
            </DndContext>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    position: relative;
    width: 100%;
    min-width: 100vw;
    height: 100%;
    min-height: 100vh;
    overflow-y: hidden;
    gap: 5px;
`;

const DetailsContainer = styled.div<{ isMobile: boolean; height?: number }>`
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    width: 350px !important;
    height: ${({ height }) => (height ? `${height}px` : "unset")};
    min-height: 100vh;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        width: 0;
        display: none;
    }
    @media (max-height: 500px) {
        min-height: unset;
        height: 100vh;
    }
`;

const CardImg = styled.img<{ isMobile?: boolean }>`
    width: ${({ isMobile }) => (isMobile ? "500px" : "100%")};
    max-width: 328px;
    border-radius: 3.5%;
    aspect-ratio: 5 / 7;
    //width: 107px; // 150 * (5/7)
    z-index: 1000;
`;

const BoardLayout = styled.div<{ height?: number; isCameraTilted?: boolean }>`
    position: relative;
    aspect-ratio: 35 / 20;
    height: ${({ height }) => (height ? `${height}px` : "auto")};

    display: grid;
    grid-template-columns: repeat(35, 1fr);
    grid-template-rows: repeat(20, 1fr);

    container-type: inline-size;
    container-name: board-layout;

    transform: ${({ isCameraTilted }) =>
        isCameraTilted ? "perspective(2000px) rotateX(35deg) rotateZ(0deg)" : "unset"};
    padding: ${({ isCameraTilted }) => (isCameraTilted ? "0 3.5vw 0 5vw" : "0")};

    @media (max-height: 500px) {
        min-height: unset;
        height: 100vh;
    }
`;

const SettingsContainer = styled.div`
    grid-column: 1 / 9;
    grid-row: 1 / 3;
    z-index: 1;
`;

const StyledIconButton = styled(IconButton)`
    width: fit-content;
    opacity: 0.7;
    display: flex;
`;

const ChatAndCardDialogContainerDiv = styled.div`
    height: 95%;
    width: 95%;
    margin: 1.5%;
    padding: 0 1% 0 1%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    position: relative;
    grid-column: 29 / 36;
    grid-row: 5 / 17;

    background: rgba(12, 21, 16, 0.1);
    border: 1px solid rgba(124, 124, 118, 0.6);
    border-radius: 1%;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.09);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));

    z-index: 20;
`;
