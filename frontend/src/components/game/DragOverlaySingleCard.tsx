import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function DragOverlaySingleCard() {
    const width = useGeneralStates((state) => state.cardWidth);

    const { active } = useDndContext();
    const imgSrc =
        active?.data?.current?.type === "card" &&
        !["myHand", "mySecurity"].includes(active?.data?.current?.content?.location)
            ? active?.data?.current?.content?.imgSrc
            : undefined;

    return (
        <DragOverlay zIndex={10000}>
            {imgSrc && <img alt={"card"} src={imgSrc} style={{ width, borderRadius: 5 }} />}
        </DragOverlay>
    );
}
