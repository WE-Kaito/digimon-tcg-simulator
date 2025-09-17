import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { getSleeve } from "../../../utils/sleeves.ts";
import styled from "@emotion/styled";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function OpponentDeck() {
    const username = useGeneralStates((state) => state.user);
    const opponentDeckField = useGameBoardStates((state) => state.opponentDeckField);
    const player1 = useGameBoardStates((state) => state.player1);
    const player2 = useGameBoardStates((state) => state.player2);

    const opponentSleeve = player1.username === username ? player2.sleeveName : player1.sleeveName;

    return (
        <Container>
            <StyledSpan>{opponentDeckField.length}</StyledSpan>
            <StyledImg alt="sleeve" src={getSleeve(opponentSleeve)} />
        </Container>
    );
}

const Container = styled.div`
    grid-area: deck;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    transform: translateY(-10%);
`;

const StyledSpan = styled.span`
    position: absolute;
    top: 0;
    width: 100%;
    transform: translateY(-105%);
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    @media (max-height: 500px) {
        font-size: 0.8em;
    }
`;

const StyledImg = styled.img`
    height: 100%;
    border-radius: 3px;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    box-shadow: 1px 1px 0 0 black;
`;
