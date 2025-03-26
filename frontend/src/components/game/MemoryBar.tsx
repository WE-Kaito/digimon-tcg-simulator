import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import styled from "@emotion/styled";
import { useSound } from "../../hooks/useSound.ts";
import { WSUtils } from "../../pages/GamePage.tsx";
import useResponsiveFontSize from "../../hooks/useResponsiveFontSize.ts";

export default function MemoryBar({ wsUtils }: { wsUtils?: WSUtils }) {
    const myMemory = useGameBoardStates((state) => state.myMemory);
    const setMemory = useGameBoardStates((state) => state.setMemory);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    function handleClick(memory: number) {
        setMemory(memory);
        playButtonClickSfx();
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【MEMORY】﹕${myMemory}±${memory}`);
        wsUtils?.sendMessage(`${wsUtils.matchInfo.gameId}:/updateMemory:${wsUtils.matchInfo.opponentName}:${memory}`);
        wsUtils?.sendSfx("playButtonClickSfx");
    }

    const { fontContainerRef, fontSize } = useResponsiveFontSize(33);
    const bigFontSize = fontSize * 1.3;

    return (
        <MemoryBarContainer ref={fontContainerRef}>
            <BigMemoryButton onClick={() => handleClick(10)} value={10} myMemory={myMemory} fontSize={bigFontSize}>
                <StyledSpanOneBig>10</StyledSpanOneBig>
            </BigMemoryButton>

            <MemoryButton onClick={() => handleClick(9)} value={9} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>9</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(8)} value={8} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>8</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(7)} value={7} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>7</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(6)} value={6} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>6</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(5)} value={5} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>5</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(4)} value={4} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>4</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(3)} value={3} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>3</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(2)} value={2} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>2</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(1)} value={1} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpanOne>1</StyledSpanOne>
            </MemoryButton>

            <BigMemoryButton onClick={() => handleClick(0)} value={0} myMemory={myMemory} fontSize={bigFontSize}>
                <ZeroSpan>0</ZeroSpan>
            </BigMemoryButton>

            <MemoryButton onClick={() => handleClick(-1)} value={-1} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpanOne>1</StyledSpanOne>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-2)} value={-2} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>2</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-3)} value={-3} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>3</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-4)} value={-4} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>4</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-5)} value={-5} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>5</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-6)} value={-6} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>6</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-7)} value={-7} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>7</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-8)} value={-8} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>8</StyledSpan>
            </MemoryButton>
            <MemoryButton onClick={() => handleClick(-9)} value={-9} myMemory={myMemory} fontSize={fontSize}>
                <StyledSpan>9</StyledSpan>
            </MemoryButton>

            <BigMemoryButton onClick={() => handleClick(-10)} value={-10} myMemory={myMemory} fontSize={bigFontSize}>
                <StyledSpanOneBig>10</StyledSpanOneBig>
            </BigMemoryButton>
        </MemoryBarContainer>
    );
}

const MemoryBarContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // match BoardLayout Element of GamePage.tsx:
    grid-column: 5 / 25; // of 35
    grid-row: 10 / 12; // of 14
    transform: translate(-3px, -2px);
`;

const MemoryButton = styled.button<{ myMemory: number; value: number; fontSize: number }>`
    width: 4%;
    height: 43%;
    padding: 0;
    transition: all 0.2s ease;
    z-index: 200;

    display: flex;
    justify-content: center;
    align-items: center;

    font-family:
        alarm clock,
        sans-serif;
    font-size: ${({ fontSize }) => fontSize}px;
    text-shadow: ${({ value }) => (value > 0 ? "0 0 1px #0c0c0c" : "none")};
    font-weight: bold;

    border: ${({ myMemory, value }) => getBorder(value, myMemory)};
    color: ghostwhite;

    background: rgba(0, 0, 0, ${({ myMemory, value }) => (value === myMemory ? 0.6 : 0.5)});
    border-radius: 50%;

    filter: drop-shadow(${({ myMemory, value }) => getDropShadow(value, myMemory)});
    box-shadow: inset ${({ myMemory, value }) => getBoxShadow(value, myMemory)};

    &:hover {
        filter: brightness(1.2) contrast(1.2) drop-shadow(${({ myMemory, value }) => getDropShadow(value, myMemory)});
        opacity: 1;
        border: ${({ myMemory, value }) => getBorder(value, myMemory)};
        box-shadow: inset ${({ myMemory, value }) => getBoxShadow(value, myMemory, true)};
    }
`;

const BigMemoryButton = styled(MemoryButton)`
    width: 5.5%;
    height: 60%;
`;

const ZeroSpan = styled.span`
    font-weight: bold;
    transform: translate(8%, 3%) skewX(8.5deg);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const StyledSpanOne = styled.span`
    transform: translate(-23%, 3.75%) skewX(8.5deg);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const StyledSpanOneBig = styled.span`
    transform: translate(-12%, 3.25%) skewX(8.5deg);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const StyledSpan = styled.span`
    transform: translate(5%, 5%) skewX(7.8deg);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

function getBorder(value: number, myMemory: number) {
    const borderConfig = "1px solid ";
    const borderConfigSelected = "2px solid ";

    if (value > 0) {
        if (value <= myMemory) return borderConfigSelected + "rgba(29,159,221,0.9)";
        else return borderConfig + "rgba(29,159,221,0.4)";
    }

    if (value === 0) {
        if (value === myMemory) return borderConfigSelected + "rgba(191,159,255,0.8)";
        else return borderConfig + "rgba(191,159,255,0.3)";
    }

    if (value < 0) {
        if (value >= myMemory) return borderConfigSelected + "rgba(255,81,118,0.8)";
        else return borderConfig + "rgba(255,81,118,0.3)";
    }
}

function getDropShadow(value: number, myMemory: number) {
    const shadowConfig = "0 0 2px ";

    if (value > 0) {
        if (value <= myMemory) return shadowConfig + "rgba(29,159,221,0.6)";
        else return shadowConfig + "rgba(29,159,221,0.15)";
    }

    if (value === 0) {
        if (value === myMemory) return shadowConfig + "rgba(95,54,138,0.6)";
        else return shadowConfig + "rgba(95,54,138,0.6)";
    }

    if (value < 0) {
        if (value >= myMemory) return shadowConfig + "rgba(255,81,118,0.6)";
        else return shadowConfig + "rgba(255,81,118,0.15)";
    }
}

function getBoxShadow(value: number, myMemory: number, hover?: boolean) {
    const shadowConfig = hover ? "0 0 7px 3px " : "1px 2px 5px 1px ";

    if (value > 0) {
        if (value <= myMemory) {
            if (hover) return "none";
            else return shadowConfig + "rgba(29,159,221,0.8)";
        } else return shadowConfig + "rgba(29,159,221,0.5)";
    }

    if (value === 0) {
        if (value === myMemory) {
            if (hover) return "none";
            else return shadowConfig + "rgba(255,255,255,0.4)";
        } else return shadowConfig + "rgba(255,255,255,0.25)";
    }

    if (value < 0) {
        if (value >= myMemory) {
            if (hover) return "none";
            else return shadowConfig + "rgba(255,81,118,0.7)";
        } else return shadowConfig + "rgba(255,81,118,0.4)";
    }
}
