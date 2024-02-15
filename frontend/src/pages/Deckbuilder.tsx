import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
import BackButton from "../components/BackButton.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "../components/ParticlesBackground.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";

export default function Deckbuilder() {

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const saveDeck = useStore((state) => state.saveDeck);
    const [deckName, setDeckName] = useState<string>("New Deck");
    const clearDeck = useStore((state) => state.clearDeck);
    const isSaving = useStore((state) => state.isSaving);
    const filterCards = useStore((state) => state.filterCards);
    const fetchDecks = useStore((state) => state.fetchDecks);
    const decks = useStore((state) => state.decks);
    const fetchCards = useStore((state) => state.fetchCards);

    const cardBackUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/cardBack.jpg";

    useEffect(() => {
        clearDeck();
        fetchDecks();
        filterCards("", "", "", "", "", "", "", "", "", null, null, null, "", "", false, true);
        return;
    }, [clearDeck, fetchDecks, filterCards]);

    useEffect(() => {
        fetchCards();
        return;
    }, []);

    return (
        <Wrapper>
            <div style={{position: "absolute"}}>
                <ParticlesBackground options={blueTriangles}/>
            </div>
            <OuterContainer>

                <ButtonContainer>
                    <SaveDeckButton disabled={(isSaving || decks.length >= 16)} onClick={() => {
                        saveDeck(deckName)
                    }}><StyledSpanSaveDeck>{decks.length >= 16 ? "16/16 Decks" : `SAVE [${decks.length}/16]`}</StyledSpanSaveDeck></SaveDeckButton>
                    <BackButton/>
                </ButtonContainer>

                <DeckImport deckName={deckName}/>

                <DeckNameContainer>
                    <DeckNameInput maxLength={35} value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
                </DeckNameContainer>

                <DeckSelection/>

                <SearchForm/>

                <FetchedCards/>
                <DetailsContainer>
                    <CardDetails/>
                </DetailsContainer>

                <CardImageContainer >
                <CardImage src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBackUrl}
                           alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}/>
                    <CardNumberSpan>{(hoverCard ?? selectedCard)?.cardNumber}</CardNumberSpan>
                </CardImageContainer>

            </OuterContainer>
        </Wrapper>
    );
}

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: relative;
  transform: translateY(0);
  container-type: inline-size;
  container-name: wrapper;
`;

export const OuterContainer = styled.div`
  position: absolute;
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 1900px;
  max-height: 1040px;
  width: 99vw;
  height: 98vh;
  container-type: inline-size;

  @media (max-width: 460px) {
    overflow-y: scroll;
    overflow-x: hidden;
  }

@container(min-width: 450px) {
  display: grid;
  gap: unset;
  grid-template-rows: 0.1fr 1fr 1fr 1fr 2fr;
  grid-template-columns: 2.75fr 1fr 1.5fr;
  grid-template-areas: " deckname buttons buttons"
                        "import-export-area cardimage details"
                        "deckselection cardimage details"
                        "deckselection searchform searchform"
                        "deckselection fetchedcards fetchedcards";
}
`;

export const CardImage = styled.img`
  grid-area: cardimage;
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);

@container(max-width: 449px) {
  max-width: 95%;
}
`;

export const DeckNameInput = styled.input`
  height: 40px;
  width: 95%;
  text-align: center;
  font-size: 34px;
  padding-top: 3px;
  font-family: League Spartan, sans-serif;
  border-radius: 5px;
  border: 2px solid #D32765;
  background: #1a1a1a;
`;

const SaveDeckButton = styled.button<{ disabled: boolean }>`
  height: 40px;
  width: 95%;
  padding: 0;
  padding-top: 2px;
  margin-left: 5px;
  background: ${(props) => props.disabled ? "grey" : "mediumaquamarine"};
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 2px #346ab6);

  :hover {
    background: ${(props) => props.disabled ? "grey" : "aquamarine"};
  }

  &:active {
    background-color: ${(props) => props.disabled ? "grey" : "aquamarine"};
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }

`;

export const ButtonContainer = styled.div`
  grid-area: buttons;
  width: 95%;
  display: flex;
  gap: 2%;
  justify-content: space-between;
`;

export const StyledSpanSaveDeck = styled.span`
  font-family: 'League Spartan', sans-serif;
  font-weight: bold;
  font-size: 1.1em;
  margin: 0;
  letter-spacing: 2px;
  color: #0e1625;
`;

export const DeckNameContainer = styled.div`
  grid-area: deckname;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const DetailsContainer = styled.div`
  height: 100%;
  width: 95%;
  margin: 0 4% 0 1%;
  scrollbar-width: thin;
  grid-area: details;

@container(min-width: 450px) {
  transform: translateX(-7px);
  padding-right: 12px;
  overflow: hidden;
  width: 100%;
  margin: unset;
}

  &::-webkit-scrollbar {
    background-color: rgba(9, 8, 8, 0.98);
    border-radius: 2px;
    width: 3px;
  }


  &::-webkit-scrollbar-thumb {
    background-color: rgba(220, 220, 220, 0.25);
    border-radius: 2px;
  }
`;

export const CardImageContainer = styled.div`
  grid-area: cardimage;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 5px;
  position: relative;
`;

export const CardNumberSpan = styled.span`
  position: absolute;
  font-weight: 400;
  background: #0c0c0c;
  padding: 0px 3px 0px 3px;
  bottom: 0;
  right: 7%;
  border-radius: 5px;
  
  @media (max-width: 450px) {
    visibility: hidden;
  }
`;
