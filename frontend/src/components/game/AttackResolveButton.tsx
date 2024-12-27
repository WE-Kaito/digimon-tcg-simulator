import styled from "@emotion/styled";
import {AttackPhase} from "../../utils/types.ts";

type Props = {
    resolveAttack?: () => void;
    myAttackPhase?: false | AttackPhase;
    opponentAttackPhase?: false | AttackPhase;
}

export default function AttackResolveButton({ resolveAttack, myAttackPhase, opponentAttackPhase } : Props) {

    const isDisabled = (opponentAttackPhase && opponentAttackPhase !== AttackPhase.COUNTER_BLOCK) || (myAttackPhase && myAttackPhase === AttackPhase.COUNTER_BLOCK);

    return (
        <div style={{position: "absolute", left: 25, top: opponentAttackPhase ? 125 : 280, width: "fit-content"}}>
            <StyledButton opponentAttack={myAttackPhase === AttackPhase.COUNTER_BLOCK || (!!opponentAttackPhase && opponentAttackPhase !== AttackPhase.COUNTER_BLOCK)}
                          style={{pointerEvents: isDisabled ? "none" : "unset"}} onClick={resolveAttack}>
                {myAttackPhase ?? opponentAttackPhase}
            </StyledButton>
        </div>
    );
}

const StyledButton = styled.button<{opponentAttack: boolean}>`
  z-index: 5;
  width: 245px;

  --color: ${({opponentAttack}) => opponentAttack ? "#ea6c1f" : "#11eaf1"};
  font-size: 21px;
  padding: 5px;
  letter-spacing: 0.06em;
  position: relative;
  font-family: "Pixel Digivolve", sans-serif;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  line-height: 1.4em;
  border: 1px solid var(--color);
  background: linear-gradient(to right, ${({opponentAttack}) => opponentAttack ? "rgba(166,7,90,0.1)" : "rgba(27, 125, 253, 0.1)"} 1%, transparent 40%, transparent 60%, ${({opponentAttack}) => opponentAttack ? "rgba(70,6,114,0.1)" : "rgba(57, 27, 253, 0.1)"} 100%);
  color: var(--color);
  box-shadow: inset 0 0 10px ${({opponentAttack}) => (opponentAttack) ? "rgba(234,10,124,0.4)" : "rgba(27, 140, 253, 0.4)"} , 0 0 9px 3px ${({opponentAttack}) => opponentAttack ? "rgba(122,11,46,0.27)" : "rgba(27, 140, 253, 0.1)"};


  &:hover {
    color: #11aef1;
    box-shadow: inset 0 0 10px rgba(57, 27, 253, 0.6), 0 0 9px 3px rgba(102, 27, 253, 0.2);
  }

  &:before {
    content: "";
    position: absolute;
    left: -4em;
    width: 4em;
    height: 100%;
    top: 0;
    transition: transform .4s ease-in-out;
    background: linear-gradient(to right, transparent 1%, rgba(27, 253, 234, 0.1) 40%, rgba(27, 174, 253, 0.1) 60%, transparent 100%);
  }

  &:hover:before {
    transform: translateX(15em);
  }
`;