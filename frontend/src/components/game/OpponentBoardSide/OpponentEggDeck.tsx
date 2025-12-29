import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { getSleeve } from "../../../utils/sleeves.ts";

export default function OpponentEggDeck() {
    const username = useGeneralStates((state) => state.user);
    const opponentEggDeck = useGameBoardStates((state) => state.opponentEggDeck);
    const player1 = useGameBoardStates((state) => state.player1);
    const player2 = useGameBoardStates((state) => state.player2);

    const opponentEggSleeve = player1.username === username ? player2.eggSleeveName : player1.eggSleeveName;

    return (
        <Container>
            {opponentEggDeck.length !== 0 && <StyledSpan>{opponentEggDeck.length}</StyledSpan>}
            {opponentEggDeck.length !== 0 && <DeckImg alt="egg-deck" src={getSleeve("Digi-Egg", opponentEggSleeve)} />}
        </Container>
    );
}

const Container = styled.div`
    grid-area: egg-deck;
    position: relative;
    display: flex;
    flex-direction: column;
    transform: translate(-3%, -14%);
`;

const StyledSpan = styled.span`
    width: 100%;
    position: absolute;
    top: -25px;
    left: 52%;
    transform: translateX(-50%);
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    transition: all 0.1s ease;
    @media (max-height: 600px) {
        font-size: 0.8em;
    }
`;

const DeckImg = styled.img`
    height: 100%;
    margin: 0 12.5% 0 12.5%;
    border-radius: 3px;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
`;
