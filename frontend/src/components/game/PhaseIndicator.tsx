import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { BootStage, Phase } from "../../utils/types.ts";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useSound } from "../../hooks/useSound.ts";
import { WSUtils } from "../../pages/GamePage.tsx";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function PhaseIndicator({ wsUtils }: { wsUtils?: WSUtils }) {
    const phase = useGameBoardStates((state) => state.phase);
    const setPhase = useGameBoardStates((state) => state.progressToNextPhase);
    const isMyTurn = useGameBoardStates((state) => state.getIsMyTurn());
    const setTurn = useGameBoardStates((state) => state.setTurn);
    const myMemory = useGameBoardStates((state) => state.myMemory);
    const areCardsSuspended = useGameBoardStates((state) => state.areCardsSuspended);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const gameHasStarted = bootStage === BootStage.GAME_IN_PROGRESS;

    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playPassTurnSfx = useSound((state) => state.playPassTurnSfx);

    const [renderPhase, setRenderPhase] = useState(true);

    const isMainPhase = phase === Phase.MAIN;
    const isPassTurnAllowed = myMemory < 0;

    function handleClick() {
        if (!isMyTurn || !gameHasStarted) return;
        if (isMainPhase) {
            if (!isPassTurnAllowed) return;
            playPassTurnSfx();
            setTurn(false);
            wsUtils?.sendSfx("playPassTurnSfx");
        } else {
            playNextPhaseSfx();
            wsUtils?.sendSfx("playNextPhaseSfx");
        }
        setPhase();
        wsUtils?.sendPhaseUpdate();
    }

    useEffect(() => {
        if (isMyTurn && phase === Phase.UNSUSPEND && !areCardsSuspended()) wsUtils?.nextPhase();
    }, [phase]);

    useEffect(() => {
        setRenderPhase(false);
        const timer = setTimeout(() => setRenderPhase(true), 10);
        return () => clearTimeout(timer);
    }, [phase]);

    const fontSize = useGeneralStates((state) => state.cardWidth / 4);

    return (
        <Container
            onClick={handleClick}
            isMyTurn={isMyTurn}
            isMainPhase={isMainPhase}
            isPassTurnAllowed={isPassTurnAllowed}
            gameHasStarted={gameHasStarted}
            {...(isMyTurn && isMainPhase && !isPassTurnAllowed && { title: "Please set memory before passing turn." })}
        >
            <PhaseSpan style={{ opacity: renderPhase ? 1 : 0, fontSize }}>
                {gameHasStarted ? phase : "BOOTING"}
            </PhaseSpan>
        </Container>
    );
}

const Container = styled.div<{
    isMyTurn: boolean;
    isMainPhase: boolean;
    isPassTurnAllowed: boolean;
    gameHasStarted: boolean;
}>`
    grid-area: phase;
    grid-column: 1 / 5;
    grid-row: 10 / 12;
    position: relative;
    margin: 10% 5% 10% 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15%;
    z-index: 20;
    transition: all 0.15s ease-in;
    cursor: ${({ isMyTurn, isMainPhase, isPassTurnAllowed }) =>
        isMyTurn ? (isMainPhase && !isPassTurnAllowed ? "not-allowed" : "pointer") : undefined};
    pointer-events: ${({ gameHasStarted }) => (gameHasStarted ? "unset" : "none")};

    border: 2px solid ${({ gameHasStarted, isMyTurn }) => getBorderColor(gameHasStarted, isMyTurn)};
    color: ghostwhite;

    background: rgba(0, 0, 0, 0.6);
    border-radius: 9px;

    filter: drop-shadow(0 0 2px ${({ gameHasStarted, isMyTurn }) => getDropShadowColor(gameHasStarted, isMyTurn)});
    box-shadow: ${({ gameHasStarted, isMyTurn }) => getBoxShadow(gameHasStarted, isMyTurn)};

    ${({ gameHasStarted, isMyTurn }) =>
        gameHasStarted &&
        isMyTurn &&
        `
      &:hover {
        filter: brightness(1.2) contrast(1.2) drop-shadow(rgba(29, 159, 221, 0.6));
        border: rgba(29, 159, 221, 0.4);
        box-shadow: inset 0 0 12px 2px rgb(29, 159, 221);
      }

      &:active {
        filter: brightness(1.2) contrast(1.2) drop-shadow(rgba(29, 159, 221, 0.6));
        border: rgba(29, 159, 221, 0.4);
        box-shadow: inset 0 0 8px 3px rgb(29, 159, 221);
        background: rgba(6, 18, 33, 0.7);
      }
    `}
`;

const PhaseSpan = styled.span`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -43%);
    color: ghostwhite;
    text-shadow: 0 0 3px black;
    filter: drop-shadow(0 0 4px black);
    font-family: "Awsumsans", sans-serif;
    display: inline-block;
    line-height: 1;
    z-index: 2;
    transition: all 0.15s ease-out;
    user-select: none;
`;

function getBoxShadow(gameHasStarted: boolean, isMyTurn: boolean) {
    if (!gameHasStarted) return "inset 0 0 12px 2px " + "rgb(252,241,49)";
    if (isMyTurn) return "inset 1px 2px 10px 1px " + "rgb(29, 159, 221)";
    else return "inset 0 0 12px 2px " + "rgba(243,58,96,0.7)";
}

function getDropShadowColor(gameHasStarted: boolean, isMyTurn: boolean) {
    if (!gameHasStarted) return "rgba(255, 247, 84, 0.35)";
    if (isMyTurn) return "rgba(29, 159, 221, 0.6)";
    else return "rgba(255,81,118,0.6)";
}

function getBorderColor(gameHasStarted: boolean, isMyTurn: boolean) {
    if (!gameHasStarted) return "rgba(241,255,41,0.63)";
    if (isMyTurn) return "rgba(29, 159, 221, 0.4)";
    else return "rgba(255, 114, 135, 0.6)";
}
