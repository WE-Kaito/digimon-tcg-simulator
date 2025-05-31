import Card from "../../Card.tsx";
import styled from "@emotion/styled";
import { useContextMenu } from "react-contexify";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function OpponentHand() {
    const { show: showOpponentHandCardMenu } = useContextMenu({ id: "opponentHandCardMenu", props: { index: -1 } });

    const opponentHand = useGameBoardStates((state) => state.opponentHand);

    const cardWidth = useGeneralStates((state) => state.cardWidth * 1.1); // scale up the card width for hand

    const gap = 5; // gap between cards
    const maxCardSpace = cardWidth + gap;
    const maxHandWidth = maxCardSpace * 6.25 - gap;

    const effectiveSpacing =
        opponentHand.length <= 6 ? maxCardSpace : (maxHandWidth - cardWidth) / (opponentHand.length - 1);

    const currentHandWidth = cardWidth + effectiveSpacing * (opponentHand.length - 1);

    const offset = (maxHandWidth - currentHandWidth) / 2;

    return (
        <Container cardCount={opponentHand.length}>
            {opponentHand.map((card, index) => (
                <div
                    onContextMenu={(e) =>
                        showOpponentHandCardMenu({
                            event: e,
                            props: {
                                index,
                                location: "opponentHand",
                                id: card.id,
                                name: card.name,
                            },
                        })
                    }
                    style={{ position: "absolute", left: offset + index * effectiveSpacing }}
                >
                    <Card
                        key={card.id}
                        card={card}
                        location={"opponentHand"}
                        style={{
                            width: cardWidth * 0.9,
                            transition: "all 0.2s ease",
                            filter: "drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.8))",
                            pointerEvents: card.isFaceUp ? "auto" : "none",
                        }}
                    />
                </div>
            ))}
            {opponentHand.length > 7 && <StyledSpan>{opponentHand.length}</StyledSpan>}
        </Container>
    );
}

const Container = styled.div<{ cardCount: number; isMobileUi?: boolean }>`
    //touch-action: none;
    grid-area: hand;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
`;

const StyledSpan = styled.span`
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    font-size: 20px;
    opacity: 0.4;
    position: absolute;
    bottom: 1%;
    left: -4.5%;
    pointer-events: none;
`;
