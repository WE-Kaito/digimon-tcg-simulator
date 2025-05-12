import styled from "@emotion/styled";
import Mulligan from "./Mulligan.tsx";
import UnsuspendAllButton from "./UnsuspendAllButton.tsx";
import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import { BootStage } from "../../../../utils/types.ts";
import { WSUtils } from "../../../../pages/GamePage.tsx";
import PlayerAttackResolve from "./PlayerAttackResolve.tsx";
import Lottie from "lottie-react";
import firstAnimation from "../../../../assets/lotties/net-ball.json";
import useResponsiveFontSize from "../../../../hooks/useResponsiveFontSize.ts";

export default function PlayerEventUtils({ wsUtils }: { wsUtils?: WSUtils }) {
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const startingPlayer = useGameBoardStates((state) => state.startingPlayer);
    const isOpponentOnline = useGameBoardStates((state) => state.isOpponentOnline);

    const isFirst = startingPlayer === wsUtils?.matchInfo.user;

    const { fontContainerRef, fontSize } = useResponsiveFontSize(7.25);

    const childrenLength = fontContainerRef?.current?.children?.length;
    const hasChildren = childrenLength ? childrenLength > 0 : false;

    return (
        <Container ref={fontContainerRef} hasChildren={hasChildren}>
            {isOpponentOnline && (
                <>
                    {bootStage === BootStage.SHOW_STARTING_PLAYER && (
                        <Lottie
                            animationData={firstAnimation}
                            style={{ transform: "translateY(-20%)" }}
                            autoplay={isFirst}
                            initialSegment={[0, 70]}
                            loop={false}
                        />
                    )}
                    <Mulligan wsUtils={wsUtils} fontSize={fontSize} />
                    <PlayerAttackResolve wsUtils={wsUtils} fontSize={fontSize} />
                    <UnsuspendAllButton wsUtils={wsUtils} fontSize={fontSize} />
                </>
            )}
        </Container>
    );
}

const Container = styled.div<{ hasChildren: boolean }>`
    grid-area: event-utils;
    height: 100%;
    width: 95%;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    background: linear-gradient(
        20deg,
        rgba(54, 93, 131, 0.32) 0%,
        rgba(48, 78, 112, 0.32) 70%,
        rgba(24, 46, 61, 0.32) 100%
    );
    box-shadow: inset 2px 3px 10px 3px rgba(71, 161, 196, 0.25);
    filter: drop-shadow(0 0 2px rgba(5, 5, 5, 0.5));
    animation: ${({ hasChildren }) => (hasChildren ? "pulse 1.5s infinite" : "none")};

    &&:before {
        content: "";
        position: absolute;
        top: 5%;
        left: 2.5%;
        width: 95%;
        height: 90%;
        border-radius: 5px;
        background: linear-gradient(20deg, rgb(24, 24, 24) 0%, rgb(10, 10, 10) 70%, rgb(0, 0, 0) 100%);
        z-index: -1;
        box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
    }

    @keyframes pulse {
        0% {
            filter: drop-shadow(0 0 1px rgba(5, 5, 5, 0.5));
            box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
        }
        20% {
            filter: drop-shadow(0 0 2px rgba(187, 215, 116, 0.8));
            box-shadow: inset 0 0 3px 1px rgba(105, 255, 215, 0.25);
        }
        55% {
            filter: drop-shadow(0 0 2px rgb(255, 206, 103));
            box-shadow: inset 0 0 4px 2px rgba(105, 255, 215, 0.35);
        }
        80% {
            filter: drop-shadow(0 0 2px rgba(187, 215, 116, 0.8));
            box-shadow: inset 0 0 3px 1px rgba(105, 255, 215, 0.25);
        }
        100% {
            filter: drop-shadow(0 0 1px rgba(5, 5, 5, 0.5));
            box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
        }
    }
`;
