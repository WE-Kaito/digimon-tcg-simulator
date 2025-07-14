import { useDrop } from "react-dnd";

type DropConfig = {
    id: string;
    data?: { accept: string[] };
};

/**
 * React-DND drop hook that replaces the conditional @dnd-kit logic
 */
export function useDroppableReactDnd(config: DropConfig) {
    const { id, data } = config;

    const [{ isOver, canDrop }, dropRef] = useDrop(
        () => ({
            accept: data?.accept || ["card", "card-stack"],
            drop: (item) => {
                // Dispatch a custom event with the drop data
                const dropEvent = new CustomEvent("reactDndDrop", {
                    detail: { item, targetId: id },
                });
                window.dispatchEvent(dropEvent);
                return { id };
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                // overItem: monitor.getItem(),
            }),
        }),
        [id, data?.accept]
    );

    return {
        setNodeRef: dropRef,
        isOver,
        canDrop,
    };
}
