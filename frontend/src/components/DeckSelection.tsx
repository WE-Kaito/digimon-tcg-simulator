import styled from "@emotion/styled";
import eggIcon from "../assets/cardtype_icons/egg.png";
import digimonIcon from "../assets/cardtype_icons/gammamon.png";
import tamerIcon from "../assets/cardtype_icons/tamer.png";
import optionIcon from "../assets/cardtype_icons/option.png";
import {useStore} from "../hooks/useStore.ts";
import {CardType} from "../utils/types.ts";
import Card from "./Card.tsx";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";
import gatchmon from "../assets/gatchmon.png";
import SimpleBar from "simplebar-react";
import {css} from "@emotion/css";

export default function DeckSelection() {

    const isLoading = useStore((state) => state.isLoading);
    const cards = useStore((state) => state.fetchedCards);
    //TODO replace cards with deckCards


    return (
        <DeckContainer>
            <Stats>
                <StatContainer>
                    <StyledIcon src={digimonIcon} alt="Digimon: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={tamerIcon} alt="Tamer: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={optionIcon} alt="Option: "/>
                    <StyledSpan>22</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={eggIcon} alt="Egg: "/>
                    <StyledSpan>5</StyledSpan>
                </StatContainer>
            </Stats>

            <DeckList>
                <legend>[ 06/50] </legend>

                {!isLoading ? cards?.map((card: CardType) => (
                        <Card key={card.cardnumber} card={card}/>
                    ))
                    :
                    <div>
                        <Lottie animationData={loadingAnimation} loop={true} style={{width: "90px"}}/>
                        <img alt="gatchmon" src={gatchmon} width={80} height={100}/>
                    </div>
                }

            </DeckList>

        </DeckContainer>

    );
}

const DeckContainer = styled.div`
  background-color: rgba(40, 82, 67, 0.985);
  width: 97%;
  margin-left: 1.5%;
  margin-right: 1.5%;
  border-radius: 5px;
  height: 99.5%;
  transform: translateY(3px);
  gap: 1px;

  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: 766px) {
    transform: translateY(-0.5px);
  };
`;

const Stats = styled.div`
  width: 100%;
  margin-top: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const StatContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled.img`
  width: 55px;
  @media (max-width: 766px) {
    width: 26px;
  };
`;

const StyledSpan = styled.span`
  font-size: 25px;
  font-family: 'AwsumSans', sans-serif;
  @media (max-width: 766px) {
    font-size: 10px;
  };
`;

const DeckList = styled.fieldset`
  width: 90%;
  height: 82.25%;
  max-height: 440px;
  border-radius: 5px;
  font-family: 'AwsumSans', sans-serif;

  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 11px;
  overflow-y: scroll;


  @media (max-width: 766px) {
    width: 82%;
    height: 84.5%;
    font-size: 10px;
  };
`;

