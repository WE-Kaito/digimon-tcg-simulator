import styled from "@emotion/styled";
import Card from "../Card.tsx";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { OpenedCardModal, useGameUIStates } from "../../hooks/useGameUIStates.ts";

/**
 * Modal that shows the stack of cards in a location and closes autimatically if others are opened.
 *
 */
export default function CardModal() {
    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const setOpenedCardModal = useGameUIStates((state) => state.setOpenedCardModal);
    const locationCards = useGameBoardStates((state) =>
        openedCardModal ? (state[openedCardModal as keyof typeof state] as CardTypeGame[]) : []
    );
    const cardWidth = useGeneralStates((state) => state.cardWidth) * 1.07;

    const cardsToRender = locationCards.slice().reverse();

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(cardWidth);

    const { show: showTrashCardMenu } = useContextMenu({
        id: openedCardModal === OpenedCardModal.OPPONENT_TRASH ? "modalMenuOpponent" : "modalMenu",
        props: { index: -1, location: "", id: "" },
    });

    useEffect(() => {
        if (openedCardModal && !locationCards.length) setOpenedCardModal(false); // correctly close the modal if there are no cards
    }, [locationCards, openedCardModal, setOpenedCardModal]);

    useLayoutEffect(() => {
        if (containerRef.current) setWidth(containerRef.current.clientWidth / 5.5);
    }, [containerRef.current?.clientWidth]);

    if (!openedCardModal) return <></>;

    return (
        <Container ref={containerRef}>
            {cardsToRender.map((card, index) => (
                <Card
                    card={card}
                    location={openedCardModal}
                    style={{ width }}
                    key={card.id}
                    onContextMenu={(e) => {
                        if (openedCardModal === OpenedCardModal.MY_SECURITY) e.preventDefault();
                        else {
                            showTrashCardMenu?.({
                                event: e,
                                props: { index, location: openedCardModal, id: card.id, name: card.name },
                            });
                        }
                    }}
                />
            ))}
        </Container>
    );
}

const Container = styled.div`
    position: relative;
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
