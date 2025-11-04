import styled from "@emotion/styled";
import Card from "../Card.tsx";
import { tamerLocations, useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useContextMenu } from "react-contexify";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";

/**
 * Dialog that shows the stack of cards in a location and closes automatically if the trash or security is opened.
 * It is only an alternative display of the cards in the location and similar to the CardDialog but maintains stack-dragging functionality.
 */
export default function StackDialog() {
    const stackDialog = useGameUIStates((state) => state.stackDialog);
    const setStackDialog = useGameUIStates((state) => state.setStackDialog);

    const locationCards = useGameBoardStates((state) =>
        stackDialog ? (state[stackDialog as keyof typeof state] as CardTypeGame[]) : []
    );

    const cardWidth = useGeneralStates((state) => state.cardWidth);

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(cardWidth);

    const reverse = !(!!stackDialog && tamerLocations.includes(stackDialog));

    const { show: showCardMenu } = useContextMenu({
        id: stackDialog !== false && stackDialog.includes("opponent") ? "dialogMenuOpponent" : "dialogMenu",
        props: { index: -1, location: "", id: "" },
    });

    useLayoutEffect(() => {
        if (containerRef.current) setWidth(containerRef.current.clientWidth / 4.4); //3.25 = 3 cards; 4.4 = 4 cards
    }, [containerRef.current?.clientWidth]);

    useEffect(() => {
        if (stackDialog && !locationCards.length) setStackDialog(false); // correctly close the dialog if there are no cards
    }, [locationCards, stackDialog, setStackDialog]);

    if (!stackDialog) return <></>;

    return (
        <Container
            reverse={reverse}
            ref={containerRef}
            id={stackDialog + "_stackModal"}
            onMouseOver={(e) => e.stopPropagation()}
        >
            {locationCards.map((card, index) => (
                <Card
                    card={card}
                    location={stackDialog}
                    style={{ width }}
                    key={card.id}
                    index={index}
                    onContextMenu={(e) => {
                        showCardMenu?.({
                            event: e,
                            props: { index, location: stackDialog, id: card.id, name: card.name },
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
