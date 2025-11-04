import GameBackground from "../components/game/GameBackground.tsx";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import carbackSrc from "../assets/cardBack.jpg";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import PlayerBoardSide from "../components/game/PlayerBoardSide/PlayerBoardSide.tsx";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { useContextMenu } from "react-contexify";
import SoundBar from "../components/SoundBar.tsx";
import MemoryBar from "../components/game/MemoryBar.tsx";
import useGameWebSocket from "../hooks/useGameWebSocket.ts";
import { useSound } from "../hooks/useSound.ts";
import ContextMenus from "../components/game/ContextMenus/ContextMenus.tsx";
import OpponentBoardSide from "../components/game/OpponentBoardSide/OpponentBoardSide.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import useDropZoneReactDnd from "../hooks/useDropZoneReactDnd.ts";
import AttackArrows from "../components/game/AttackArrows.tsx";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { SendMessage } from "react-use-websocket";
import RestartPromptModal from "../components/game/ModalDialog/RestartPromptModal.tsx";
import EndModal from "../components/game/ModalDialog/EndModal.tsx";
import TokenModal from "../components/game/ModalDialog/TokenModal.tsx";
import GameChatLog from "../components/game/GameChatLog.tsx";
import { Gavel as RulingsIcon, OpenInNew as LinkIcon } from "@mui/icons-material";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";
import RevealArea from "../components/game/RevealArea.tsx";
import StackDialog from "../components/game/StackDialog.tsx";
import DragLayerCustom from "../components/game/DragLayerCustom.tsx";
import CardDialog from "../components/game/CardDialog.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import PhaseIndicator from "../components/game/PhaseIndicator.tsx";
import SettingsMenuButton from "../components/game/SettingsMenuButton.tsx";
import { DetailsView, useSettingStates } from "../hooks/useSettingStates.ts";

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
};

export default function GamePage() {
    const selectCard = useGeneralStates((state) => state.selectCard);
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const user = useGeneralStates((state) => state.user);

    const gameId = useGameBoardStates((state) => state.gameId);
    const opponentName = gameId.split("‗").filter((username) => username !== user)[0];

    const playAttackSfx = useSound((state) => state.playAttackSfx);
    const playEffectAttackSfx = useSound((state) => state.playEffectAttackSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);

    const setPhase = useGameBoardStates((state) => state.progressToNextPhase);
    const setMessages = useGameBoardStates((state) => state.setMessages);

    const setArrowFrom = useGameUIStates((state) => state.setArrowFrom);
    const setArrowTo = useGameUIStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameUIStates((state) => state.setIsEffectArrow);
    const stackDialog = useGameUIStates((state) => state.stackDialog);
    const openedCardDialog = useGameUIStates((state) => state.openedCardDialog);

    const details = useSettingStates((state) => state.details);

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

            // @ts-ignore
            timeoutRef.current = setTimeout(() => {
                setArrowFrom("");
                setArrowTo("");
                setIsEffectArrow(false);
            }, 3500);

            setClearAttackAnimation(() => cancelAttackAnimation);
        },
        [playAttackSfx, playEffectAttackSfx]
    );

    const { sendMessage } = useGameWebSocket({
        clearAttackAnimation,
        restartAttackAnimation,
    });

    const createDropHandler = useDropZoneReactDnd({
        sendMessage,
        restartAttackAnimation,
        clearAttackAnimation,
    });

    // Handle react-dnd drop events
    useLayoutEffect(() => {
        const handleReactDndDrop = (event: CustomEvent) => {
            const { item, targetId } = event.detail;
            const isBottom = targetId.includes("_bottom");
            const actualTargetId = isBottom ? targetId.replace("_bottom", "") : targetId;

            const dropHandler = createDropHandler(actualTargetId, { bottom: isBottom });
            if (dropHandler?.drop) {
                dropHandler.drop(item);
            }
        };

        window.addEventListener("reactDndDrop", handleReactDndDrop as EventListener);
        return () => window.removeEventListener("reactDndDrop", handleReactDndDrop as EventListener);
    }, [createDropHandler]);

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
    };

    // Layout ##########################################################################################################
    const iconWidth = useGeneralStates((state) => state.cardWidth * 0.45);
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const height = boardContainerRef.current ? Math.max(window.outerHeight - 148, 800) : undefined;

    useLayoutEffect(() => window.scrollTo(document.documentElement.scrollWidth - window.innerWidth, 0), []);

    // Determine backend based on touch capability
    const backend = "ontouchstart" in window ? TouchBackend : HTML5Backend;

    const gameContent = (
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
                    <SettingsMenuButton iconFontSize={`${iconWidth}px!important`} />
                </SoundBar>
            </SettingsContainer>

            <ChatAndCardDialogContainerDiv>
                {!stackDialog && !openedCardDialog && <GameChatLog {...wsUtils} />}
                {!!openedCardDialog && <CardDialog />}
                {!!stackDialog && <StackDialog />}
            </ChatAndCardDialogContainerDiv>

            <RevealArea />

            <MemoryBar wsUtils={wsUtils} />
            <PhaseIndicator wsUtils={wsUtils} />

            <OpponentBoardSide wsUtils={wsUtils} />
            <PlayerBoardSide wsUtils={wsUtils} />
        </BoardLayout>
    );

    return (
        <Container ref={boardContainerRef}>
            <GameBackground />
            <ContextMenus wsUtils={wsUtils} />
            <AttackArrows />
            <TokenModal wsUtils={wsUtils} />
            <EndModal />
            <RestartPromptModal wsUtils={wsUtils} />

            <DetailsContainer height={height} style={{ minHeight: window.innerHeight }}>
                {details !== DetailsView.NO_IMAGE && (
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
                )}
                {details === DetailsView.NO_IMAGE && <div style={{ height: "10px" }} />}
                <CardDetails />
            </DetailsContainer>

            <DndProvider backend={backend}>
                {gameContent}
                <DragLayerCustom />
            </DndProvider>
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

const DetailsContainer = styled.div<{ height?: number }>`
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    width: 350px !important;
    max-width: 350px;
    height: ${({ height }) => (height ? `${height}px` : "unset")};
    max-height: ${({ height }) => (height ? `${height}px` : "unset")};
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
`;

const CardImg = styled.img`
    width: calc(100% - 10px);
    border-radius: 3.5%;
    aspect-ratio: 5 / 7;
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

    @supports (-moz-appearance: none) {
        height: ${({ height }) => (height ? `${height - 8}px` : "auto")};
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
