import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import { Phase, SIDE } from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import { useSound } from "../../../../hooks/useSound.ts";
import { WSUtils } from "../../../../pages/GamePage.tsx";

export default function UnsuspendAllButton({ wsUtils, fontSize }: { wsUtils?: WSUtils; fontSize: number }) {
    const phase = useGameBoardStates((state) => state.phase);
    const isMyTurn = useGameBoardStates((state) => state.isMyTurn);
    const unsuspendAll = useGameBoardStates((state) => state.unsuspendAll);
    const areCardsSuspended = useGameBoardStates((state) => state.areCardsSuspended());

    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const isUnsuspendPhase = phase === Phase.UNSUSPEND;

    if (!isMyTurn || !isUnsuspendPhase || !areCardsSuspended) return <></>;

    return (
        <StyledButton
            className={"button"}
            style={{ fontSize: fontSize - 3, paddingTop: fontSize / 6 }}
            onClick={() => {
                unsuspendAll(SIDE.MY);
                playUnsuspendSfx();
                wsUtils?.sendMessage(`${wsUtils?.matchInfo.gameId}:/unsuspendAll:${wsUtils?.matchInfo.opponentName}`);
                wsUtils?.sendSfx?.("playUnsuspendSfx");
                wsUtils?.nextPhase();
            }}
        >
            UNSUSPEND
            <br />
            ALL
        </StyledButton>
    );
}

const StyledButton = styled.div`
    z-index: 5;
    width: 95%;
    height: 85%;

    color: ghostwhite;

    position: relative;
    font-family: "Sakana", sans-serif;
    line-height: 1.25;

    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;
    background: linear-gradient(to bottom, rgba(127, 255, 212, 0.45) 1%, rgba(64, 224, 208, 0.5) 100%);
    box-shadow:
        inset 0 0 10px rgba(127, 255, 212, 0.4),
        0 0 9px 3px rgba(127, 255, 212, 0.1);

    &:hover {
        color: #40e0d0; /* Turquoise */
        box-shadow:
            inset 0 0 10px rgba(64, 224, 208, 0.8),
            0 0 9px 3px rgba(72, 209, 204, 0.5);
    }

    &:before {
        content: "";
        position: absolute;
        left: -4em;
        width: 4em;
        height: 100%;
        top: 0;
        transition: transform 0.4s ease-in-out;
        background: linear-gradient(
            to right,
            transparent 1%,
            rgba(152, 255, 168, 0.1) 40%,
            rgba(127, 255, 212, 0.1) 60%,
            transparent 100%
        );
    }

    &:hover:before {
        transform: translateX(15em);
    }
`;
