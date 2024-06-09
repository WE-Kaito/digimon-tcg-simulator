import {useGame} from "../../hooks/useGame.ts";
import styled from "@emotion/styled";
import gradientImage from '../../assets/gradient.png';
import {useSound} from "../../hooks/useSound.ts";

type Props = {
    sendMemoryUpdate: (memory: number) => void;
    sendSfx: (sfx: string) => void;
    sendChatMessage: (message: string) => void;
}

export default function MemoryBar({sendMemoryUpdate, sendSfx, sendChatMessage}: Props) {

    const myMemory = useGame(state => state.myMemory);
    const setMemory = useGame(state => state.setMemory);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    function handleClick(memory: number) {
        const oldMemory = myMemory;
        setMemory(memory);
        sendChatMessage(`[FIELD_UPDATE]≔【MEMORY】﹕${oldMemory}±${memory}`);
        sendMemoryUpdate(memory);
        playButtonClickSfx();
        sendSfx("playButtonClickSfx");
    }

    return (
        <MemoryBarContainer>
            <BigMemoryButton onClick={() => handleClick(10)} value={10} myMemory={myMemory}><StyledSpanOne>10</StyledSpanOne></BigMemoryButton>

            <MemoryButton onClick={() => handleClick(9)} value={9} myMemory={myMemory}><StyledSpan>9</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(8)} value={8} myMemory={myMemory}><StyledSpan>8</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(7)} value={7} myMemory={myMemory}><StyledSpan>7</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(6)} value={6} myMemory={myMemory}><StyledSpan>6</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(5)} value={5} myMemory={myMemory}><StyledSpan>5</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(4)} value={4} myMemory={myMemory}><StyledSpan>4</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(3)} value={3} myMemory={myMemory}><StyledSpan>3</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(2)} value={2} myMemory={myMemory}><StyledSpan>2</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(1)} value={1} myMemory={myMemory}><StyledSpanOne>1</StyledSpanOne></MemoryButton>

            <ZeroMemoryButton onClick={() => handleClick(0)} value={0}  myMemory={myMemory}><ZeroSpan>0</ZeroSpan></ZeroMemoryButton>

            <MemoryButton onClick={() => handleClick(-1)} value={-1} myMemory={myMemory}><StyledSpanOne>1</StyledSpanOne></MemoryButton>
            <MemoryButton onClick={() => handleClick(-2)} value={-2} myMemory={myMemory}><StyledSpan>2</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-3)} value={-3} myMemory={myMemory}><StyledSpan>3</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-4)} value={-4} myMemory={myMemory}><StyledSpan>4</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-5)} value={-5} myMemory={myMemory}><StyledSpan>5</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-6)} value={-6} myMemory={myMemory}><StyledSpan>6</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-7)} value={-7} myMemory={myMemory}><StyledSpan>7</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-8)} value={-8} myMemory={myMemory}><StyledSpan>8</StyledSpan></MemoryButton>
            <MemoryButton onClick={() => handleClick(-9)} value={-9} myMemory={myMemory}><StyledSpan>9</StyledSpan></MemoryButton>

            <BigMemoryButton onClick={() => handleClick(-10)} value={-10} myMemory={myMemory}><StyledSpanOne>10</StyledSpanOne></BigMemoryButton>
        </MemoryBarContainer>
    );
}

const MemoryBarContainer = styled.div`
  height: 100px;
  width: 1270px;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const MemoryButton = styled.button<{myMemory: number, value: number}>`
  width: 40px;
  height: 40px;
  padding: 0;
  transition: all 0.2s ease;
  z-index: 200;

  display: flex;
  justify-content: center;
  align-items: center;

  font-family: alarm clock, sans-serif;
  font-size: 26px;
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
  width: 50px;
  height: 50px;
  font-size: 30px;
`;

const ZeroMemoryButton = styled(MemoryButton)`
  width: 50px;
  height: 50px;
  background-image: url(${gradientImage});
  background-size: cover;
  background-repeat: no-repeat;
`;

const ZeroSpan = styled.span`
  background: linear-gradient(to top right, black, black, black, black, black, black, white, white, white, white, white, white);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-size: 38px;
  font-weight: bold;
  transform: translateX(1.5px) skewX(7.8deg);
`;

const StyledSpanOne = styled.span`
transform: translate(-3px, 2px) skewX(7.8deg);
`;

const StyledSpan = styled.span`
  transform: translate(1px, 1px) skewX(7.8deg);
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
