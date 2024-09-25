import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import AttackResolveButton from "../../AttackResolveButton.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";
import {BootStage} from "../../../../utils/types.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";

export default function PlayerEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const [bootStage, startingPlayer] = useGame((state) => [state.bootStage, state.startingPlayer]);

    const isFirst = startingPlayer === wsUtils?.matchInfo.user;
    console.log("startingPlayer", startingPlayer);

    // TODO: scaling fontSize for all utils

    return (
        <Container>
            {bootStage === BootStage.SHOW_STARTING_PLAYER &&
                <StyledSpan isFirst={isFirst}>{isFirst ? "1st" :  "2nd"}</StyledSpan>
            }
            <Mulligan wsUtils={wsUtils}/>
            <AttackResolveButton/>
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

const StyledSpan = styled.span<{ isFirst: boolean }>`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 1.5em;
  color: ${({ isFirst }) => isFirst ? "#e3d120" : "#e7e7e7"};
`;
