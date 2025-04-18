import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

const invisibleFields = [
    "mySecurity_top_faceDown",
    "mySecurity_top_faceUp",
    "mySecurity_bot_faceDown",
    "mySecurity_bot_faceUp",
];

export default function DragOverlaySingleCard() {
    const width = useGeneralStates((state) => state.cardWidth);

    const { active, over } = useDndContext();
    const imgSrc =
        active?.data?.current?.type === "card" && !["myHand"].includes(active?.data?.current?.content?.location)
            ? active?.data?.current?.content?.imgSrc
            : undefined;

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
        </DragOverlay>
    );
}
