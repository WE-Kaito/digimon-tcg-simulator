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

export default function PlayerSecurityStack({ wsUtils }: { wsUtils?: WSUtils }) {
    const mySecurity = useGameBoardStates((state) => state.mySecurity);
    const opponentReveal = useGameBoardStates((state) => state.opponentReveal);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);
    const shuffleSecurity = useGameBoardStates((state) => state.shuffleSecurity);

    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const setOpenedCardModal = useGameUIStates((state) => state.setOpenedCardModal);

    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);
    const playSecurityRevealSfx = useSound((state) => state.playSecurityRevealSfx);

    const isDisabled = bootStage !== BootStage.GAME_IN_PROGRESS || !getOpponentReady();

    function sendSecurityReveal() {
        if (opponentReveal.length) return;
        moveCard(mySecurity[0].id, "mySecurity", "myReveal");
        playSecurityRevealSfx();
        wsUtils?.sendMoveCard(mySecurity[0].id, "mySecurity", "myReveal");
        wsUtils?.sendSfx("playSecurityRevealSfx");
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security ➟ Reveal`);
    }

    function handleCloseSecurity() {
        setOpenedCardModal(false);
        shuffleSecurity();
        playShuffleDeckSfx();
        wsUtils?.sendUpdate?.();
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【Closed Security】`);
        wsUtils?.sendChatMessage?.(`[FIELD_UPDATE]≔【↻ Security Stack】`);
        wsUtils?.sendSfx?.("playShuffleDeckSfx");
    }

    const fontSize = useGeneralStates((state) => state.cardWidth / 2.25);

    const [isOpen, setIsOpen] = useState(false);

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

    if (openedCardModal === "mySecurity") {
        return (
            <StyledButtonDiv onClick={handleCloseSecurity}>
                <StyledCloseDetailsIcon />
            </StyledButtonDiv>
        );
    }

    return (
        <Container>
            <Tooltip
                TransitionComponent={MuiZoom}
                sx={{ width: "100%" }}
                open={mySecurity.length === 0 ? false : isOpen}
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
                                <Card key={card.id} card={card} location={"mySecurity"} style={{ width: "50px" }} />
                            </Fragment>
                        ))}
                    </div>
                }
            >
                <SecuritySpan
                    onContextMenu={(e) => !isDisabled && showSecurityStackMenu({ event: e })}
                    id={"mySecurity"}
                    style={{ fontSize, cursor: isDisabled ? "not-allowed" : undefined }}
                    className={isDisabled ? undefined : "button"}
                    onClick={() => !isDisabled && sendSecurityReveal()}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {mySecurity.length}
                </SecuritySpan>
            </Tooltip>
            <SecurityAnimationImg alt={"mySS"} src={mySecurityAnimation} className={"prevent-default-long-press"} />
        </Container>
    );
}

const Container = styled.div`
    grid-area: SS;
    height: 100%;
    width: 100%;
    z-index: 10;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SecuritySpan = styled.span`
    z-index: 5;
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
    width: 130%;
    position: absolute;
    left: 50%;
    top: 47%;
    transform: translate(-50%, -50%);
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
