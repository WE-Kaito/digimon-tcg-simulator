import {useRef} from "react";

type UseLongPressProps = {
    onLongPress: (e: React.TouchEvent<never>) => void;
    timeout?: number;
}

type UseLongPressReturn = {
    handleTouchStart: (e: React.TouchEvent<never>) => void;
    handleTouchEnd: () => void;
}

/**
 * This hook is used to detect long press events on a component for touch devices.
 *
 * To prevent default behavior also use the "prevent-default-long-press" class on the element.
 *
 * @param onLongPress function to be called when long press is detected
 * @param timeout time in milliseconds until long press is detected
 *
 * @example:
 * const onLongPress = (e: React.TouchEvent<HTMLImageElement>) => showContextMenu({event});
 *
 * const { handleTouchStart, handleTouchEnd } = useLongPress({onLongPress});
 *
 * return (
 *    <img src={imageSrc} alt={"example-alt-text"}
 *         onContextMenu={(event) => showContextMenu({event})}
 *         onTouchStart={handleTouchStart}
 *         onTouchEnd={handleTouchEnd}
 *         className="prevent-default-long-press"
 *    />
 * );
*/
export function useLongPress({ onLongPress, timeout = 1000 }: UseLongPressProps): UseLongPressReturn {
    const pressTimerRef = useRef(0);

    const handleTouchStart = (e: React.TouchEvent<never>) => {
        pressTimerRef.current = setTimeout(() => onLongPress(e), timeout);
    };

    const handleTouchEnd = () => clearTimeout(pressTimerRef.current);

    return { handleTouchStart, handleTouchEnd };
}
