import styled from "@emotion/styled";
import SecurityStack from "./SecurityStack.tsx";

export default function PlayerBoardSide() {
    return (
        <LayoutContainer>

            <SecurityStack/>
        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 9 / 15;
  background: lightblue;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-template-areas: 
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 reaction reaction reaction reaction . trash trash deck-utils deck deck ."
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 reaction reaction reaction reaction . trash trash deck-utils deck deck ."
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 hand hand hand hand hand hand hand hand hand hand hand"
          "tokens tokens breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand"
          "tokens tokens breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand";
  gap: 1px;
`;
