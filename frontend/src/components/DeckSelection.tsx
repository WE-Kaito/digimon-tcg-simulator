import styled from "@emotion/styled";
import eggIcon from "../assets/cardtype_icons/egg.png";
import digimonIcon from "../assets/cardtype_icons/gammamon.png";
import tamerIcon from "../assets/cardtype_icons/tamer.png";
import optionIcon from "../assets/cardtype_icons/option.png";
import {useStore} from "../hooks/useStore.ts";
import {CardTypeWithId, DraggedItem} from "../utils/types.ts";
import Card from "./Card.tsx";
import {useDrop} from "react-dnd";
import {playPlaceCardSfx} from "../utils/sound.ts";
import {sortCards} from "../utils/functions.ts";

export default function DeckSelection() {

    const deckCards = useStore((state) => state.deckCards);
    const addCardToDeck = useStore((state) => state.addCardToDeck);

    const digimonLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digimon").length;
    const tamerLength = deckCards.filter((card: CardTypeWithId) => card.type === "Tamer").length;
    const optionLength = deckCards.filter((card: CardTypeWithId) => card.type === "Option").length;
    const eggLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digi-Egg").length;

    const [, drop] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, cardnumber, type} = item;
            addCardToDeck(id, location, cardnumber, type);
            playPlaceCardSfx();
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <DeckContainer ref={drop}>

            <Stats>
                <StatContainer>
                    <StyledIcon src={digimonIcon} alt="Digimon: "/>
                    <StyledSpan>{digimonLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={tamerIcon} alt="Tamer: "/>
                    <StyledSpan>{tamerLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={optionIcon} alt="Option: "/>
                    <StyledSpan>{optionLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={eggIcon} alt="Egg: "/>
                    <StyledSpan>{eggLength}</StyledSpan>
                </StatContainer>
            </Stats>

            <DeckList>
                <legend>[ {deckCards.length - eggLength}/50]</legend>

                {deckCards?.length !== 0 ? sortCards(deckCards).map((card: CardTypeWithId) => (
                        <Card key={card.id} card={card} location={"deck"}/>
                    ))
                    :
                    <span>
                        DROP CARDS HERE
                    </span>
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
  height: 92%;
  transform: translateY(3px);
  gap: 1px;
  margin-top: 5px;

  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: 766px) {
    transform: translateY(-0.5px);
  };

  @media (max-width: 700px) and (min-height: 800px) {
    max-height: 477.5px;
  }

  @media (max-width: 700px) and (min-height: 840px) {
    max-height: 492px;
  }

  @media (max-width: 700px) and (min-height: 900px) {
    max-height: 580px;
  }

  @media (min-width: 767px) {
    height: 94%;
  }

  @media (min-width: 1000px) {
    height: 96%;
    background-color: rgba(40, 82, 67, 0.825);
  }
`;

const Stats = styled.div`
  width: 100%;
  margin-top: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  @media (min-width: 2000px) {
    transform: scale(1.1) translateY(6px);
  }
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
  max-height: 82.25%;
  border-radius: 5px;
  font-family: 'AwsumSans', sans-serif;
  font-style: italic;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 11px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    background-color: rgba(28, 58, 47, 0.98);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #C5C5C5;
    border-radius: 2px;
  }

  @media (max-width: 766px) {
    width: 83.5%;
    font-size: 10px;
    gap: 9px;
  };

  @media (max-height: 765px) {
    max-height: 85.5%;
    height: 85.5%;
  }

  @media (max-height: 668px) {
    height: 84.75%;
    max-height: 84.75%;
  }

  @media (max-width: 700px) and (min-height: 800px) {
    height: 87%;
    max-height: 87%;
  }

  @media (max-width: 700px) and (min-height: 900px) {
    height: 90%;
    max-height: 90%;
  }

  @media (min-width: 767px) {
    height: 80%;
    max-height: 80%;
  }

  @media (min-width: 1000px) {
    height: 88.75%;
    max-height: 88.75%;
  }

  @media (min-width: 2000px) {
    transform: translateY(10px);
  }

`;
