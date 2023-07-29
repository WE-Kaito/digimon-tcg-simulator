import {CardType, DeckType} from "../utils/types.ts";
import styled from "@emotion/styled";
import deckBack from '../assets/deckBack.png';

function ColoredDeckImage(color:string | null) {
    switch (color) {
        case "Black":
            return <BlackDeckImage src={deckBack}/>;
        case "White":
            return <WhiteDeckImage src={deckBack}/>;
        case "Blue":
            return <BlueDeckImage src={deckBack}/>;
        case "Green":
            return <GreenDeckImage src={deckBack}/>;
        case "Purple":
            return <PurpleDeckImage src={deckBack}/>;
        case "Red":
            return <RedDeckImage src={deckBack}/>;
        case "Yellow":
            return <YellowDeckImage src={deckBack}/>;
        default:
            return <DeckImage src={deckBack}/>;
    }
}

export default function ProfileDeck({deck}:{deck:DeckType}) {

    const findMostFrequentColor = (cards: CardType[]) => {
        const colorOccurrences = {};

        for (const element of cards) {
            const color = element.color;
            // @ts-ignore
            if (colorOccurrences[color]) {
                // @ts-ignore
                colorOccurrences[color]++;
            } else {
                // @ts-ignore
                colorOccurrences[color] = 1;
            }
        }

        let mostFrequentColor = null;
        let maxOccurrences = 0;

        for (const color in colorOccurrences) {
            // @ts-ignore
            if (colorOccurrences[color] > maxOccurrences) {
                mostFrequentColor = color;
                // @ts-ignore
                maxOccurrences = colorOccurrences[color];
            }
        }

        return mostFrequentColor;
    };


    return (
        <Container>
            <DeckName>{deck.name}</DeckName>
            <ActiveButton>Active</ActiveButton>
            {deck.cards ?  ColoredDeckImage(findMostFrequentColor(deck.cards)) : null}
        </Container>
    );
}

const Container = styled.div`
  width: 220px;
  height: 105px;

  padding: 8px;
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:'deck name name'
                        'deck button button';
  background-color: rgba(255, 255, 255, 0.025);
  border-radius: 10px;

  @media (max-width: 500px) {
    width: 160px;
    padding: 6px;
    margin: 6px;
  }

`;

const ActiveButton = styled.button`
  grid-area: button;
  background: #a61515;
  margin:10px;
  @media (max-width: 500px) {
    margin: 2px;
  }
`;

const DeckName = styled.span`
  grid-area: name;
  font-family: 'Sansation', sans-serif;
`;


const DeckImage = styled.img`
width: 75px;  
  grid-area: deck;
`;

const BlackDeckImage = styled(DeckImage)`
  filter:grayscale(100%) brightness(50%) contrast(200%);
`;

const WhiteDeckImage = styled(DeckImage)`
    filter: saturate(0%) brightness(140%);
`;

const PurpleDeckImage = styled(DeckImage)`
    filter: hue-rotate(20deg) brightness(90%) contrast(140%) saturate(120%)
`;

const BlueDeckImage = styled(DeckImage)`
    filter: hue-rotate(-5deg) brightness(110%) contrast(140%) saturate(180%);
`;

const GreenDeckImage = styled(DeckImage)`
    filter: hue-rotate(-90deg) saturate(120%) brightness(110%) contrast(100%);
`;

const YellowDeckImage = styled(DeckImage)`
    filter: hue-rotate(162deg) saturate(180%) brightness(120%);
`;

const RedDeckImage = styled(DeckImage)`
  filter: hue-rotate(120deg) saturate(130%);
`;