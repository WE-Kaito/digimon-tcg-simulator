import { Tooltip, Zoom as MuiZoom } from "@mui/material";
import Card from "../../Card.tsx";
import mySecurityAnimation from "../../../assets/lotties/my-security-apng.png";
import { Fragment, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { BootStage } from "../../../utils/types.ts";
import { useSound } from "../../../hooks/useSound.ts";
import { WSUtils } from "../../../pages/GamePage.tsx";
import { useDndContext } from "@dnd-kit/core";
import { useLongPress } from "../../../hooks/useLongPress.ts";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";
import CloseDetailsIcon from "@mui/icons-material/SearchOffRounded";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import ShieldIcon from "@mui/icons-material/Shield";
import CloseIcon from "@mui/icons-material/Close";
import { useDroppableReactDnd } from "../../../hooks/useDroppableReactDnd.ts";
import { Button } from "../../Button.tsx";
import { convertForLog } from "../../../utils/functions.ts";

export default function PlayerSecurityStack({ wsUtils }: { wsUtils?: WSUtils }) {
    const mySecurity = useGameBoardStates((state) => state.mySecurity);
    const opponentReveal = useGameBoardStates((state) => state.opponentReveal);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const shuffleSecurity = useGameBoardStates((state) => state.shuffleSecurity);
    const cardToSend = useGameBoardStates((state) => state.cardToSend);
    const setCardToSend = useGameBoardStates((state) => state.setCardToSend);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);
    const isEffectInSecurity = mySecurity.find((card) => card.id === cardIdWithEffect) !== undefined;
    const isTargetInSecurity = mySecurity.find((card) => card.id === cardIdWithTarget) !== undefined;

    const openedCardDialog = useGameUIStates((state) => state.openedCardDialog);
    const setOpenedCardDialog = useGameUIStates((state) => state.setOpenedCardDialog);
    const showSecuritySendButtons = useGameUIStates((state) => state.showSecuritySendButtons);
    const setShowSecuritySendButtons = useGameUIStates((state) => state.setShowSecuritySendButtons);

    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);
    const playSecurityRevealSfx = useSound((state) => state.playSecurityRevealSfx);

    const isReadyToSendCard = cardToSend && showSecuritySendButtons;
    const isDisabled = bootStage !== BootStage.GAME_IN_PROGRESS;

    const { setNodeRef, isOver } = useDroppableReactDnd({ id: "mySecurity", data: { accept: ["card"] } });

    function sendSecurityReveal() {
        if (opponentReveal.length) return;
        moveCard(mySecurity[0].id, "mySecurity", "myReveal");
        playSecurityRevealSfx();
        wsUtils?.sendMoveCard(mySecurity[0].id, "mySecurity", "myReveal");
        wsUtils?.sendSfx("playSecurityRevealSfx");
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security ➟ Reveal`);
    }

    function handleCloseSecurity() {
        setOpenedCardDialog(false);
        shuffleSecurity();
        playShuffleDeckSfx();
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【Closed Security】`);
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【↻ Security Stack】`);
        wsUtils?.sendSfx?.("playShuffleDeckSfx");
    }

    function closeSendButtons() {
        setCardToSend(null);
        setShowSecuritySendButtons(false);
    }

    function sendCardToSecurityStack(topOrBottom: "Top" | "Bottom", faceUpOrDown: "up" | "down") {
        if (!cardToSend) return;
        const { card, location } = cardToSend;
        const sendFaceUp = faceUpOrDown === "up";
        moveCardToStack(topOrBottom, card.id, location, "mySecurity", faceUpOrDown);
        wsUtils?.sendMessage(
            `${wsUtils.matchInfo.gameId}:/moveCardToStack:${topOrBottom}:${card.id}:${location}:mySecurity:${faceUpOrDown}`
        );
        wsUtils?.sendChatMessage(
            `[FIELD_UPDATE]≔【${location === "myHand" && !sendFaceUp ? "❔" : card.name}】﹕${convertForLog(location)} ➟ SS ${topOrBottom}(face ${faceUpOrDown})`
        );
        closeSendButtons();
    }

    const fontSize = useGeneralStates((state) => state.cardWidth / 2.25);

    const [isOpen, setIsOpen] = useState(false);
    8;

    const { show: showSecurityStackMenu } = useContextMenu({ id: "securityStackMenu" });

    const { active } = useDndContext();
    const isDraggingFromSecurity = String(active?.id)?.includes("mySecurity");

    useEffect(() => {
        if (!isDraggingFromSecurity) setIsOpen(false); // prevents being stuck in open state after drop
    }, [isDraggingFromSecurity]);

    function onLongPress(event: React.TouchEvent<HTMLImageElement>) {
        if (!isDisabled) showSecurityStackMenu({ event });
    }

    const { handleTouchStart, handleTouchEnd } = useLongPress({ onLongPress });

    const { show: showContextMenu } = useContextMenu({ id: "dialogMenu", props: { index: -1, location: "", id: "" } });

    if (openedCardDialog === "mySecurity") {
        return (
            <StyledButtonDiv onClick={handleCloseSecurity}>
                <StyledCloseDetailsIcon />
            </StyledButtonDiv>
        );
    }

    return (
        <Container>
            {isReadyToSendCard ? (
                <div style={{ display: "flex", gap: 14, width: "85%", height: "95%" }}>
                    <StyledButtonContainer>
                        <Button onClick={() => sendCardToSecurityStack("Top", "up")}>
                            Face Up <span>Top</span>
                        </Button>
                        <Button onClick={() => sendCardToSecurityStack("Top", "down")}>
                            Face Down <span>Top</span>
                        </Button>
                        <Button onClick={() => sendCardToSecurityStack("Bottom", "up")}>
                            Face Up <span>Bot</span>
                        </Button>
                        <Button onClick={() => sendCardToSecurityStack("Bottom", "down")}>
                            Face Down <span>Bot</span>
                        </Button>
                    </StyledButtonContainer>
                    <div
                        style={{
                            width: "20%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Button
                            onClick={closeSendButtons}
                            style={{ width: "fit-content", padding: "5px 10px", filter: "hue-rotate(120deg)" }}
                        >
                            <CloseIcon />
                        </Button>
                        <SecuritySpan style={{ fontSize: fontSize * 0.8, pointerEvents: "none" }}>
                            {mySecurity.length}
                            <ShieldIcon
                                style={{
                                    fontSize: fontSize * 0.9,
                                    // transform: `translateY(${fontSize / 8}px)`,
                                    position: "absolute",
                                    left: "50%",
                                    top: "47%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: -1,
                                    opacity: 0.5,
                                    filter: "saturate(0.5) brightness(0.7) drop-shadow(0 0 3px black)",
                                }}
                            />
                        </SecuritySpan>
                        {cardToSend && (
                            <img
                                src={cardToSend.card.imgUrl}
                                alt={cardToSend.card.name}
                                style={{ height: fontSize * 1.25 }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <InteractionZoneDiv
                        ref={setNodeRef as any}
                        onContextMenu={(e) => !isDisabled && showSecurityStackMenu({ event: e })}
                        style={{ zIndex: isOver ? 10 : 1 }}
                    />
                    <Tooltip
                        TransitionComponent={MuiZoom}
                        sx={{ width: "100%" }}
                        open={(mySecurity.length === 0 ? false : isOpen) || isEffectInSecurity || isTargetInSecurity}
                        onClose={() => setIsOpen(isDraggingFromSecurity)}
                        onOpen={() => setIsOpen(!!mySecurity.length)}
                        arrow
                        placement={"top"}
                        componentsProps={getTooltipStyles(mySecurity.length)}
                        title={
                            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {mySecurity.map((card, index) => (
                                    <Fragment key={card.id + "_fragment"}>
                                        {index === 0 && (
                                            <ArrowDropUpIcon
                                                key={card.id + "_arrow"}
                                                sx={{
                                                    position: "absolute",
                                                    zIndex: 5,
                                                    fontSize: 35,
                                                    color: "#3787ff",
                                                    left: 9,
                                                    top: -21,
                                                    filter: "dropShadow(0 0 2px black)",
                                                }}
                                            />
                                        )}
                                        <Card
                                            key={card.id}
                                            card={card}
                                            location={"mySecurity"}
                                            style={{ width: "50px" }}
                                            onContextMenu={(e) => {
                                                showContextMenu({
                                                    event: e,
                                                    props: {
                                                        index,
                                                        location: "mySecurity",
                                                        id: card.id,
                                                        name: card.name,
                                                    },
                                                });
                                            }}
                                        />
                                    </Fragment>
                                ))}
                            </div>
                        }
                    >
                        <SecuritySpan
                            id={"mySecurity"}
                            onContextMenu={(e) => !isDisabled && showSecurityStackMenu({ event: e })}
                            style={{ fontSize, cursor: isDisabled ? "not-allowed" : undefined }}
                            className={isDisabled ? undefined : "button"}
                            onClick={() => !isDisabled && sendSecurityReveal()}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {isOver ? "➕" : mySecurity.length}
                        </SecuritySpan>
                    </Tooltip>
                    <SecurityAnimationImg
                        alt={"mySS"}
                        src={mySecurityAnimation}
                        className={"prevent-default-long-press"}
                        style={isOver ? { filter: "saturate(1.25) drop-shadow(0 0 2px black)" } : undefined}
                    />
                </>
            )}
        </Container>
    );
}

const Container = styled.div`
    grid-area: SS;
    height: 100%;
    width: 98%;
    z-index: 10;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
`;

const InteractionZoneDiv = styled.div`
    width: 75%;
    height: 95%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`;

const SecuritySpan = styled.span`
    z-index: 5;
    position: relative;
    font-family: Awsumsans, sans-serif;
    font-style: normal;
    font-size: 2em;
    text-shadow: #111921 1px 1px 1px;
    color: #5ba2cb;
    transition: all 0.15s ease;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;

    &:hover {
        filter: drop-shadow(0 0 5px #1b82e8) saturate(1.5);
        scale: 1.1;
        color: #f9f9f9;
    }
    @media (max-height: 500px) {
        font-size: 1.5em;
    }
`;

const SecurityAnimationImg = styled.img`
    width: 85%;
    position: absolute;
    left: 50%;
    top: 47%;
    transform: translate(-50%, -50%);
    pointer-events: none;
`;

const StyledButtonDiv = styled.div`
    grid-area: SS;
    width: 100%;
    height: 90%;
    border-radius: 5px;
    background: #0e6ac0;
    box-shadow: inset 0 0 10px 2px rgba(245, 245, 245, 0.36);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.15s ease;

    &:hover {
        background: dodgerblue;
        box-shadow: inset 0 0 6px 2px rgba(245, 245, 245, 0.5);
    }
`;

const StyledCloseDetailsIcon = styled(CloseDetailsIcon)`
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.75;
    font-size: 3em;
`;

const StyledButtonContainer = styled.div`
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    button {
        width: 100%;
        padding: 2px 2px 0 2px;
        display: flex;
        justify-content: space-between;
    }
`;

function getTooltipStyles(stackLength: number) {
    return {
        tooltip: {
            style: {
                backgroundColor: "#0c0c0c",
                borderRadius: 6,
                boxShadow: "inset 0 0 0 2px #2e74f6",
                filter: "drop-shadow(1px 2px 3px black)",
                padding: 10,
                minWidth: 280,
                maxWidth: `${stackLength <= 10 ? stackLength * 55 + 30 : 580}px`,
            },
        },
        arrow: {
            style: { color: "#2e74f6" },
        },
    };
}
