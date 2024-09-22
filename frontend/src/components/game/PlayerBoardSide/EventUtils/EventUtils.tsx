import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import AttackResolveButton from "./AttackResolveButton.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";
import {BootStage, SIDE} from "../../../../utils/types.ts";

type Props = {
    isOpponent?: boolean;
    wsUtils?: WSUtils;
}

// TODO: split this component into Opponent and my EventUtils
export default function EventUtils({ isOpponent, wsUtils }: Props) {
    const [getMyAttackPhase, bootStage, isOpponentOnline, startingPlayer] = useGame((state) => [
        state.getMyAttackPhase, state.bootStage, state.isOpponentOnline, state.startingPlayer]);

    const meStarting = startingPlayer === SIDE.MY;

    // TODO: scaling fontSize for all utils

    return (
        <Container>
            {/*TODO: adn check for correct side renders*/}
            {bootStage === BootStage.SHOW_STARTING_PLAYER && <StyledSpan meStarting={meStarting}>{meStarting ? "1st" :  "2nd"}</StyledSpan>}
            {isOpponent && !isOpponentOnline && <ErrorSpan>OFFLINE</ErrorSpan>}
            {!isOpponent && <Mulligan wsUtils={wsUtils}/>}
            {!!getMyAttackPhase() && <AttackResolveButton/>}
            <UnsuspendAllButton/>
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

const StyledSpan = styled.span<{ meStarting: boolean }>`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: ${({ meStarting }) => meStarting ? "#e3d120" : "#e7e7e7"};
`;

const ErrorSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: #e30a4c;
`;