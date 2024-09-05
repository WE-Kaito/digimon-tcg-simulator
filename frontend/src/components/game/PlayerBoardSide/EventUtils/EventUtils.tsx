import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import AttackResolveButton from "./AttackResolveButton.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";
import {WSUtils} from "../../../../pages/GamePage.tsx";

type Props = {
    isOpponent?: boolean;
    wsUtils?: WSUtils;
}

export default function EventUtils({ isOpponent, wsUtils }: Props) {
    const getMyAttackPhase = useGame((state) => state.getMyAttackPhase);

    return (
        <Container>
            {/*TODO: hier 1st player einfügen (beim 2. 2nd)*/}
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
