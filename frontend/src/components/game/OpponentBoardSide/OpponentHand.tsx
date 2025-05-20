import { CardAnimationContainer } from "../../Card.tsx";
import Lottie from "lottie-react";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import { getSleeve } from "../../../utils/sleeves.ts";
import styled from "@emotion/styled";
import { useContextMenu } from "react-contexify";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function OpponentHand() {
    const { show: showOpponentCardMenu } = useContextMenu({ id: "opponentCardMenu", props: { index: -1 } });

    const opponentHand = useGameBoardStates((state) => state.opponentHand);
    const opponentSleeve = useGameBoardStates((state) => state.opponentSleeve);
    const getIsCardTarget = useGameBoardStates((state) => state.getIsCardTarget);

    const cardWidth = useGeneralStates((state) => state.cardWidth * 1.1); // scale up the card width for hand

    const gap = 5; // gap between cards
    const maxCardSpace = cardWidth + gap;
    const maxHandWidth = maxCardSpace * 6.25 - gap;

    const effectiveSpacing =
        opponentHand.length <= 6 ? maxCardSpace : (maxHandWidth - cardWidth) / (opponentHand.length - 1);

    const currentHandWidth = cardWidth + effectiveSpacing * (opponentHand.length - 1);

    const offset = (maxHandWidth - currentHandWidth) / 2;

    return (
        <Container>
            <StyledList>
                {opponentHand.map((card, index) => (
                    <ListItem
                        style={{ left: offset + index * effectiveSpacing }}
                        key={card.id}
                        onContextMenu={(e) =>
                            showOpponentCardMenu({
                                event: e,
                                props: {
                                    index,
                                    location: "opponentHand",
                                    id: card.id,
                                    name: card.name,
                                },
                            })
                        }
                    >
                        <img alt="card" src={getSleeve(opponentSleeve)} style={{ width: cardWidth, borderRadius: 2 }} />
                        <div
                            style={{
                                position: "relative",
                                filter: getIsCardTarget(card.id)
                                    ? "drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1)"
                                    : "unset",
                            }}
                        >
                            {getIsCardTarget(card.id) && (
                                <CardAnimationContainer>
                                    <Lottie animationData={targetAnimation} loop={true} />
                                </CardAnimationContainer>
                            )}
                        </div>
                    </ListItem>
                ))}
            </StyledList>
            {opponentHand.length > 6 && <StyledSpan>{opponentHand.length}</StyledSpan>}
        </Container>
    );
}

const Container = styled.div`
    grid-area: hand;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
`;

const StyledList = styled.ul`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 100%;
    height: 100%;
    list-style-type: none;
    transform: translateX(-2.5%);
`;

const ListItem = styled.li`
    position: absolute;
    margin: 0;
    padding: 0;
    list-style-type: none;
    bottom: 0;
    transition: all 0.2s ease;

    &:hover {
        z-index: 100;
    }
`;

const StyledSpan = styled.span`
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    font-size: 20px;
    opacity: 0.4;
    position: absolute;
    bottom: 5%;
    left: -7%;
`;
