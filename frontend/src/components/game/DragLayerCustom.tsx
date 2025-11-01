import { useDragLayer } from "react-dnd";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { DraggedItem, DraggedStack, CardTypeGame } from "../../utils/types.ts";
import styled from "@emotion/styled";
import { getSleeve } from "../../utils/sleeves.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";

const tamerLocations = ["myDigi17", "myDigi18", "myDigi19", "myDigi20", "myDigi21"];

/**
 * React-DND custom drag layer component that provides visual feedback during drag operations.
 */
export default function DragLayerCustom() {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const username = useGeneralStates((state) => state.user);

    const player1 = useGameBoardStates((state) => state.player1);
    const player2 = useGameBoardStates((state) => state.player2);
    const mySleeve = player1.username === username ? player1.sleeveName : player2.sleeveName;

    if (!isDragging || !item || !currentOffset) {
        return null;
    }

    const { x, y } = currentOffset;
    const width = cardWidth;
    const height = width * 1.4;

    // Handle single card dragging
    if (item.type === "card") {
        const { card, location } = item.content as DraggedItem;

        const imgSrc = !card.isFaceUp && location !== "myHand" ? getSleeve(mySleeve) : card.imgUrl;

        return (
            <DragPreview style={{ transform: `translate(${x - 5}px, ${y - 5}px)` }}>
                <CardPreview src={imgSrc} alt={card.name} width={width} height={height} />
            </DragPreview>
        );
    }

    // Handle card stack dragging
    if (item.type === "card-stack") {
        const stackData = item.content as DraggedStack;
        let cards = stackData.cards || [];

        if (tamerLocations.includes(stackData.location)) {
            cards = [...cards].reverse(); // Safe: does not mutate original
        }
        if (cards.length === 0) return null;

        return (
            <DragPreview style={{ transform: `translate(${x}px, ${y}px)` }}>
                <StackPreview>
                    {cards.map((card: CardTypeGame, index: number) => (
                        <CardPreview
                            key={card.id}
                            src={card.isFaceUp ? card.imgUrl : getSleeve(mySleeve)}
                            alt={card.name}
                            width={width}
                            height={height}
                            style={{
                                position: "absolute",
                                top: `-${12 * index}px`,
                                left: 0,
                                zIndex: index,
                            }}
                        />
                    ))}
                </StackPreview>
            </DragPreview>
        );
    }

    return null;
}

const DragPreview = styled.div`
    position: fixed;
    pointer-events: none;
    z-index: 100000;
    left: 0;
    top: 0;
    cursor: grabbing;
`;

const CardPreview = styled.img`
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const StackPreview = styled.div`
    position: relative;
    top: 0;
    left: 0;
`;
