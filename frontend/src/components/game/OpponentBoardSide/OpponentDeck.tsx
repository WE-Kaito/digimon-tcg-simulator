import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {getSleeve} from "../../../utils/sleeves.ts";
import styled from "@emotion/styled";

export default function OpponentDeck() {
    const [opponentDeckField, opponentSleeve] = useGameBoardStates((state) => [state.opponentDeckField, state.opponentSleeve]);

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
`;

const StyledSpan = styled.span`
  width: 100%;
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  @media (max-height: 500px) {
    font-size: 0.8em;
  }
`;

const StyledImg = styled.img`
  width: 93%;
  border-radius: 2px;
  border-right: 2px solid black;
  border-bottom: 2px solid black;
`;
