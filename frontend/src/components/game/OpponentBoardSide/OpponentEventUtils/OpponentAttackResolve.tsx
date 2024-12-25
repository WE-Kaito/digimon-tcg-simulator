import styled from "@emotion/styled";
import {AttackPhase} from "../../../../utils/types.ts";
import {useGameBoardStates} from "../../../../hooks/useGameBoardStates.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";
import {useSound} from "../../../../hooks/useSound.ts";

/**
 * For Player {@link AttackPhase}
 */
export default function OpponentAttackResolve({ wsUtils, fontSize } : { wsUtils?: WSUtils, fontSize: number }) {
    const [myAttackPhase, getMyAttackPhase, setMyAttackPhase] = useGameBoardStates((state) => [
        state.myAttackPhase, state.getMyAttackPhase, state.setMyAttackPhase]);
    const playNextAttackPhaseSfx = useSound((state) => state.playNextAttackPhaseSfx);

    const isDisabled = myAttackPhase === AttackPhase.COUNTER_BLOCK;

    function sendAttackPhaseUpdate(attackPhase: AttackPhase | false) {
        wsUtils?.sendMessage(`${wsUtils?.matchInfo.gameId}:/updateAttackPhase:${wsUtils?.matchInfo.opponentName}:${attackPhase}`);
    }

    function resolveMyAttack() {
        const attackPhase = getMyAttackPhase();
        if (!attackPhase) return;
        else if (attackPhase === AttackPhase.WHEN_ATTACKING) {
            setMyAttackPhase(AttackPhase.COUNTER_BLOCK);
            sendAttackPhaseUpdate(AttackPhase.COUNTER_BLOCK);
        } else if (attackPhase === AttackPhase.RESOLVE_ATTACK) {
            setMyAttackPhase(false);
            sendAttackPhaseUpdate(false);
        }
        playNextAttackPhaseSfx();
        wsUtils?.sendSfx("playNextAttackPhaseSfx");
    }

    if(!myAttackPhase) return <></>

    return (
        <StyledButton style={{fontSize}} onClick={resolveMyAttack} disabled={isDisabled}>
            {myAttackPhase}
        </StyledButton>
    );
}

const StyledButton = styled.div<{disabled: boolean}>`
  z-index: 5;
  width: 100%;

  --color: ${({disabled}) => disabled ? "#ea6c1f" : "#11eaf1"};
  margin: 2.5% 1% 2.5% 5%;
  padding: 5px;
  letter-spacing: 0.06em;
  position: relative;
  font-family: Sansation, sans-serif;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
  line-height: 1.4em;
  border: 1px solid var(--color);
  background: linear-gradient(to bottom, ${({disabled}) => disabled ? "rgba(166,7,90,0.5)" : "rgba(27, 125, 253, 0.3)"} 1%, ${({disabled}) => disabled ? "rgba(70,6,114,0.3)" : "rgba(57, 27, 253, 0.3)"} 100%);
  color: var(--color);
  box-shadow: inset 0 0 10px ${({disabled}) => (disabled) ? "rgba(234,10,124,0.4)" : "rgba(27, 140, 253, 0.4)"} , 0 0 9px 3px ${({disabled}) => disabled ? "rgba(122,11,46,0.27)" : "rgba(27, 140, 253, 0.1)"};
  cursor: ${({disabled}) => disabled ? "default" : "pointer"};
  pointer-events: ${({disabled}) => disabled ? "none" : "unset"};
  
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
