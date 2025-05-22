import styled from "@emotion/styled";
import Card from "../Card.tsx";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";

const tamerLocations = [
    "myDigi9",
    "myDigi10",
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
];

/**
 * Modal that shows the stack of cards in a location and closes autimatically if the trash or security is opened.
 * It is only an alternative display of the cards in the location, and does not have any functionality.
 * A possible future improvement would be to add Sortable of dnd-kit.
 */
export default function StackModal() {
    const stackModal = useGameUIStates((state) => state.stackModal);
    const setStackModal = useGameUIStates((state) => state.setStackModal);

    const locationCards = useGameBoardStates((state) =>
        stackModal ? (state[stackModal as keyof typeof state] as CardTypeGame[]) : []
    );

    const cardWidth = useGeneralStates((state) => state.cardWidth);

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(cardWidth);

    const reverse = !(!!stackModal && tamerLocations.includes(stackModal));

    const { show: showCardMenu } = useContextMenu({
        id: stackModal !== false && stackModal.includes("opponent") ? "modalMenuOpponent" : "modalMenu",
        props: { index: -1, location: "", id: "" },
    });

    useLayoutEffect(() => {
        if (containerRef.current) setWidth(containerRef.current.clientWidth / 4.4); //3.25 = 3 cards; 4.4 = 4 cards
    }, [containerRef.current?.clientWidth]);

    useEffect(() => {
        if (stackModal && !locationCards.length) setStackModal(false); // correctly close the modal if there are no cards
    }, [locationCards, stackModal, setStackModal]);

    if (!stackModal) return <></>;

    return (
        <Container
            reverse={reverse}
            ref={containerRef}
            id={stackModal + "_stackModal"}
            onMouseOver={(e) => e.stopPropagation()}
        >
            {locationCards.map((card, index) => (
                <Card
                    card={card}
                    location={stackModal}
                    style={{ width }}
                    key={card.id}
                    index={index}
                    onContextMenu={(e) => {
                        showCardMenu?.({
                            event: e,
                            props: { index, location: stackModal, id: card.id, name: card.name },
                        });
                    }}
                />
            ))}
        </Container>
    );
}

const Container = styled.div<{ reverse: boolean }>`
    position: relative;
    width: 100%;
    flex: 1;
    padding: 6px 4px 6px 6px;
    display: flex;
    flex-flow: ${({ reverse }) => (reverse ? "row-reverse wrap-reverse" : "row wrap")};
    place-content: ${({ reverse }) => (reverse ? "flex-start" : "flex-end")};
    gap: 1.5%;
    overflow-y: scroll;
    overflow-x: hidden;
    border-radius: 3px;

    scrollbar-width: none;

    ::-webkit-scrollbar {
        visibility: hidden;
        width: 0;
    }
`;
