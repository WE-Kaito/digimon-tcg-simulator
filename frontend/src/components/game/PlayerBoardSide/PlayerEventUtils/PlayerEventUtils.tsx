import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import { BootStage } from "../../../../utils/types.ts";
import { WSUtils } from "../../../../pages/GamePage.tsx";
import PlayerAttackResolve from "./PlayerAttackResolve.tsx";
import Lottie from "lottie-react";
import firstAnimation from "../../../../assets/lotties/net-ball.json";
import EmoteIcon from "@mui/icons-material/TagFacesRounded";
import SadFaceIcon from "@mui/icons-material/SentimentVeryDissatisfiedTwoTone";
import WaveIcon from "@mui/icons-material/WavingHandTwoTone";
import WaitIcon from "@mui/icons-material/PanToolTwoTone";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAltTwoTone";
import { useGeneralStates } from "../../../../hooks/useGeneralStates.ts";
import { useState } from "react";
import { Emote, useGameUIStates } from "../../../../hooks/useGameUIStates.ts";
import EmoteRender from "../../EmoteRender.tsx";

export default function PlayerEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const startingPlayer = useGameBoardStates((state) => state.startingPlayer);
    const isOpponentOnline = useGameBoardStates((state) => state.isOpponentOnline);
    const iconWidth = useGeneralStates((state) => state.cardWidth * 0.45);
    const myEmote = useGameUIStates((state) => state.myEmote);
    const setMyEmote = useGameUIStates((state) => state.setMyEmote);

    const isFirst = startingPlayer === wsUtils?.matchInfo.user;

    const [hasChildren, setHasChildren] = useState(false);

    const [emotesOpen, setEmotesOpen] = useState(false);

    function handleSendemote(emote: Emote) {
        setMyEmote(emote);
        setEmotesOpen(false);
        wsUtils?.sendMessage(`${wsUtils?.matchInfo.gameId}:/emote:${wsUtils?.matchInfo.opponentName}:${emote}`);
    }

    return (
        <>
            <Container
                ref={(e) => {
                    const raf = requestAnimationFrame(() => setHasChildren((e?.children?.length ?? 0) > 0));
                    return () => cancelAnimationFrame(raf);
                }}
                hasChildren={hasChildren}
            >
                {isOpponentOnline && !myEmote && (
                    <>
                        {emotesOpen ? (
                            <EmoteButtonContainer>
                                <WaveIcon
                                    className={"button"}
                                    sx={{ fontSize: iconWidth }}
                                    onClick={() => handleSendemote(Emote.HELLO)}
                                />
                                <ThumbUpIcon
                                    className={"button"}
                                    sx={{ fontSize: iconWidth }}
                                    onClick={() => handleSendemote(Emote.GOOD)}
                                />
                                <WaitIcon
                                    className={"button"}
                                    sx={{ fontSize: iconWidth }}
                                    onClick={() => handleSendemote(Emote.WAIT)}
                                />
                                <SadFaceIcon
                                    className={"button"}
                                    sx={{ fontSize: iconWidth }}
                                    onClick={() => handleSendemote(Emote.BAFFLED)}
                                />
                            </EmoteButtonContainer>
                        ) : (
                            <>
                                {bootStage === BootStage.SHOW_STARTING_PLAYER && (
                                    <Lottie
                                        animationData={firstAnimation}
                                        style={{ transform: "translateY(-20%)" }}
                                        autoplay={isFirst}
                                        initialSegment={[0, 70]}
                                        loop={false}
                                    />
                                )}
                                <Mulligan wsUtils={wsUtils} fontSize={iconWidth} />
                                <PlayerAttackResolve wsUtils={wsUtils} fontSize={iconWidth} />
                                <UnsuspendAllButton wsUtils={wsUtils} fontSize={iconWidth} />
                            </>
                        )}
                    </>
                )}
                {myEmote && <EmoteRender emote={myEmote} />}
            </Container>
            <PanelButton
                disabled={!!myEmote}
                className={"button"}
                onClick={() => setEmotesOpen(!emotesOpen)}
                style={{ gridArea: "emote", transform: `translate(-4px, 5px)` }}
            >
                <EmoteIcon className={"button"} sx={{ fontSize: iconWidth * 0.8, color: "lightcyan", opacity: 0.75 }} />
            </PanelButton>
        </>
    );
}

const Container = styled.div<{ hasChildren: boolean }>`
    grid-area: event-utils;
    height: 95%;
    width: 99%;
    margin: 2.5% 0 2.5% 0;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    background: linear-gradient(
        20deg,
        rgba(54, 93, 131, 0.32) 0%,
        rgba(48, 78, 112, 0.32) 70%,
        rgba(24, 46, 61, 0.32) 100%
    );
    box-shadow: inset 2px 3px 10px 3px rgba(71, 161, 196, 0.25);
    filter: drop-shadow(0 0 2px rgba(5, 5, 5, 0.5));
    animation: ${({ hasChildren }) => (hasChildren ? "pulse 1.5s infinite" : "none")};

    &&:before {
        content: "";
        position: absolute;
        top: 5%;
        left: 2.5%;
        width: 95%;
        height: 90%;
        border-radius: 5px;
        background: linear-gradient(20deg, rgb(24, 24, 24) 0%, rgb(10, 10, 10) 70%, rgb(0, 0, 0) 100%);
        z-index: -1;
        box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
    }

    @keyframes pulse {
        0% {
            filter: drop-shadow(0 0 1px rgba(5, 5, 5, 0.5));
            box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
        }
        20% {
            filter: drop-shadow(0 0 2px rgba(187, 215, 116, 0.8));
            box-shadow: inset 0 0 3px 1px rgba(105, 255, 215, 0.25);
        }
        55% {
            filter: drop-shadow(0 0 2px rgb(255, 206, 103));
            box-shadow: inset 0 0 4px 2px rgba(105, 255, 215, 0.35);
        }
        80% {
            filter: drop-shadow(0 0 2px rgba(187, 215, 116, 0.8));
            box-shadow: inset 0 0 3px 1px rgba(105, 255, 215, 0.25);
        }
        100% {
            filter: drop-shadow(0 0 1px rgba(5, 5, 5, 0.5));
            box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
        }
    }
`;

const PanelButton = styled.div<{ disabled?: boolean }>`
    width: 100%;
    height: 80%;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-left: none;
    border-radius: 0 3px 3px 0;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5)) ${({ disabled }) => (disabled ? "grayscale(1)" : "none")};
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};

    &:hover {
        background: rgba(26, 179, 201, 0.35);
    }
`;

const EmoteButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    svg {
        &:hover {
            filter: drop-shadow(0 0 2px rgba(15, 130, 201, 0.5));
        }
    }
`;
