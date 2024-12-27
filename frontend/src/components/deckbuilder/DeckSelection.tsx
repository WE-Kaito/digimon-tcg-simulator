import styled from "@emotion/styled";
import loadingAnimation from "../../assets/lotties/loading.json";
import Lottie from "lottie-react";
import {useStore} from "../../hooks/useStore.ts";
import {CardTypeWithId} from "../../utils/types.ts";
import Card from "../Card.tsx";
import {getCardTypeImage, sortCards} from "../../utils/functions.ts";
import {useSound} from "../../hooks/useSound.ts";

export default function DeckSelection() {
    const deckCards = useStore((state) => state.deckCards);
    const loadingDeck = useStore((state) => state.loadingDeck);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const addCardToDeck = useStore((state) => state.addCardToDeck);
    const deleteFromDeck = useStore((state) => state.deleteFromDeck);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);

    const digimonLength = deckCards.filter((card: CardTypeWithId) => card.cardType === "Digimon").length;
    const tamerLength = deckCards.filter((card: CardTypeWithId) => card.cardType === "Tamer").length;
    const optionLength = deckCards.filter((card: CardTypeWithId) => card.cardType === "Option").length;
    const eggLength = deckCards.filter((card: CardTypeWithId) => card.cardType === "Digi-Egg").length;

    const sortedDeck = sortCards(deckCards);
    const cardGroups: { [key: string]: CardTypeWithId[] } = {};
    sortedDeck.forEach((card) => {
        const uniqueCardNumber = card.uniqueCardNumber;
        if (!cardGroups[uniqueCardNumber]) {
            cardGroups[uniqueCardNumber] = [];
        }
        cardGroups[uniqueCardNumber].push(card);
    });

    const filteredDeckLength = deckCards.length - eggLength;
    const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085", "1110101"];
    function getAddAllowed(card: CardTypeWithId, lastIndex: boolean) {
        return !!hoverCard
            && ((hoverCard === card))
            && (filteredDeckLength < 50 || (card.cardType === "Digi-Egg" && eggLength < 5))
            && (lastIndex || cardsWithoutLimit.includes(card.cardNumber))
            && (deckCards.filter(c => c.cardNumber === card.cardNumber).length < 4
                || cardsWithoutLimit.includes(card.cardNumber))
    }

    function AddButton(card: CardTypeWithId) {
        if (card.cardNumber === "1110101") return <></>
        return <AddIcon
            onClick={() => {
                addCardToDeck(card.cardNumber, card.cardType, card.uniqueCardNumber);
                playPlaceCardSfx();
            }}
            onMouseEnter={() => setHoverCard(hoverCard)}
            onMouseLeave={() => setHoverCard(null)}
        >
            ➕
        </AddIcon>
    }

    function DeleteButton(cardId: string) {
        return <DeleteIcon
            onClick={() => {
                deleteFromDeck(cardId);
                playTrashCardSfx();
            }}
            onMouseEnter={() => setHoverCard(hoverCard)}
            onMouseLeave={() => setHoverCard(null)}
        >
            ❌
        </DeleteIcon>
    }

    return (
        <DeckContainer>

            <Stats>
                <StatContainer>
                    <StyledIcon src={getCardTypeImage("Digimon")} alt="Digimon: "/>
                    <StyledSpan>{digimonLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={getCardTypeImage("Tamer")} alt="Tamer: "/>
                    <StyledSpan>{tamerLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={getCardTypeImage("Option")} alt="Option: "/>
                    <StyledSpan>{optionLength}</StyledSpan>
                </StatContainer>

                <StatContainer>
                    <StyledIcon src={getCardTypeImage("Digi-Egg")} alt="Egg: "/>
                    <StyledSpan>{eggLength}</StyledSpan>
                </StatContainer>
            </Stats>

            <DeckList>
                <legend>[ {deckCards.length - eggLength}/50]</legend>
                <InnerDeckList>
                {!loadingDeck
                   ? Object.values(cardGroups).map((group, groupIndex) => {
                        return <GroupContainer key={groupIndex}>

                            {group.map((card: CardTypeWithId, index) => {
                                const isFrontCard = group.length === index + 1;
                                const countTransform = index >= 4 ? "translate(67px, 85px)" : "unset";
                                const countBGTransform = index >= 4 ? index < 9 ? "translate(69px, 89px)" :  "translate(63px, 80px)" : "unset";
                                if (index > 0) {
                                    if (group[index - 1]?.uniqueCardNumber === card.uniqueCardNumber) {
                                        const pos = index < 3 ? 4*index : 4*3;
                                        return <div key={card.id} style={{position: "absolute", left: pos, top: pos}}>
                                            {getAddAllowed(card, isFrontCard) && AddButton(card)}
                                            {(hoverCard?.id === card.id) && ( isFrontCard
                                                || cardsWithoutLimit.includes(card.cardNumber)) && DeleteButton(card.id)}
                                            {index < 4 && <Card card={card} location={"deck"}/>}
                                            {(group.length > 1) && isFrontCard && <CardstackCount style={{transform: countTransform}} length={group.length}>×{group.length}</CardstackCount>}
                                            {(group.length > 1) && isFrontCard && <CountBox style={{transform: countBGTransform}} length={group.length}/>}
                                        </div>
                                    }
                                }
                                return <div key={card.id} >
                                    {getAddAllowed(card, isFrontCard) && AddButton(card)}
                                    {(hoverCard?.id === card.id) && isFrontCard && DeleteButton(card.id)}
                                    <Card card={card} location={"deck"}/>
                                </div>
                            })}
                            </GroupContainer>
                    })
                    : <Lottie animationData={loadingAnimation} loop={true}
                              style={{width: "130px", marginLeft: "50%", transform: "translateX(-50%)"}}/>
                }
                </InnerDeckList>
            </DeckList>

        </DeckContainer>
    );
}

const GroupContainer = styled.div`
  position: relative;
  margin-right: 27px;
  height: fit-content;
  @media (max-width: 400px) and (min-height: 600px) {
    margin-right: 3px;
  }
`;

const CardstackCount = styled.span<{ length: number }>`
  position: absolute;
  top: 55%;
  left: ${props => props.length > 9 ? "63.5%" : "66%"};
  color: black;
  text-shadow: 0 0 3px #C71E78E5;
  font-size: 1.6em;
  z-index: 1000!important;
  pointer-events: none;
  @media (max-width: 400px) and (min-height: 600px) {
    top: 75px;
    left: 53px;
    font-size: 1.55em;
  }
`;

const CountBox = styled.div<{ length: number }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ghostwhite;
  position: absolute;
  top: 57%;
  left: ${props => props.length > 9 ? "70.75%" : "67%"};
  scale: ${props => props.length > 9 ? "1.15" : "unset"};
  z-index: 999;
  filter: drop-shadow(0 0 5px ghostwhite) blur(3px);
  pointer-events: none;
  @media (max-width: 400px) and (min-height: 600px) {
    top: 75px;
    left: 50px;
  }
`;

const DeckContainer = styled.div`
  background-color: rgba(40, 82, 67, 0.7);
  width: 97%;
  height: 100%;
  min-height: 340px;
  margin-left: 1.5%;
  margin-right: 1.5%;
  border-radius: 5px;
  transform: translateY(3px);
  gap: 2px;
  margin-top: 5px;

  display: flex;
  align-items: center;
  flex-direction: column;
  grid-area: deckselection;
  container-type: inline-size;
  container-name: deckcontainer;
  
  @container wrapper (max-width: 449px) {
    margin-top: 0;
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
  @container (max-width: 450px) {
    width: 35px;
  };
`;

const StyledSpan = styled.span`
  font-size: 25px;
  font-family: 'AwsumSans', sans-serif;
  @container wrapper (max-width: 450px) {
    font-size: 20px;
  };
`;

const InnerDeckList = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  height: fit-content;
  gap: 15px;
`;

const DeckList = styled.fieldset`
  width: 90%;
  height: 85%;
  border-radius: 5px;
  font-family: 'AwsumSans', sans-serif;
  font-style: italic;
  display: flex;
  justify-content: flex-start;
  overflow-y: scroll;
  overflow-x: hidden;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }
  
  &::-webkit-scrollbar {
    background-color: rgba(28, 58, 47, 0.98);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #C5C5C5;
    border-radius: 2px;
  }

 @container wrapper(max-width: 449px) { 
  margin-top: 0;
  width: 91.5%;

  &::-webkit-scrollbar {
    width: 5px;
  }
  }
  
  @media (max-height: 1030px) {
    height: 82%;
  }

  @media (max-height: 1030px) {
    height: 82%;
  }

  @media (max-height: 720px) {
    height: 75%;
  }
`;

const AddIcon = styled.div`
  font-size: 22px;
  position: absolute;
  z-index: 1;
  bottom: 3%;
  right: 4%;
  pointer-events: auto;
  transition: all 0.075s ease-in;
  filter: drop-shadow(0 0 1px #C71E78E5);
  user-select: none;

  &:hover {
    z-index: 1000;
    cursor: pointer;
    transform: scale(1.15);
    filter: drop-shadow(0 0 3px mediumaquamarine) brightness(1.35) saturate(1.2)
  }

  &:active {
    z-index: 1000;
    cursor: pointer;
    transform: scale(1.15);
    filter: drop-shadow(0 0 3px mediumaquamarine) sepia(100%) hue-rotate(90deg) saturate(1.5);
  }
  
  @media (max-width: 400px) and (min-height: 600px) {
    right: -5px;
    bottom: 65px;
    transform: scale(1.45);
    filter: drop-shadow(0 0 2px black) sepia(100%) hue-rotate(155deg) brightness(1.45) saturate(6);
    &:hover {
      filter: drop-shadow(0 0 2px black) sepia(100%) hue-rotate(155deg) brightness(1.45) saturate(6);
    }
    &:active {
      filter: drop-shadow(0 0 2px black) sepia(100%) hue-rotate(155deg) brightness(1.45) saturate(6);
    }
  }
`;

const DeleteIcon = styled(AddIcon)`
  right: 70%;
  @media (max-width: 400px) and (min-height: 600px) {
    right: 45px;
    bottom: 65px;
    transform: none;
    filter: drop-shadow(0 0 2px black);
    &:hover {
      transform: none;
      filter: drop-shadow(0 0 2px black);
    }
    &:active {
      transform: none;
      filter: drop-shadow(0 0 2px black);
    }
  }
`;
