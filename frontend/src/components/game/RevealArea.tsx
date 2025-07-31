import styled from "@emotion/styled";
import { Flip } from "react-awesome-reveal";
import Card from "../Card.tsx";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function RevealArea() {
    const myReveal = useGameBoardStates((state) => state.myReveal);
    const opponentReveal = useGameBoardStates((state) => state.opponentReveal);

    const cardWidth = useGeneralStates((state) => state.cardWidth);

    if (!myReveal.length && !opponentReveal.length) return <></>;

    const bothRevealed = myReveal.length && opponentReveal.length; // edge case

    return (
        <Container>
            {myReveal?.map((card) => (
                <Flip
                    key={card.id}
                    style={{
                        ...(opponentReveal.length && {
                            zIndex: 1000,
                            width: cardWidth * 2,
                            ...(bothRevealed && { transform: "translateY(-100px)" }),
                        }),
                    }}
                    triggerOnce
                >
                    <Card card={card} location={"myReveal"} style={{ width: cardWidth * 2 }} />
                </Flip>
            ))}
            {opponentReveal?.map((card) => (
                <Flip
                    key={card.id}
                    style={{
                        ...(myReveal.length && {
                            zIndex: 500,
                            opacity: 0.5,
                            ...(bothRevealed && { transform: "translateY(100px)" }),
                        }),
                    }}
                    triggerOnce
                >
                    <Card card={card} location={"opponentReveal"} style={{ width: cardWidth * 2 }} />
                </Flip>
            ))}
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
