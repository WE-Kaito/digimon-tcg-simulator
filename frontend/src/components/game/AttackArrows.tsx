import styled from "@emotion/styled";
// @ts-expect-error cannot find module 'react-arrows', installing dev dependencies didn't help
import Arrow, {DIRECTION, HEAD} from "react-arrows";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";

const opponentBALocations = ["opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5", "opponentDigi6",
    "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10", "opponentDigi11", "opponentDigi12", "opponentDigi13",
    "opponentDigi14", "opponentDigi15", "opponentBreedingArea"]

export default function AttackArrows() {
    const [arrowFrom, arrowTo] = useGameBoardStates((state) => [state.arrowFrom, state.arrowTo]);
    const isEffectArrow = useGameBoardStates((state) => state.isEffectArrow);

    const isFromOpponent = opponentBALocations.includes(arrowFrom);

    if (!arrowFrom || !arrowTo) return <></>;

    return <StyledArrow isFromOpponent={isFromOpponent} isEffect={isEffectArrow}
           from={{
               direction: isFromOpponent ? DIRECTION.BOTTOM : DIRECTION.TOP,
               node: () => document.getElementById(arrowFrom),
               translation: [0, 0]
           }}
           to={{
               direction: isFromOpponent ? DIRECTION.TOP : DIRECTION.BOTTOM,
               node: () => document.getElementById(arrowTo),
               translation: [0, 0]
           }}
           head={HEAD.NONE}
           />
}

const StyledArrow = styled(Arrow)<{isFromOpponent: boolean, isEffect: boolean}>`
  position: relative;
  pointer-events: none;
  stroke: ${({isFromOpponent, isEffect}) => isFromOpponent ? (isEffect ? "#ECAA4D" : "crimson") : (isEffect ? "aquamarine" : "#007fff")};
  fill: ${({isFromOpponent, isEffect}) => isFromOpponent ? (isEffect ? "#ECAA4D" : "crimson") :  (isEffect ? "aquamarine" : "#007fff")};
  filter: drop-shadow(0 0 3px ${({isFromOpponent}) => isFromOpponent ? "crimson" : "#007fff"});
  stroke-linecap: round;
  transform: scale(0.95);
  animation: arrow-pulsate 0.8s ease infinite;

  path {
    fill: transparent;
    stroke-dasharray: ${({isEffect}) => isEffect ? 15 : 0};
    stroke-width: 10px;
  }

  .arrow__head {
    stroke-width: 10px;
  }

  @keyframes arrow-pulsate {
    0%,
    100% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.05;
    }
  }
`;
