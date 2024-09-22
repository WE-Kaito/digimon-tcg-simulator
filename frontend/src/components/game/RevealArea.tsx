import styled from "@emotion/styled";
import {Flip} from "react-awesome-reveal";
import Card from "../Card.tsx";
import {useGame} from "../../hooks/useGame.ts";
import {useStore} from "../../hooks/useStore.ts";

export default function RevealArea() {
    const [myReveal, opponentReveal] = useGame((state) => [state.myReveal, state.opponentReveal]);
    const cardWidth = useStore((state) => state.cardWidth);

    if (!myReveal.length) return <></>;

    return (
        <Container>
            {myReveal?.map((card) =>
                <Flip key={card.id} style={{...(opponentReveal.length && { zIndex: 1000, width: cardWidth * 2 })}}>
                    <Card card={card} location={"myReveal"} style={{width: cardWidth * 2 }}/>
                </Flip>
            )}
            {opponentReveal?.map((card) =>
                <Flip key={card.id} style={{...(myReveal.length && { zIndex: 500, opacity: 0.5 })}}>
                    <Card card={card} location={"myReveal"} style={{width: cardWidth * 2 }}/>
                </Flip>
            )}
        </Container>
    );
}

const Container = styled.div`
  position: absolute;
  left: 40%;
  top: 50%;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transform: translate(-50%, -50%);
`;
