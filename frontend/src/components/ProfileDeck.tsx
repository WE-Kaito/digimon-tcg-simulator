import {CardType, DeckType} from "../utils/types.ts";
import styled from "@emotion/styled";
import deckBack from '../assets/deckBack.png';

export default function ProfileDeck({deck}:{deck:DeckType}) {
    return (
        <Container>

<DeckImage src={deckBack}/>
        </Container>
    );
}

const Container = styled.div`
  width: 300px;
  height: 200px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:'deck name name'
                        'deck button button';
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