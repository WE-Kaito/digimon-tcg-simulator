import styled from "@emotion/styled";
import Card from "../Card.tsx";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import { useEffect, useRef } from "react";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";

const tamerLocations = [
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "myDigi14",
    "myDigi15",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentDigi14",
    "opponentDigi15",
];

/**
 * Modal that shows the stack of cards in a location and closes autimatically if the trash or security is opened.
 * It is only an alternative display of the cards in the location, and does not have any functionality.
 * A possible future improvement would be to add Sortable of dnd-kit.
 */
export default function StackModal() {
    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const stackModal = useGameUIStates((state) => state.stackModal);
    const setStackModal = useGameUIStates((state) => state.setStackModal);

    const locationCards = useGameBoardStates((state) =>
        stackModal ? (state[stackModal as keyof typeof state] as CardTypeGame[]) : []
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const cardWidth = useGeneralStates((state) => state.cardWidth);

    const cardsToRender =
        !!stackModal && tamerLocations.includes(stackModal) ? locationCards : locationCards.slice().reverse();

    const { show: showCardMenu } = useContextMenu({
        id: stackModal !== false && stackModal.includes("opponent") ? "modalMenuOpponent" : "modalMenu",
        props: { index: -1, location: "", id: "" },
    });

    useEffect(() => {
        if (openedCardModal) setStackModal(false);
    }, [openedCardModal, setStackModal]);

    if (!stackModal) return <></>;

    return (
        <Container ref={containerRef} id={stackModal + "_stackModal"} onMouseOver={(e) => e.stopPropagation()}>
            {cardsToRender.map((card, index) => (
                <Card
                    card={card}
                    location={stackModal}
                    style={{
                        width: containerRef?.current?.clientWidth ? containerRef.current.clientWidth / 5.5 : cardWidth,
                    }}
                    key={card.id}
                    onContextMenu={(e) => {
                        showCardMenu?.({
                            event: e,
                            props: { index, location: openedCardModal, id: card.id, name: card.name },
                        });
                    }}
                />
            ))}
        </Container>
    );
}

const Container = styled.div`
    position: relative;
    cursor: default;
    width: 100%;
    flex: 1;
    padding: 6px 4px 6px 6px;
    display: flex;
    flex-flow: row wrap;
    place-content: flex-start;
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
