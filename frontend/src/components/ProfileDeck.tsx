import {CardType, DeckType} from "../utils/types.ts";
import styled from "@emotion/styled";
import deckBack from '../assets/deckBack.png';
import {useNavigate} from "react-router-dom";
import {useStore} from "../hooks/useStore.ts";
import {playButtonClickSfx, playDrawCardSfx} from "../utils/sound.ts";

function ColoredDeckImage(color:string | null, id: string) {

    const navigate = useNavigate();
    const navigateToDeck = () => {
        playDrawCardSfx();
        navigate(`/update-deck/${id}`);
    }

    switch (color) {
        case "Black":
            return <BlackDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "White":
            return <WhiteDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "Blue":
            return <BlueDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "Green":
            return <GreenDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "Purple":
            return <PurpleDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "Red":
            return <RedDeckImage onClick={navigateToDeck} src={deckBack}/>;
        case "Yellow":
            return <YellowDeckImage onClick={navigateToDeck} src={deckBack}/>;
        default:
            return <DeckImage onClick={navigateToDeck} src={deckBack}/>;
    }
}

export default function ProfileDeck({deck}:{deck:DeckType}) {

    const setActiveDeck = useStore(state => state.setActiveDeck);
    const activeDeckId = useStore(state => state.activeDeckId);


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

    const isActiveDeck = deck.id === activeDeckId;

    return (
        <Container>
            <DeckName longName={deck.name.length >= 15}>{deck.name}</DeckName>
            <ActiveButton style={{backgroundColor: isActiveDeck ? "lightcyan" : "black", color: isActiveDeck ? "black" : "white"}}
            onClick={() => {
                playButtonClickSfx();
                setActiveDeck(deck.id);
            }}>Active</ActiveButton>
           {deck.cards ?  ColoredDeckImage(findMostFrequentColor(deck.cards), deck.id) : null}
        </Container>
    );
}

const Container = styled.div`
  position: relative;
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
  padding: 0;
  margin: 20px;
  @media (max-width: 500px) {
    margin: 2px;
    transform: scale(0.725);
  }

  border-bottom: 1px solid #131313;
  border-right: 1px solid #131313;

  cursor: pointer;
  width: 100px;
  height: 40px;
  border-radius: 0;
  background: #D9D9D9;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 22px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

const DeckName = styled.span<{longName:boolean}>`
  grid-area: name;
  font-family: 'Sansation', sans-serif;
  font-size: ${props => props.longName ? "12px" : "16px"};
  
  position: absolute;
  width: 130px;
  left: 18px;
  top: 4px;
  text-align: left;
`;


const DeckImage = styled.img`
width: 75px;  
  grid-area: deck;
  :hover {
    cursor: pointer;
  }
`;

const BlackDeckImage = styled(DeckImage)`
  filter:grayscale(100%) brightness(50%) contrast(200%);
    :hover {
    filter:grayscale(100%) brightness(50%) contrast(200%) drop-shadow(0 0 3px #fff)
    }
`;

const WhiteDeckImage = styled(DeckImage)`
    filter: saturate(0%) brightness(140%);
    :hover {
    filter: saturate(0%) brightness(140%) drop-shadow(0 0 3px #fff)
    }
`;

const PurpleDeckImage = styled(DeckImage)`
    filter: hue-rotate(20deg) brightness(90%) contrast(140%) saturate(120%);
    :hover {
    filter: hue-rotate(20deg) brightness(90%) contrast(140%) saturate(120%) drop-shadow(0 0 3px #fff)
    }
`;

const BlueDeckImage = styled(DeckImage)`
    filter: hue-rotate(-5deg) brightness(110%) contrast(140%) saturate(180%);
    :hover {
    filter: hue-rotate(-5deg) brightness(110%) contrast(140%) saturate(180%) drop-shadow(0 0 3px #fff)
    }
`;

const GreenDeckImage = styled(DeckImage)`
    filter: hue-rotate(-90deg) saturate(120%) brightness(110%) contrast(100%);
  :hover {
    filter: hue-rotate(-90deg) saturate(120%) brightness(110%) contrast(100%) drop-shadow(0 0 3px #fff)
  }
`;

const YellowDeckImage = styled(DeckImage)`
    filter: hue-rotate(162deg) saturate(180%) brightness(120%);
  :hover {
    filter: hue-rotate(162deg) saturate(180%) brightness(120%) drop-shadow(0 0 3px #fff)
  }
`;

const RedDeckImage = styled(DeckImage)`
  filter: hue-rotate(120deg) saturate(130%);
    :hover {
    filter: hue-rotate(120deg) saturate(130%) drop-shadow(0 0 3px #fff)
      
    }
`;
