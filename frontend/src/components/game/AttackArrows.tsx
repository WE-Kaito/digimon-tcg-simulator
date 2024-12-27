import styled from "@emotion/styled";
// @ts-expect-error cannot find module 'react-arrows', installing dev dependencies didn't help
import Arrow, {DIRECTION, HEAD} from "react-arrows";

type Props = {
    fromOpponent: boolean,
    from: string,
    to: string,
    isEffect: boolean
}

export default function AttackArrows({fromOpponent, from, to, isEffect}: Props) {

        return <StyledArrow
            fromOpponent={fromOpponent}
            isEffect={isEffect}
            from={{
                direction: fromOpponent ? DIRECTION.BOTTOM : DIRECTION.TOP,
                node: () => document.getElementById(from),
                translation: [0, 0]
            }}
            to={{
                direction: fromOpponent ? DIRECTION.TOP : DIRECTION.BOTTOM,
                node: () => document.getElementById(to),
                translation: [0, 0]
            }}
            head={HEAD.NONE}/>
}

const StyledArrow = styled(Arrow)<{fromOpponent: boolean, isEffect: boolean}>`
  position: relative;
  pointer-events: none;
  stroke: ${({fromOpponent, isEffect}) => fromOpponent ? (isEffect ? "#ECAA4D" : "crimson") : (isEffect ? "aquamarine" : "#007fff")};
  fill: ${({fromOpponent, isEffect}) => fromOpponent ? (isEffect ? "#ECAA4D" : "crimson") :  (isEffect ? "aquamarine" : "#007fff")};
  filter: drop-shadow(0 0 3px ${({fromOpponent}) => fromOpponent ? "crimson" : "#007fff"});
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
