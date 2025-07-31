import styled from "@emotion/styled";
import noiseBG from "../../assets/noiseBG.png";
import { useSettingStates } from "../../hooks/useSettingStates.ts";

export default function GameBackground() {
    const colors = useSettingStates((state) => state.backgroundColors);

    return (
        <>
            <BackGroundPattern />
            <BackGround color1={colors.color1} color2={colors.color2} color3={colors.color3} />
        </>
    );
}

const BackGround = styled.div<{ color1: string; color2: string; color3: string }>`
    position: fixed;
    top: 0;
    left: 0;
    z-index: -10;
    width: 100%;
    height: 100%;
    min-width: 100vw;
    min-height: 100vh;
    //max-width: 100vw;
    //max-height: 100vh;
    background: linear-gradient(
        253deg,
        ${({ color1 }) => color1},
        ${({ color2 }) => color2},
        ${({ color3 }) => color3}
    );
    background-size: 200% 200%;
    -webkit-animation: Background 25s ease infinite;
    -moz-animation: Background 25s ease infinite;
    animation: Background 25s ease infinite;

    @media (max-height: 499px) {
        transform: scaleX(1.5);
    }

    @-webkit-keyframes Background {
        0% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0 50%;
        }
    }

    @-moz-keyframes Background {
        0% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0 50%;
        }
    }

    @keyframes Background {
        0% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0 50%;
        }
    }
`;

const BackGroundPattern = styled.div`
    position: fixed;
    top: -50vh;
    left: -50vw;
    width: 200vw;
    height: 200vh;
    background: transparent url(${noiseBG}) repeat 0 0;
    animation: bg-animation 0.2s infinite;
    opacity: 0.4;
    z-index: 0;
    overflow: hidden;

    @keyframes bg-animation {
        0% {
            transform: translate(0, 0);
        }
        10% {
            transform: translate(-1%, -1%);
        }
        20% {
            transform: translate(-2%, 1%);
        }
        30% {
            transform: translate(1%, -2%);
        }
        40% {
            transform: translate(-1%, 3%);
        }
        50% {
            transform: translate(-2%, 1%);
        }
        60% {
            transform: translate(3%, 0);
        }
        70% {
            transform: translate(0, 2%);
        }
        80% {
            transform: translate(-3%, 0);
        }
        90% {
            transform: translate(2%, 1%);
        }
        100% {
            transform: translate(1%, 0);
        }
    }
`;
