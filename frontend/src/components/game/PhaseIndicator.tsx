import {useGame} from "../../hooks/useGame.ts";
import {Phase} from "../../utils/types.ts";
import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {useSound} from "../../hooks/useSound.ts";

type Props = {
    sendPhaseUpdate: () => void;
    sendSfx: (sfx: string) => void;
    gameHasStarted: boolean;
}

export default function PhaseIndicator({sendPhaseUpdate, sendSfx, gameHasStarted} : Props) {

    const phase = useGame(state => state.phase);
    const setPhase = useGame(state => state.setPhase);
    const isMyTurn = useGame(state => state.isMyTurn);
    const setTurn = useGame(state => state.setTurn);
    const myMemory = useGame(state => state.myMemory);

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
            sendSfx("playPassTurnSfx");
            setTurn(false);
        }
        else {
            playNextPhaseSfx();
            sendSfx("playNextPhaseSfx");
        }
        setPhase();
        sendPhaseUpdate();
    }

    useEffect(() => {
        setRenderPhase(false);
        const timer = setTimeout(() => setRenderPhase(true), 10);
        return () => clearTimeout(timer);
    }, [phase]);

    return (
        <Container onClick={handleClick} isMyTurn={isMyTurn} isMainPhase={isMainPhase} isPassTurnAllowed={isPassTurnAllowed}
                   {...(isMyTurn && isMainPhase && !isPassTurnAllowed && { title: "Please set memory before passing turn." })}>

            <StyledHr isMyTurn={isMyTurn} style={{ transform: "translateY(-12px)" }} />
            <StyledHr isMyTurn={isMyTurn} />
            <StyledHr isMyTurn={isMyTurn} style={{ transform: "translateY(12px)" }} />

            <PhaseSpan style={{opacity: renderPhase ? 1 : 0}}>{gameHasStarted ? phase : ""}</PhaseSpan>

        </Container>
);
}

const Container = styled.div<{isMyTurn: boolean, isMainPhase: boolean, isPassTurnAllowed: boolean}>`
    position: absolute;
    left: 40px;
    bottom: -13px;
    height: 61px;
    padding-top: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    transition: all 0.1s ease-out;
    cursor: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && !isPassTurnAllowed) ? "not-allowed" : "pointer" : "default"};
  
    &:hover {
      hr {
        background: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && isPassTurnAllowed) ? "linear-gradient(to right, transparent 1%, gold 8%, crimson 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #1d7dfc 8%, lightskyblue 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #a11a2a 8%, #e05f2d 25%, #d6392b 50%, #ed834e 75%, #a11a2a 92%, transparent 99%)"};
        filter: ${({isMyTurn, isMainPhase, isPassTurnAllowed}) => isMyTurn ? (isMainPhase && isPassTurnAllowed) ? "drop-shadow(0 0 3px crimson)" : "drop-shadow(0 0 3px #1464dc)" : "drop-shadow(0 0 3px crimson)"};
      }
    }
`;

const PhaseSpan = styled.span`
  width: 200px;
  height: 30px;
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

const StyledHr = styled.hr<{isMyTurn: boolean}>`
  color: transparent;
  position: absolute;
  width: 232px;
  height: 3px;
  background: ${({isMyTurn}) => isMyTurn ? "linear-gradient(to right, transparent 1%, #104893 8%, #335c91 25%, #1653a2 50%, #3263a9 75%, #1d7dfc 92%, transparent 99%)" : "linear-gradient(to right, transparent 1%, #a11a2a 8%, #e05f2d 25%, #d6392b 50%, #ed834e 75%, #a11a2a 92%, transparent 99%)"};
  filter: ${({isMyTurn}) => isMyTurn ? "drop-shadow(0 0 3px #1464dc)" : "drop-shadow(0 0 3px crimson)"};
  z-index: 0;
  border: none;
  opacity: ${({isMyTurn}) => isMyTurn ? 1 : 0.85};
`;
