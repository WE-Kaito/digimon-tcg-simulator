import {useGameBoardStates} from "../../../../hooks/useGameBoardStates.ts";
import {Phase, SIDE} from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import {useSound} from "../../../../hooks/useSound.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";

export default function UnsuspendAllButton({ wsUtils, fontSize } : { wsUtils?: WSUtils, fontSize: number }) {
    const [phase, isMyTurn, unsuspendAll, areCardsSuspended] = useGameBoardStates(state =>
        [state.phase, state.isMyTurn, state.unsuspendAll, state.areCardsSuspended()]);

    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const isUnsuspendPhase = phase === Phase.UNSUSPEND;

    if (!isMyTurn || !isUnsuspendPhase || !areCardsSuspended) return <></>;

    return (
        <Container>
            <MulliganButton  style={{ fontSize: fontSize, paddingTop: fontSize / 6 }} onClick={() => {
                unsuspendAll(SIDE.MY);
                playUnsuspendSfx();
                wsUtils?.sendMessage(`${wsUtils?.matchInfo.gameId}:/unsuspendAll:${wsUtils?.matchInfo.opponentName}`);
                wsUtils?.sendSfx?.("playUnsuspendSfx");
                wsUtils?.nextPhase();
            }}>
                UN-<br/>SUSPEND<br/>ALL
            </MulliganButton>
        </Container>
    );
}

const Container = styled.div`
  width: 100%;
  height:100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MulliganButton = styled.div`
  border-radius: 3px;
  border: 2px solid rgba(77, 250, 146, 0.85);
  background: rgba(0, 0, 0, 0.15);
  color: rgb(77, 250, 146);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "League Spartan", sans-serif;
  padding: 0 5px 0 5px;
  line-height: 1.2;
  filter: drop-shadow(3px 3px 1px #131313);
  transition: all 0.05s ease;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(2px 2px 1px #131313);
    background-color: rgba(77, 250, 210, 0.8);
    transform: translateY(1px);
    color: black;
  }

  &:active {
    filter: none;
    background-color: rgba(77, 250, 210, 0.8);
    transform: translate(1px, 2px);
    color: black;
  }
`;
