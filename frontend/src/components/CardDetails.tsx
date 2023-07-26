import DetailsOutline from "../assets/DetailsOutline.tsx";
import styled from "@emotion/styled";
import { css } from '@emotion/css';
import {useStore} from "../hooks/useStore.ts";
import {getBackgroundColor, getAttributeImage, getStrokeColor} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';

export default function CardDetails() {

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const currentAttr = hoverCard ? hoverCard.attribute : (selectedCard?.attribute || null)
    const currentDigiType = hoverCard ? hoverCard.digi_type : selectedCard?.digi_type;
    const longDigiType = currentDigiType && (currentDigiType?.length >= 14);
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
        <Container color={hoverCard?.color || selectedCard?.color || "default"}>
            <DetailsOutline/>
            <Name className={css`color:${strokeColor}`}>
                {hoverCard?.name || selectedCard?.name || null}
            </Name>

            {currentAttr && <Type src={getAttributeImage(currentAttr)} alt={currentAttr}/>}

            <PlayCost className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.play_cost : (selectedCard?.play_cost || null)}
            </PlayCost>

            <DP className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.dp : (selectedCard?.dp || null)}
            </DP>

            <DigivCost className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.evolution_cost : (selectedCard?.evolution_cost || null)}
            </DigivCost>

            <Level className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.level : (selectedCard?.level || null)}
            </Level>

            <Stage className={css`color:${strokeColor}`}>
                {hoverCard ? hoverCard.stage : (selectedCard?.stage || null)}
            </Stage>

            <DigiType className={css`
              color:${strokeColor};
              font-size: ${longDigiType ? 12 : 18}px;
              @media (max-width: 766px) {
                transform: scale(0.7) translateX(-12px) translateY(${longDigiType ? -9 : 4}px);
                line-height: 0.8;
              }
              @media (min-width: 767px) {
                transform: translateX(-50%) translateY(${longDigiType ? 9 : 2}px);
                font-size: ${longDigiType ? 12 : 21}px;
              }
            `}>
                {currentDigiType || null}
            </DigiType>


            <MainEffect
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
                    width: 475px;
                    height: 85px;
                  }
                `}> {highlightedMainEffect}</SimpleBar>
            </MainEffect>


            <SoureEffect
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
                    width: 475px;
                    height: 85px;
                  }
                `}> {highlightedSoureEffect}</SimpleBar>
            </SoureEffect>

        </Container>
    );
}

type ContainerProps = {
    color: string
}

const Container = styled.div<ContainerProps>`
  margin-left: 2px;
  margin-top: 8px;
  position: relative;
  width: 166px;
  height: 244px;
  border-radius: 5px;
  padding-top: 3px;

  background: ${({color}) => getBackgroundColor(color)};

  @media (min-width: 767px) {
    width: 500px;
    height: 398px;
    margin-top: 0;
  }
`
const StyledSpan = styled.span`
  position: absolute;
  font-family: 'Cousine', sans-serif;

`;

const Name = styled(StyledSpan)`
  top: 11px;
  left: 13px;
  font-size: 13px;
  max-width: 102px;
  max-height: 26px;
  overflow-x: scroll;
  overflow-y: hidden;

  @media (min-width: 767px) {
    max-width: 306px;
    overflow-x: hidden;
    font-size: 24px;
    left: 182px;
    transform: translateX(-50%) translateY(14px);
    max-height: 40px;
  }
`;

const Type = styled.img`
  position: absolute;
  width: 33px;
  right: 11px;
  top: 7px;
  @media (min-width: 767px) {
    width: 50px;
    right: 60px;
    top: 16px
  }
`;

const PlayCost = styled(StyledSpan)`
  left: 19px;
  top: 53px;
  @media (min-width: 767px) {
    left: 70px;
    top: 90px;
    font-size: 22px;
  }
`;

const DP = styled(StyledSpan)`
  left: 62px;
  top: 53px;
  @media (min-width: 767px) {
    left: 224px;
    top: 90px;
    font-size: 22px;
  }
`;

const DigivCost = styled(StyledSpan)`
  left: 133px;
  top: 53px;
  @media (min-width: 767px) {
    left: 410px;
    top: 90px;
    font-size: 22px;
  }

`;

const Level = styled(StyledSpan)`
  left: 19px;
  top: 92px;
  @media (min-width: 767px) {
    left: 70px;
    top: 150px;
    font-size: 22px;
  }
`;

const Stage = styled(StyledSpan)`
  left: 53.5px;
  top: 92px;
  font-size: 13px;

  @media (max-width: 766px) {
    max-width: 49.5px;
    overflow: hidden;
  }

  @media (min-width: 767px) {
    left: 232px;
    transform: translateX(-50%);
    top: 150px;
    font-size: 21px;
  }
`;

const DigiType = styled(StyledSpan)`
  left: 107px;
  top: 92px;
  @media (min-width: 767px) {
    left: 402px;
    width: 300px;
    top: 150px;
  }
`;

const StyledParagraph = styled.p`
  position: absolute;
  padding-top: 3px;
  font-family: 'Cousine', sans-serif;
  font-size: 12px;
  line-height: 0.95;
  top: 110px;
  left: 14px;
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
    top: 190px;
    
  }

`;

const MainEffect = styled(StyledParagraph)`

`;

const SoureEffect = styled(StyledParagraph)`
  top: 173px;

  @media (min-width: 767px) {
    top: 292.5px;
  }
`;
