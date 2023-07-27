import styled from "@emotion/styled";
import eggIcon from "../assets/cardtype_icons/egg.png";
import digimonIcon from "../assets/cardtype_icons/gammamon.png";
import tamerIcon from "../assets/cardtype_icons/tamer.png";
import optionIcon from "../assets/cardtype_icons/option.png";
import {useStore} from "../hooks/useStore.ts";
import {CardTypeWithId} from "../utils/types.ts";
import Card from "./Card.tsx";
import {useDrop} from "react-dnd";

type DraggedItem = {
    id: string,
    location: string,
    cardnumber: string,
    type: string
}

export default function DeckSelection() {

    const deckCards = useStore((state) => state.deckCards);
    const addCardToDeck = useStore((state) => state.addCardToDeck);

    const digimonLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digimon").length;
    const tamerLength = deckCards.filter((card: CardTypeWithId) => card.type === "Tamer").length;
    const optionLength = deckCards.filter((card: CardTypeWithId) => card.type === "Option").length;
    const eggLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digi-Egg").length;

    const [{isOver}, drop] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location, cardnumber, type} = item;
            addCardToDeck(id, location, cardnumber, type);
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
                <legend>[ {deckCards.length}/50]</legend>

                {deckCards?.length !== 0 ? deckCards.map((card: CardTypeWithId) => (
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