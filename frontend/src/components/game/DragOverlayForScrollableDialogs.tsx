import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

export default function DragOverlayForScrollableDialogs() {
    const width = useGeneralStates((state) => state.cardWidth);

    const { active } = useDndContext();

    const imgSrc = active?.data?.current?.content?.isInScrollable ? active?.data?.current?.content?.imgSrc : undefined;

    return (
        <DragOverlay zIndex={10000}>
            {imgSrc && <img alt={"card"} src={imgSrc} style={{ width, borderRadius: 5 }} />}
        </DragOverlay>
    );
}
