import { Global } from "@emotion/react";
import styled from "@emotion/styled";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import { useEffect, useState } from "react";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";

export default function EffectTargetCursor() {
    const effectTargeting = useGameUIStates((state) => state.effectTargeting);
    const cancelEffectTargeting = useGameUIStates((state) => state.cancelEffectTargeting);
    const clearEffectTargetingQueue = useGameUIStates((state) => state.clearEffectTargetingQueue);
    const [position, setPosition] = useState({ x: -100, y: -100 });

    useEffect(() => () => clearEffectTargetingQueue(), [clearEffectTargetingQueue]);

    useEffect(() => {
        if (!effectTargeting) return;

        const handlePointerMove = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") cancelEffectTargeting();
        };
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            cancelEffectTargeting();
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("contextmenu", handleContextMenu, true);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("contextmenu", handleContextMenu, true);
        };
    }, [cancelEffectTargeting, effectTargeting]);

    if (!effectTargeting) return null;

    return (
        <>
            <Global styles={{ "body, body *": { cursor: "none !important" } }} />
            <CursorOverlay style={{ transform: `translate(${position.x + 7}px, ${position.y + 7}px)` }}>
                <ModeStandbyIcon />
                <Instruction>
                    Select a target for [{effectTargeting.timing}]
                    <small>Esc or right-click to cancel</small>
                </Instruction>
            </CursorOverlay>
        </>
    );
}

const CursorOverlay = styled.div`
    position: fixed;
    inset: 0 auto auto 0;
    z-index: 100000;
    pointer-events: none;
    color: #ff1744;
    filter: drop-shadow(0 0 2px #000) drop-shadow(0 0 5px rgba(255, 23, 68, 0.9));

    svg {
        width: 30px;
        height: 30px;
    }
`;

const Instruction = styled.div`
    position: absolute;
    top: 32px;
    left: 18px;
    width: max-content;
    max-width: 320px;
    padding: 5px 8px;
    border: 1px solid rgba(255, 82, 82, 0.8);
    border-radius: 4px;
    background: rgba(10, 12, 20, 0.92);
    color: #fff1f1;
    font-family: Cousine, sans-serif;
    font-size: 12px;

    small {
        display: block;
        margin-top: 2px;
        color: #ffb3bd;
    }
`;
