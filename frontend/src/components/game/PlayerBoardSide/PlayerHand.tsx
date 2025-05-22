import Card from "../../Card.tsx";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { useDroppable } from "@dnd-kit/core";
import EyeIcon from "@mui/icons-material/RemoveRedEyeTwoTone";

export default function PlayerHand() {
    const { setNodeRef } = useDroppable({ id: "myHand", data: { accept: ["card"] } });
    const { show: showHandCardMenu } = useContextMenu({ id: "handCardMenu" });

    const myHand = useGameBoardStates((state) => state.myHand);
    const cardWidth = useGeneralStates((state) => state.cardWidth * 1.25); // scale up the card width for hand

    const gap = 5; // gap between cards
    const maxCardSpace = cardWidth + gap;
    const maxHandWidth = maxCardSpace * 7 - gap;

    const effectiveSpacing = myHand.length <= 7 ? maxCardSpace : (maxHandWidth - cardWidth) / (myHand.length - 1);

    const currentHandWidth = cardWidth + effectiveSpacing * (myHand.length - 1);

    const offset = (maxHandWidth - currentHandWidth) / 2;

    return (
        <Container ref={setNodeRef}>
            {myHand.map((card, index) => (
                <div style={{ position: "absolute", left: offset + index * effectiveSpacing, top: "3%" }}>
                    {card.isFaceUp && (
                        <EyeIcon
                            sx={{
                                position: "absolute",
                                left: "50%",
                                top: -cardWidth / 5.25,
                                transform: "translateX(-50%)",
                                fontSize: cardWidth / 2,
                                filter: "drop-shadow(0 0 4px #DCB415) drop-shadow(0 0 4px #DCB415) drop-shadow(0 0 6px black)",
                                color: "ghostwhite",
                                zIndex: 11 + index,
                                pointerEvents: "none",
                            }}
                        />
                    )}
                    <Card
                        key={card.id}
                        card={card}
                        location={"myHand"}
                        style={{
                            zIndex: 10 + index,
                            width: cardWidth,
                            transition: "all 0.2s ease",
                            filter: "drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.8))",
                        }}
                        onContextMenu={(e) =>
                            showHandCardMenu({
                                event: e,
                                props: { index, location: "myHand", id: card.id, name: card.name },
                            })
                        }
                    />
                </div>
            ))}
            {myHand.length > 7 && <StyledSpan>{myHand.length}</StyledSpan>}
        </Container>
    );
}

const Container = styled.div`
    touch-action: none;
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
    bottom: -2%;
    left: -4.5%;
    pointer-events: none;
`;
