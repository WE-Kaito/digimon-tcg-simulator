import styled from "@emotion/styled";
import {useGame} from "../../../../hooks/useGame.ts";
import {BootStage} from "../../../../utils/types.ts";
import AttackResolveButton from "../../AttackResolveButton.tsx";
import {WSUtils} from "../../../../pages/GamePage.tsx";

export default function OpponentEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const [bootStage, isOpponentOnline, startingPlayer] = useGame((state) => [
        state.bootStage, state.isOpponentOnline, state.startingPlayer]);

    const isFirst = startingPlayer === wsUtils?.matchInfo.opponentName;

    // TODO: scaling fontSize for all utils

    return (
        <Container>
            {bootStage === BootStage.SHOW_STARTING_PLAYER && <StyledSpan isFirst={isFirst}>{isFirst ? "1st" :  "2nd"}</StyledSpan>}
            {!isOpponentOnline && <ErrorSpan>OFFLINE</ErrorSpan>}
            <AttackResolveButton wsUtils={wsUtils} opponentSide />
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

const StyledSpan = styled.span<{ isFirst: boolean }>`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: ${({ isFirst }) => isFirst ? "#e3d120" : "#e7e7e7"};
`;

const ErrorSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: #e30a4c;
`;