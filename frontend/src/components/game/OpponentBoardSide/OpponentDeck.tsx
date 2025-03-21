import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {getSleeve} from "../../../utils/sleeves.ts";
import styled from "@emotion/styled";

export default function OpponentDeck() {
    const opponentDeckField = useGameBoardStates((state) => state.opponentDeckField);
    const opponentSleeve = useGameBoardStates((state) => state.opponentSleeve);

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
  height: 100%;
  border-radius: 3px;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  box-shadow: 1px 1px 0 0 black;
`;
