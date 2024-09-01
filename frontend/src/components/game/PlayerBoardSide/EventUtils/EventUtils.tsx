import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import AttackResolveButton from "./AttackResolveButton.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import {useGame} from "../../../../hooks/useGame.ts";

export default function EventUtils({ isOpponent }: { isOpponent?: boolean }) {
    const getMyAttackPhase = useGame((state) => state.getMyAttackPhase);

    return (
        <Container>
            {!isOpponent && <Mulligan/>}
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
