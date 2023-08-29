import styled from "@emotion/styled";
// @ts-ignore
import Arrow, {DIRECTION, HEAD} from "react-arrows";

type Props = {
    fromOpponent: boolean,
    from: string,
    to: string
}

export default function AttackArrows({fromOpponent, from, to}: Props) {

        return <StyledArrow
            fromOpponent={fromOpponent}
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

const StyledArrow = styled(Arrow)<{fromOpponent: boolean}>`
  position: relative;
  pointer-events: none;
  stroke: ${({fromOpponent}) => fromOpponent ? "crimson" : "#007fff"};
  fill: ${({fromOpponent}) => fromOpponent ? "crimson" : "#007fff"};
  filter: drop-shadow(0 0 3px ${({fromOpponent}) => fromOpponent ? "crimson" : "#007fff"});
  stroke-linecap: round;
  transform: scale(0.95);
  animation: arrow-pulsate 0.8s ease infinite;

  path {
    fill: transparent;
    stroke-dasharray: 0;
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
