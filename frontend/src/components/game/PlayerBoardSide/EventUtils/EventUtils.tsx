import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import AttackResolveButton from "./AttackResolveButton.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";

export default function EventUtils() {
    const getMyAttackPhase = useGame((state) => state.getMyAttackPhase);

    return (
        <Container>
            <Mulligan/>
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
`;
