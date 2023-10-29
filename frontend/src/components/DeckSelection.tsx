import styled from "@emotion/styled";
import eggIcon from "../assets/cardtype_icons/egg.png";
import digimonIcon from "../assets/cardtype_icons/gammamon.png";
import tamerIcon from "../assets/cardtype_icons/tamer.png";
import optionIcon from "../assets/cardtype_icons/option.png";
import loadingAnimation from "../assets/lotties/loading.json";
import Lottie from "lottie-react";
import {useStore} from "../hooks/useStore.ts";
import {CardTypeWithId} from "../utils/types.ts";
import Card from "./Card.tsx";
import {sortCards} from "../utils/functions.ts";
import {playPlaceCardSfx, playTrashCardSfx} from "../utils/sound.ts";

export default function DeckSelection() {

    const deckCards = useStore((state) => state.deckCards);
    const loadingDeck = useStore((state) => state.loadingDeck);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const addCardToDeck = useStore((state) => state.addCardToDeck);
    const deleteFromDeck = useStore((state) => state.deleteFromDeck);

    const digimonLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digimon").length;
    const tamerLength = deckCards.filter((card: CardTypeWithId) => card.type === "Tamer").length;
    const optionLength = deckCards.filter((card: CardTypeWithId) => card.type === "Option").length;
    const eggLength = deckCards.filter((card: CardTypeWithId) => card.type === "Digi-Egg").length;

    const sortedDeck = sortCards(deckCards);
    const cardGroups: { [key: string]: CardTypeWithId[] } = {};
    sortedDeck.forEach((card) => {
        const cardnumber = card.cardnumber;
        if (!cardGroups[cardnumber]) {
            cardGroups[cardnumber] = [];
        }
        cardGroups[cardnumber].push(card);
    });

    const filteredDeckLength = deckCards.length - eggLength;
    const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
    function getAddAllowed(card: CardTypeWithId, lastIndex: boolean) {
        return !!hoverCard
            && ((hoverCard === card))
            && (filteredDeckLength < 50 || (card.type === "Digi-Egg" && eggLength < 5))
            && (lastIndex || cardsWithoutLimit.includes(card.cardnumber))
            && (deckCards.filter(c => c.cardnumber === card.cardnumber).length < 4
                || cardsWithoutLimit.includes(card.cardnumber))
    }

    function AddButton(card: CardTypeWithId) {
        return <AddIcon
            onClick={() => {
                addCardToDeck(card.cardnumber, card.type);
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
                <InnerDeckList>
                {!loadingDeck
                   ? Object.values(cardGroups).map((group, groupIndex) => {
                        return <GroupContainer key={groupIndex}>
                            {(group.length > 1) && <CardstackCount>×{group.length}</CardstackCount>}
                            {(group.length > 1) && <CountBox/>}
                            {group.map((card: CardTypeWithId, index) => {
                                if (index > 0) {
                                    if (group[index - 1]?.cardnumber === card.cardnumber) {
                                        if (group[index - 4]?.cardnumber === card.cardnumber) return;
                                        return <div key={card.id} style={{position: "absolute", left: 4*index, top: 4*index}}>
                                            {getAddAllowed(card, group.length === index + 1) && AddButton(card)}
                                            {(hoverCard?.id === card.id) && (group.length === index + 1
                                                || cardsWithoutLimit.includes(card.cardnumber)) && DeleteButton(card.id)}
                                            <Card card={card} location={"deck"}/>
                                        </div>
                                    }
                                }
                                return <div key={card.id} >
                                    {getAddAllowed(card, group.length === index + 1) && AddButton(card)}
                                    {(hoverCard?.id === card.id) && (group.length === index + 1) && DeleteButton(card.id)}
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

const CardstackCount = styled.span`
  position: absolute;
  top: 83px;
  left: 70px;
  color: black;
  text-shadow: 0 0 3px #C71E78E5;
  font-size: 1.6em;
  z-index: 1000;
  pointer-events: none;
  @media (max-width: 400px) and (min-height: 600px) {
    top: 75px;
    left: 53px;
    font-size: 1.55em;
  }
`;

const CountBox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ghostwhite;
  position: absolute;
  top: 89px;
  left: 74px;
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
  margin-left: 1.5%;
  margin-right: 1.5%;
  border-radius: 5px;
  height: 92%;
  transform: translateY(3px);
  gap: 2px;
  margin-top: 5px;

  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: 400px) and (min-height: 600px) {
    height: 100%;
    max-height: 51.5vh;
  }

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
    height: 79.25%;
    background-color: rgba(40, 82, 67, 0.7);
  }

  @media (min-width: 1500px) and (min-height: 1100px) {
    height: 81.5%;
    background-color: rgba(40, 82, 67, 0.7);
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

const InnerDeckList = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  height: fit-content;
  gap: 15px;
`;

const DeckList = styled.fieldset`
  width: 90%;
  height: 82.25%;
  max-height: 82.25%;
  border-radius: 5px;
  font-family: 'AwsumSans', sans-serif;
  font-style: italic;
  display: flex;
  justify-content: flex-start;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;

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
    &::-webkit-scrollbar {
      width: 3px;
    }
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
    height: 86.25%;
    max-height: 86.25%;
  }

  @media (min-width: 2000px) {
    transform: translateY(10px);
  }
`;

const AddIcon = styled.div`
  font-size: 22px;
  position: absolute;
  z-index: 1;
  bottom: 5px;
  right: 6px;
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
  right: 67px;
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
