import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";
import {BootStage} from "../../../../utils/types.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";
import PlayerAttackResolve from "./PlayerAttackResolve.tsx";
import Lottie from "lottie-react";
import firstAnimation from "../../../../assets/lotties/net-ball.json";

export default function PlayerEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const [bootStage, startingPlayer] = useGame((state) => [state.bootStage, state.startingPlayer]);

    const isFirst = startingPlayer === wsUtils?.matchInfo.user;

    // TODO: scaling fontSize for all utils

    return (
        <Container>
            {bootStage === BootStage.SHOW_STARTING_PLAYER &&
                <Lottie animationData={firstAnimation} autoplay={isFirst} initialSegment={[0, 70]} loop={false}/>
            }
            <Mulligan wsUtils={wsUtils}/>
            <PlayerAttackResolve wsUtils={wsUtils}/>
            <UnsuspendAllButton wsUtils={wsUtils}/>
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
