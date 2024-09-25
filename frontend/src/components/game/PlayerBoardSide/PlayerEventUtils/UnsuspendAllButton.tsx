import UnsuspendIcon from "@mui/icons-material/ScreenRotation";
import {useGame} from "../../../../hooks/useGame.ts";
import {Phase, SIDE} from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import {useSound} from "../../../../hooks/useSound.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";

export default function UnsuspendAllButton({wsUtils} : { wsUtils?: WSUtils }) {

    const [phase, isMyTurn, unsuspendAll, areCardsSuspended] = useGame(state =>
        [state.phase, state.isMyTurn, state.unsuspendAll, state.areCardsSuspended()]);

    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const isUnsuspendPhase = phase === Phase.UNSUSPEND;

    if (!isMyTurn || !isUnsuspendPhase || !areCardsSuspended) return <></>;

    return (
        <Container>
            <div onClick={() => {
                unsuspendAll(SIDE.MY);
                playUnsuspendSfx();
                wsUtils?.sendMessage(`${wsUtils?.matchInfo.gameId}:/unsuspendAll:${wsUtils?.matchInfo.opponentName}`);
                wsUtils?.sendSfx?.("playUnsuspendSfx");
            }}>
                <span style={{ width: "80%"}}>
                    UNSUSPEND ALL <UnsuspendIcon sx={{transform: "rotate(43deg) translateY(3px)"}}/>
                </span>
                <span/>
            </div>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  justify-content: center;

  div {
    display: flex;
    padding: 3px;
    text-decoration: none;
    font-family: "Poppins", sans-serif;
    font-size: 20px;
    color: ghostwhite;
    background: #41ffaf;
    transition: 0.4s;
    box-shadow: 3px 3px 0 black;
    transform: skewX(-20deg);
  }

  div:focus {
    outline: none;
  }

  div:hover {
    transition: 0.5s;
    box-shadow: 6px 6px 0 #2993d5;
    cursor: pointer;
    background: #fad219;

    span {
      transition: 0.2s;
      letter-spacing: 2px;
    }
  }

  div span:nth-child(2) {
    transition: 0.5s;
    margin-right: 0;
  }

  span {
    width: 65px;
    max-height: 30px;
    overflow: hidden;
    transform: translateX(12px);
    color: #0a0a0a;
    font-family: 'Montelgo Sans Serif', cursive;
    text-align: center;
    user-select: none;
  }

  span:nth-child(2) {
    width: 20px;
    position: relative;
    top: 12%;
  }
`;
