import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import styled from "@emotion/styled";
import gradientImage from '../../assets/gradient.png';
import {useSound} from "../../hooks/useSound.ts";
import {WSUtils} from "../../pages/GamePage.tsx";
import useResponsiveFontSize from "../../hooks/useResponsiveFontSize.ts";

export default function MemoryBar({wsUtils}: { wsUtils?: WSUtils }) {
    const myMemory = useGameBoardStates(state => state.myMemory);
    const setMemory = useGameBoardStates(state => state.setMemory);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    function handleClick(memory: number) {
        setMemory(memory);
        playButtonClickSfx();
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【MEMORY】﹕${myMemory}±${memory}`);
        wsUtils?.sendMessage(`${wsUtils.matchInfo.gameId}:/updateMemory:${wsUtils.matchInfo.opponentName}:${memory}`)
        wsUtils?.sendSfx("playButtonClickSfx");
    }

    const {fontContainerRef, fontSize} = useResponsiveFontSize(33)
    const bigFontSize = fontSize * 1.3;

    return (
        <MemoryBarContainer ref={fontContainerRef}>
            <BigMemoryButton onClick={() => handleClick(10)} value={10} myMemory={myMemory} fontSize={bigFontSize}><StyledSpanOneBig>10</StyledSpanOneBig></BigMemoryButton>

            <MemoryButton onClick={() => handleClick(9)} value={9} myMemory={myMemory} fontSize={fontSize}><StyledSpan>9</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(8)} value={8} myMemory={myMemory} fontSize={fontSize}><StyledSpan>8</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(7)} value={7} myMemory={myMemory} fontSize={fontSize}><StyledSpan>7</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(6)} value={6} myMemory={myMemory} fontSize={fontSize}><StyledSpan>6</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(5)} value={5} myMemory={myMemory} fontSize={fontSize}><StyledSpan>5</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(4)} value={4} myMemory={myMemory} fontSize={fontSize}><StyledSpan>4</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(3)} value={3} myMemory={myMemory} fontSize={fontSize}><StyledSpan>3</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(2)} value={2} myMemory={myMemory} fontSize={fontSize}><StyledSpan>2</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(1)} value={1} myMemory={myMemory} fontSize={fontSize}><StyledSpanOne>1</StyledSpanOne></MemoryButton>

            <ZeroMemoryButton onClick={() => handleClick(0)} value={0}  myMemory={myMemory} fontSize={bigFontSize}><ZeroSpan>0</ZeroSpan></ZeroMemoryButton>

            <MemoryButton onClick={() => handleClick(-1)} value={-1} myMemory={myMemory} fontSize={fontSize}><StyledSpanOne>1</StyledSpanOne></MemoryButton>
            <MemoryButton onClick={() => handleClick(-2)} value={-2} myMemory={myMemory} fontSize={fontSize}><StyledSpan>2</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-3)} value={-3} myMemory={myMemory} fontSize={fontSize}><StyledSpan>3</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-4)} value={-4} myMemory={myMemory} fontSize={fontSize}><StyledSpan>4</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-5)} value={-5} myMemory={myMemory} fontSize={fontSize}><StyledSpan>5</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-6)} value={-6} myMemory={myMemory} fontSize={fontSize}><StyledSpan>6</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-7)} value={-7} myMemory={myMemory} fontSize={fontSize}><StyledSpan>7</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-8)} value={-8} myMemory={myMemory} fontSize={fontSize}><StyledSpan>8</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-9)} value={-9} myMemory={myMemory} fontSize={fontSize}><StyledSpan>9</StyledSpan></MemoryButton>

            <BigMemoryButton onClick={() => handleClick(-10)} value={-10} myMemory={myMemory} fontSize={bigFontSize}><StyledSpanOneBig>10</StyledSpanOneBig></BigMemoryButton>
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
  grid-column: 4 / 26; // of 35
  grid-row: 7 / 9; // of 14
`;

const MemoryButton = styled.button<{myMemory: number, value: number, fontSize: number}>`
  width: 4%;
  height: 38%;
  padding: 0;
  transition: all 0.2s ease;
  z-index: 200;

  display: flex;
  justify-content: center;
  align-items: center;

  font-family: alarm clock, sans-serif;
  font-size: ${({fontSize}) => fontSize}px;
  text-shadow: ${({value}) => value > 0 ? "0 0 1px #0c0c0c" : "none"};
  font-weight: bold;

  border-radius: 50%;
  border: ${({myMemory, value}) => getBorder(value, myMemory)};

  opacity: ${({myMemory, value}) => myMemory === value ? "1" : "0.8"};

  background-color: ${({value}) => value > 0 ? "#ECECEC" : "#0a0a0a"};
  color: ${({value}) => value > 0 ? "#0a0a0a" : "#ECECEC"};
  
  filter: drop-shadow(${({myMemory, value}) => getGlow(value, myMemory)});
  box-shadow: inset ${({myMemory, value}) => getInnerGlow(value, myMemory)};

  &:hover {
    filter: brightness(1.2) contrast(1.2) drop-shadow(0 0 3px #1ce0be);
    opacity: 1;
    border: ${({myMemory, value}) => getHoverBorder(value, myMemory)};
  }
`;

const BigMemoryButton = styled(MemoryButton)`
  width: 5.5%;
  height: 50.5%;
`;

const ZeroMemoryButton = styled(BigMemoryButton)`
  background-image: url(${gradientImage});
  background-size: cover;
  background-repeat: no-repeat;
`;

const ZeroSpan = styled.span`
  background: linear-gradient(to top right, black, black, black, black, black, black, white, white, white, white, white, white);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
  transform: translate(5%, 3%) skewX(8.5deg);
`;

const StyledSpanOne = styled.span`
  transform: translate(-23%, 3.75%) skewX(8.5deg);
`;

const StyledSpanOneBig = styled.span`
  transform: translate(-12%, 3.25%) skewX(8.5deg);
`;

const StyledSpan = styled.span`
  transform: translate(5%, 5%) skewX(7.8deg);
`;

function getBorder(value: number, myMemory:number) {
    if(value === myMemory && value > 0) {
        return "3px solid #1d9fdd";
    }

    if(value === myMemory && value === 0) {
        return "3px solid #ead15c";
    }

    if (value === myMemory) {
        return "3px solid crimson";
    }
    return "none";
}

function getHoverBorder(value: number, myMemory:number) {
    if(value === myMemory && value > 0) {
        return "2px solid #1d9fdd";
    }

    if(value === myMemory && value === 0) {
        return "2px solid #ead15c";
    }

    if (value === myMemory) {
        return "2px solid crimson";
    }
    return "none";
}

function getGlow(value: number, myMemory:number) {
    if(value === myMemory && value > 0) {
        return "0 0 3px #1d9fdd";
    }

    if(value === myMemory && value === 0) {
        return "0 0 3px #ead15c";
    }

    if (value === myMemory) {
        return "0 0 3px crimson";
    }
    return "none";
}

function getInnerGlow(value: number, myMemory:number) {
    if(value === myMemory && value > 0) {
        return "0 0 2px #1d9fdd";
    }

    if(value === myMemory && value === 0) {
        return "0 0 2px #ead15c";
    }

    if (value === myMemory) {
        return "0 0 2px crimson";
    }
    return "none";
}
