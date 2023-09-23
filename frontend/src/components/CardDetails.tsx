import DetailsOutline from "../assets/DetailsOutline.tsx";
import styled from "@emotion/styled";
import { css } from '@emotion/css';
import {useStore} from "../hooks/useStore.ts";
import {getBackgroundColor, getAttributeImage, getStrokeColor} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';
import {useLocation} from "react-router-dom";

export default function CardDetails() {

    const location = useLocation();
    const inGame = location.pathname === "/game";

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const currentAttr = hoverCard ? hoverCard.attribute : (selectedCard?.attribute || null)
    const currentDigiType = hoverCard ? hoverCard.digi_type : selectedCard?.digi_type;
    const longDigiType = currentDigiType && (currentDigiType?.length >= 14);
    const longName = hoverCard ? (hoverCard.name?.length >= 14) : (selectedCard && (selectedCard?.name.length >= 14));
    const strokeColor = getStrokeColor(hoverCard, selectedCard);
    const mainEffectText = hoverCard ? (hoverCard.maineffect ?? "") : (selectedCard?.maineffect ?? "");
    const soureEffectText = hoverCard ? (hoverCard.soureeffect ?? "") : (selectedCard?.soureeffect ?? "");

    const [highlightedMainEffect, setHighlightedMainEffect] = useState<any>("");
    const [highlightedSoureEffect, setHighlightedSoureEffect] = useState<any>("");
    useEffect(() => {
        setHighlightedMainEffect(highlightBracketedWords(mainEffectText));
        setHighlightedSoureEffect(highlightBracketedWords(soureEffectText));
    }, [selectedCard, hoverCard]);


    function highlightBracketedWords(text:string) {
        const regex = /(\[([^\]]+)\]|＜([^＞]+)＞)/g;
        let match;
        let lastIndex = 0;
        const highlightedParts = [];

        while ((match = regex.exec(text)) !== null) {
            const prefix = text.slice(lastIndex, match.index);
            const bracketedWord = match[0];

            highlightedParts.push(prefix);

            if (bracketedWord[0] === '[') {
                highlightedParts.push(
                    <span className="highlight-square" key={highlightedParts.length}>
          {" " + match[2] + " "}
        </span>
                );
            } else {
                highlightedParts.push(
                    <span className="highlight-angle" key={highlightedParts.length}>
          {" " + match[3] + " "}
        </span>
                );
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            highlightedParts.push(text.slice(lastIndex));
        }

        return highlightedParts;
    }

    return (
        <Container inGame={inGame} color={hoverCard?.color || selectedCard?.color || "default"}>
            <DetailsOutline/>
            <Name longName={longName} inGame={inGame} className={css`color:${strokeColor};`}>
                {hoverCard?.name || selectedCard?.name || null}
            </Name>

            <CardNumber inGame={inGame}  className={css`color:${strokeColor};`}>
                {hoverCard ? hoverCard.cardnumber : (selectedCard?.cardnumber || null)}
            </CardNumber>

            {currentAttr && <Type inGame={inGame} src={getAttributeImage(currentAttr)} alt={currentAttr}/>}

            <PlayCost inGame={inGame} className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.play_cost : (selectedCard?.play_cost || null)}
            </PlayCost>

            <DP inGame={inGame} className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.dp : (selectedCard?.dp || null)}
            </DP>

            <DigivCost inGame={inGame} className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.evolution_cost : (selectedCard?.evolution_cost || null)}
            </DigivCost>

            <Level inGame={inGame} className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.level : (selectedCard?.level || null)}
            </Level>

            <Stage inGame={inGame} className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.stage : (selectedCard?.stage || null)}
            </Stage>

            <DigiType inGame={inGame} className={css`
              color:${strokeColor};
              font-size: ${longDigiType ? 12 : 18}px;
              @media (max-width: 766px) {
                transform: scale(0.7) translateX(-12px) translateY(${longDigiType ? -9 : 4}px);
                line-height: 0.8;
              }
              @media (min-width: 767px) {
                transform: translateX(-50%) translateY(${longDigiType ? 9 : 2}px);
                font-size: ${longDigiType ? `${inGame?8:12}` : `${inGame?16:21}`}px;
              }
            `}>
                {currentDigiType || null}
            </DigiType>


            <MainEffect
                inGame={inGame}
                className={css`color:${strokeColor}`}
            >
                <SimpleBar
                    className={css`
                  width: 145px;
                  height: 45px;
                  overflow-y: scroll;
                  overflow-x: hidden;
                  ::-webkit-scrollbar {
                    display: none;
                  }
                  @media (min-width: 767px) {
                    width: ${inGame ? "290px" : "475px"};
                    height: ${inGame ? "100px" : "85px"};
                  }
                `}> {highlightedMainEffect}</SimpleBar>
            </MainEffect>


            <SoureEffect
                inGame={inGame}
                className={css`color:${strokeColor}`}
            >
                <SimpleBar
                    className={css`
                  width: 145px;
                  height: 45px;
                  overflow-y: scroll;
                  overflow-x: hidden;
                  ::-webkit-scrollbar {
                    display: none;
                  }
                  @media (min-width: 767px) {
                    width: ${inGame ? "290px" : "475px"};
                    height: ${inGame ? "94px" : "85px"};
                  }
                `}> {highlightedSoureEffect}</SimpleBar>
            </SoureEffect>

        </Container>
    );
}

type ContainerProps = {
    color: string
    inGame: boolean
}

const Container = styled.div<ContainerProps>`
  margin-left: 2px;
  margin-top: 8px;
  position: relative;
  width: 166px;
  height: ${({inGame}) => inGame ? 500 : 244}px;
  border-radius: ${({inGame}) => inGame ? 12 : 5}px;
  padding-top: 3px;
  max-width: 100%;

  background: ${({color}) => getBackgroundColor(color)};

  @media (min-width: 767px) {
    width: 500px;
    height: ${({inGame}) => inGame ? 462 : 398}px;
    margin-top: 0;
  }
`
const StyledSpan = styled.span`
  position: absolute;
  font-family: 'Cousine', sans-serif;
`;

const Name = styled(StyledSpan)<{inGame:boolean, longName:boolean|null}>`
  top: ${({longName}) => longName ? 6 : 11}px;
  left: 13px;
  font-size: 13px;
  max-width: 102px;
  max-height: 26px;
  overflow-x: scroll;
  overflow-y: hidden;

  @media (min-width: 767px) {
    max-width: ${({inGame}) => inGame ? 200 : 306}px;
    overflow-x: hidden;
    font-size: ${({longName}) => longName ? 17 : 24}px;
    left: ${({inGame}) => inGame ? 10 : 182}px;
    transform: ${({inGame}) => inGame ? "translateY(8px)" : "translateX(-50%) translateY(14px)"};
    max-height: ${({inGame}) => inGame ? 50 : 40}px;
  }
`;

const CardNumber = styled(StyledSpan)<{inGame:boolean}>`
  left: 100px;
  top: 45px;
  font-size: 10px;
  max-width: 102px;
  max-height: 26px;
  visibility: hidden;

  @media (min-width: 767px) {
    visibility: visible;
    max-width: ${({inGame}) => inGame ? 200 : 306}px;
    left: ${({inGame}) => inGame ? 165 : 250}px;
    transform: ${({inGame}) => inGame ? "translateY(8px)" : "translateX(50px) translateY(6px)"};
    max-height: ${({inGame}) => inGame ? 50 : 40}px;
  }
`;

const Type = styled.img<{inGame:boolean}>`
  position: absolute;
  width: 33px;
  right: 11px;
  top: 7px;
  @media (min-width: 767px) {
    width: 50px;
    right: ${({inGame}) => inGame ? 20 : 60}px;
    top: ${({inGame}) => inGame ? 10 : 16}px;
  }
`;

const PlayCost = styled(StyledSpan)<{inGame:boolean}>`
  left: 19px;
  top: 53px;
  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 35 : 70}px;
    top: ${({inGame}) => inGame ? 100 : 90}px;
    font-size: 22px;
  }
`;

const DP = styled(StyledSpan)<{inGame:boolean}>`
  left: 62px;
  top: 53px;
  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 132 : 224}px;
    top: ${({inGame}) => inGame ? 100 : 90}px;
    font-size: 22px;
  }
`;

const DigivCost = styled(StyledSpan)<{inGame:boolean}>`
  left: 133px;
  top: 53px;
  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 258 : 410}px;
    top: ${({inGame}) => inGame ? 100 : 90}px;
    font-size: 22px;
  }

`;

const Level = styled(StyledSpan)<{inGame:boolean}>`
  left: 19px;
  top: 92px;
  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 35 : 70}px;
    top: ${({inGame}) => inGame ? 175 : 150}px;
    font-size: 22px;
  }
`;

const Stage = styled(StyledSpan)<{inGame:boolean}>`
  left: 53.5px;
  top: 92px;
  font-size: 13px;

  @media (max-width: 766px) {
    max-width: 49.5px;
    overflow: hidden;
  }

  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 142 : 232}px;
    transform: translateX(-50%);
    top: ${({inGame}) => inGame ? 178 : 150}px;
    font-size: ${({inGame}) => inGame ? 16 : 21}px;
  }
`;

const DigiType = styled(StyledSpan)<{inGame:boolean}>`
  left: 107px;
  top: 92px;
  @media (min-width: 767px) {
    left: ${({inGame}) => inGame ? 255 : 402}px;
    width: 300px;
    top: ${({inGame}) => inGame ? 178 : 150}px;
  }
`;

const StyledParagraph = styled.p<{inGame:boolean}>`
  position: absolute;
  padding-top: 3px;
  font-family: 'Cousine', sans-serif;
  font-size: 12px;
  line-height: 0.95;
  top: 110px;
  left: ${({inGame}) => inGame ? 8 : 14}px;
  text-align: left;
  max-width: 80px;
  max-height: 49px;

  .highlight-square {
    color: #e7e7e7;
    background: #535bf2;
    border-radius: 3px;
    display: inline-block;
    padding-top: 2px;
  }

  .highlight-angle {
    color: #e7e7e7;
    background: #b64602;
    border-radius: 3px;
    display: inline-block;
    padding-top: 2px;
  }

  @media (min-width: 767px) {
    max-width: 470px;
    font-size: 13px;
    line-height: 1;
    top: ${({inGame}) => inGame ? 229 : 190}px;
    
  }

`;

const MainEffect = styled(StyledParagraph)<{inGame:boolean}>`

`;

const SoureEffect = styled(StyledParagraph)<{inGame:boolean}>`
  top: 173px;

  @media (min-width: 767px) {
    top: ${({inGame}) => inGame ? 353:  292.5}px;
  }
`;
