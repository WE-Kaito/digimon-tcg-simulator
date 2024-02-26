import styled from "@emotion/styled";
import {CardType} from "../../utils/types.ts";

export default function LevelDistribution({deckCards}: { deckCards: CardType[] }) {

    const heightLv3 = deckCards.filter(card => card.level === 3).length * 2;
    const heightLv4 = deckCards.filter(card => card.level === 4).length * 2;
    const heightLv5 = deckCards.filter(card => card.level === 5).length * 2;
    const heightLv6 = deckCards.filter(card => card.level === 6).length * 2;
    const heightLv7 = deckCards.filter(card => card.level === 7).length * 2;

    return (
        <Container>
            <LevelsSvg xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="30" x2="5" y2={30 - heightLv3} stroke="white" strokeWidth="3"/>
                <line x1="16" y1="30" x2="16" y2={30 - heightLv4} stroke="white" strokeWidth="3"/>
                <line x1="27" y1="30" x2="27" y2={30 - heightLv5} stroke="white" strokeWidth="3"/>
                <line x1="38" y1="30" x2="38" y2={30 - heightLv6} stroke="white" strokeWidth="3"/>
                <line x1="49" y1="30" x2="49" y2={30 - heightLv7} stroke="white" strokeWidth="3"/>

            </LevelsSvg>

            <Numbers>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
            </Numbers>
        </Container>
    );
}

const Container = styled.div`
  grid-area: levels;
  position: relative;
  transform: translate(-5px, -18px);
`;

const LevelsSvg = styled.svg`
  width: 50px;
  height: 20px;
  left: 2px;
  position: absolute;
`;

const Numbers = styled.div`
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 50px;
  top: 22px;
  left: 4px;
  font-family: "League Spartan", sans-serif;
  font-size: 12px;
  color: white;
`;
