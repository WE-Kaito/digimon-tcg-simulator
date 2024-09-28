import styled from "@emotion/styled";
import {useGame} from "../../../../hooks/useGame.ts";
import {BootStage} from "../../../../utils/types.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";
import OpponentAttackResolve from "./OpponentAttackResolve.tsx";
import firstAnimation from "../../../../assets/lotties/net-ball.json";
import Lottie from "lottie-react";

export default function OpponentEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const [bootStage, isOpponentOnline, startingPlayer] = useGame((state) => [
        state.bootStage, state.isOpponentOnline, state.startingPlayer]);

    const isFirst = startingPlayer === wsUtils?.matchInfo.opponentName;

    // TODO: scaling fontSize for all utils

    return (
        <Container>
            {bootStage === BootStage.SHOW_STARTING_PLAYER &&
                <Lottie animationData={firstAnimation} autoplay={isFirst} loop={false}
                        initialSegment={[0, 70]} style={{ transform: "scaleY(-1)"}}/>
            }
            {!isOpponentOnline && <ErrorSpan>OFFLINE</ErrorSpan>}
            <OpponentAttackResolve wsUtils={wsUtils} />
        </Container>
    );
}

const Container = styled.div`
  grid-area: event-utils;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ErrorSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: #e30a4c;
`;