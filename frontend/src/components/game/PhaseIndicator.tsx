import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import {BootStage, Phase} from "../../utils/types.ts";
import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {useSound} from "../../hooks/useSound.ts";
import {WSUtils} from "../../pages/GamePage.tsx";
import useResponsiveFontSize from "../../hooks/useResponsiveFontSize.ts";

export default function PhaseIndicator({ wsUtils } : { wsUtils?: WSUtils }) {

    const phase = useGameBoardStates(state => state.phase);
    const setPhase = useGameBoardStates(state => state.setPhase);
    const isMyTurn = useGameBoardStates(state => state.isMyTurn);
    const setTurn = useGameBoardStates(state => state.setTurn);
    const myMemory = useGameBoardStates(state => state.myMemory);
    const bootStage = useGameBoardStates(state => state.bootStage);
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
        }
        else {
            playNextPhaseSfx();
            wsUtils?.sendSfx("playNextPhaseSfx");
        }
        setPhase();
        wsUtils?.sendPhaseUpdate();
    }

    useEffect(() => {
        setRenderPhase(false);
        const timer = setTimeout(() => setRenderPhase(true), 10);
        return () => clearTimeout(timer);
    }, [phase]);

    const {fontContainerRef, fontSize} = useResponsiveFontSize(12);

    return (
        <Container onClick={handleClick} ref={fontContainerRef} isMyTurn={isMyTurn} isMainPhase={isMainPhase}
                   isPassTurnAllowed={isPassTurnAllowed} gameHasStarted={gameHasStarted}
                   {...(isMyTurn && isMainPhase && !isPassTurnAllowed && { title: "Please set memory before passing turn." })}>

            <StyledHr isMyTurn={isMyTurn} gameHasStarted={gameHasStarted}/>
            <StyledHr isMyTurn={isMyTurn} gameHasStarted={gameHasStarted}/>
            <StyledHr isMyTurn={isMyTurn} gameHasStarted={gameHasStarted}/>

            <PhaseSpan style={{opacity: renderPhase ? 1 : 0, fontSize}}>{gameHasStarted ? phase : "BOOTING"}</PhaseSpan>

        </Container>
);
}

const Container = styled.div<{isMyTurn: boolean, isMainPhase: boolean, isPassTurnAllowed: boolean, gameHasStarted: boolean}>`
  grid-column: 26 / 34;
  grid-row: 7 / 9;
  position: relative;
  padding: 0 4% 0 4%;
  margin: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15%;
  z-index: 2;
  transition: all 0.1s ease-out;
  cursor: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && !isPassTurnAllowed) ? "not-allowed" : "pointer" : "default"};
  pointer-events: ${({gameHasStarted}) => gameHasStarted ? "unset" : "none"};
  
  &:hover {
    hr {
      background: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && isPassTurnAllowed) ? "linear-gradient(to right, transparent 1%, gold 8%, crimson 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #1d7dfc 8%, lightskyblue 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #a11a2a 8%, #e05f2d 25%, #d6392b 50%, #ed834e 75%, #a11a2a 92%, transparent 99%)"};
      filter: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && isPassTurnAllowed) ? "drop-shadow(0 0 3px crimson)" : "drop-shadow(0 0 3px #1464dc)" : "drop-shadow(0 0 3px crimson)"};
    }
  }
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
  font-size: 30px;
  display: inline-block;
  line-height: 1;
  z-index: 2;
  transition: all 0.15s ease-out;
  user-select: none;
`;

const StyledHr = styled.hr<{isMyTurn: boolean, gameHasStarted: boolean}>`
  margin: 0;
  color: transparent;
  width: 100%;
  height: 3px;
  background: ${({isMyTurn, gameHasStarted}) => gameHasStarted ? isMyTurn ? "linear-gradient(to right, transparent 1%, #104893 8%, #335c91 25%, #1653a2 50%, #3263a9 75%, #1d7dfc 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #a11a2a 8%, #e05f2d 25%, #d6392b 50%, #ed834e 75%, #a11a2a 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #ead15c 8%, #e8c45b 25%, #e4b85a 50%, #e0ac59 75%, #db9f57 92%, transparent 99%)"};
  filter: drop-shadow(0 0 3px ${({isMyTurn, gameHasStarted}) => gameHasStarted ? (isMyTurn ? "#1464dc" : "crimson") : "#e4b85a"});
  z-index: 0;
  border: none;
  opacity: ${({isMyTurn}) => isMyTurn ? 1 : 0.85};
`;
