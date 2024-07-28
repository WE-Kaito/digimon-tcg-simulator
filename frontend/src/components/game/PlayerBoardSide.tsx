import styled from "@emotion/styled";

export default function PlayerBoardSide() {
    return (
        <LayoutContainer>

        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 5 / 8;
  background: lightblue;
  display: grid;
  grid-template-columns: repeat(35, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-template-areas: 
          "0 SS SS 0 BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 reaction reaction reaction reaction 0 trash trash deck-utils deck deck 0"
          "0 SS SS 0 BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 reaction reaction reaction reaction 0 trash trash deck-utils deck deck 0"
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 0 0 0 0 0 0 0 0 0 0 0"
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 hand hand hand hand hand hand hand hand hand hand hand"
          "tokens tokens breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand"
          "tokens tokens breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand";
  gap: 1px;
`;
