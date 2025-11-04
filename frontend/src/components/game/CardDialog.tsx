import styled from "@emotion/styled";
import Card from "../Card.tsx";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { OpenedCardDialog, useGameUIStates } from "../../hooks/useGameUIStates.ts";

/**
 * Dialog that shows the stack of cards in a location and closes automatically if others are opened.
 */
export default function CardDialog() {
    const openedCardDialog = useGameUIStates((state) => state.openedCardDialog);
    const setOpenedCardDialog = useGameUIStates((state) => state.setOpenedCardDialog);
    const locationCards = useGameBoardStates((state) =>
        openedCardDialog ? (state[openedCardDialog as keyof typeof state] as CardTypeGame[]) : []
    );
    const cardWidth = useGeneralStates((state) => state.cardWidth) * 1.07;

    const cardsToRender = locationCards.slice().reverse();

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(cardWidth);

    const { show: showContextMenu } = useContextMenu({
        id: openedCardDialog === OpenedCardDialog.OPPONENT_TRASH ? "dialogMenuOpponent" : "dialogMenu",
        props: { index: -1, location: "", id: "" },
    });

    useEffect(() => {
        if (openedCardDialog && !locationCards.length) setOpenedCardDialog(false); // correctly close the dialog if there are no cards
    }, [locationCards, openedCardDialog, setOpenedCardDialog]);

    useLayoutEffect(() => {
        if (containerRef.current) setWidth(containerRef.current.clientWidth / 4.4); //3.25 = 3 cards; 4.4 = 4 cards
    }, [containerRef.current?.clientWidth]);

    if (!openedCardDialog) return <></>;

    return (
        <Container ref={containerRef}>
            {cardsToRender.map((card, index) => (
                <Card
                    card={card}
                    location={openedCardDialog}
                    style={{ width }}
                    key={card.id}
                    onContextMenu={(e) => {
                        showContextMenu?.({
                            event: e,
                            props: { index, location: openedCardDialog, id: card.id, name: card.name },
                        });
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
