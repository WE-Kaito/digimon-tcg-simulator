import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGameBoardStates} from "../../../../hooks/useGameBoardStates.ts";
import {BootStage} from "../../../../utils/types.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";
import PlayerAttackResolve from "./PlayerAttackResolve.tsx";
import Lottie from "lottie-react";
import firstAnimation from "../../../../assets/lotties/net-ball.json";
import useResponsiveFontSize from "../../../../hooks/useResponsiveFontSize.ts";

export default function PlayerEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const [bootStage, startingPlayer, isOpponentOnline] = useGameBoardStates((state) => [
        state.bootStage, state.startingPlayer, state.isOpponentOnline]);

    const isFirst = startingPlayer === wsUtils?.matchInfo.user;

    const {fontContainerRef, fontSize} = useResponsiveFontSize(7.25);

    if (!isOpponentOnline) return <></>;

    return (
        <Container ref={fontContainerRef}>
            {bootStage === BootStage.SHOW_STARTING_PLAYER &&
                <Lottie animationData={firstAnimation} autoplay={isFirst} initialSegment={[0, 70]} loop={false}/>
            }
            <Mulligan wsUtils={wsUtils} fontSize={fontSize}/>
            <PlayerAttackResolve wsUtils={wsUtils} fontSize={fontSize}/>
            <UnsuspendAllButton wsUtils={wsUtils} fontSize={fontSize}/>
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
