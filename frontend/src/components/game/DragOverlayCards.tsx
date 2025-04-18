import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { CardTypeGame } from "../../utils/types.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useEffect } from "react";

const invisibleFields = [
    "mySecurity_top_faceDown",
    "mySecurity_top_faceUp",
    "mySecurity_bot_faceDown",
    "mySecurity_bot_faceUp",
];

const myTamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15"];

export default function DragOverlayCards() {
    const { active, over } = useDndContext();

    const width = useGeneralStates((state) => state.cardWidth);

    const imgSrc = active?.data?.current?.type === "card" ? active?.data?.current?.content?.imgSrc : undefined;

    // stack ###########################################################################################################
    const locationCards = useGameBoardStates(
        (state) =>
            state[(active?.data?.current?.content?.location ?? "myEggDeck") as keyof typeof state] as CardTypeGame[]
    );
    const stackSliceIndex = useGameBoardStates((state) => state.stackSliceIndex);

    const cards =
        active?.data?.current?.type === "card-stack"
            ? myTamerLocations.includes(active?.data?.current?.content?.location ?? "")
                ? locationCards.slice(stackSliceIndex).reverse()
                : locationCards.slice(0, stackSliceIndex + 1)
            : undefined;

    const setStackDragIcon = useGameUIStates((state) => state.setStackDragIcon);

    useEffect(() => {
        if (active?.data?.current?.type === "card-stack") setStackDragIcon(null);
    }, [active]);

    return (
        <DragOverlay zIndex={10000}>
            {imgSrc && (
                <img
                    className={"custom-grab-cursor"}
                    alt={"card"}
                    src={imgSrc}
                    style={{ width, borderRadius: 5, opacity: invisibleFields.includes(over?.id as string) ? 0 : 1 }}
                />
            )}
            {cards && (
                <div style={{ position: "relative", width, height: width * 1.4 + cards.length * 10 }}>
                    {cards.map((card, index) => (
                        <img
                            key={card.id}
                            className={"custom-grab-cursor"}
                            alt={card.name}
                            src={card.imgUrl}
                            style={{
                                width,
                                borderRadius: 5,
                                opacity: invisibleFields.includes(over?.id as string) ? 0 : 1,
                                position: "absolute",
                                bottom: index * 13,
                                left: 0,
                                zIndex: index + 100,
                                borderBottom: "1px solid black",
                            }}
                        />
                    ))}
                </div>
            )}
        </DragOverlay>
    );
}
