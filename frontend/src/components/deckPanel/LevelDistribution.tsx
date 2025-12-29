import styled from "@emotion/styled";
import { CardType } from "../../utils/types.ts";

export default function LevelDistribution({ deckCards }: { deckCards: CardType[] }) {
    // Filter for Digimon cards only (other card types don't have meaningful levels 3-7)
    const digimonCards = deckCards.filter((card) => card.cardType === "Digimon");

    // Count Digimon cards at each level
    const countLv3 = digimonCards.filter((card) => card.level === 3).length;
    const countLv4 = digimonCards.filter((card) => card.level === 4).length;
    const countLv5 = digimonCards.filter((card) => card.level === 5).length;
    const countLv6 = digimonCards.filter((card) => card.level === 6).length;
    const countLv7 = digimonCards.filter((card) => card.level === 7).length;

    // Find maximum count to create proportional ratios
    const maxCount = Math.max(countLv3, countLv4, countLv5, countLv6, countLv7);
    const maxHeight = 18; // Maximum bar height in pixels (leave 2px margin)
    const minHeight = 2; // Minimum visible height for non-zero counts

    // Calculate proportional heights with minimum visibility
    const heightLv3 = countLv3 > 0 ? Math.max(minHeight, (countLv3 / maxCount) * maxHeight) : 0;
    const heightLv4 = countLv4 > 0 ? Math.max(minHeight, (countLv4 / maxCount) * maxHeight) : 0;
    const heightLv5 = countLv5 > 0 ? Math.max(minHeight, (countLv5 / maxCount) * maxHeight) : 0;
    const heightLv6 = countLv6 > 0 ? Math.max(minHeight, (countLv6 / maxCount) * maxHeight) : 0;
    const heightLv7 = countLv7 > 0 ? Math.max(minHeight, (countLv7 / maxCount) * maxHeight) : 0;

    return (
        <Container>
            <LevelsSvg xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="20" x2="5" y2={20 - heightLv3} stroke="white" strokeWidth="3" />
                <line x1="16" y1="20" x2="16" y2={20 - heightLv4} stroke="white" strokeWidth="3" />
                <line x1="27" y1="20" x2="27" y2={20 - heightLv5} stroke="white" strokeWidth="3" />
                <line x1="38" y1="20" x2="38" y2={20 - heightLv6} stroke="white" strokeWidth="3" />
                <line x1="49" y1="20" x2="49" y2={20 - heightLv7} stroke="white" strokeWidth="3" />
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
    transform: translate(-3px, -12px);
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
