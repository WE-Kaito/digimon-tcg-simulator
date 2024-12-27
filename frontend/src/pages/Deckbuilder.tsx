import styled from '@emotion/styled';
import {useCallback, useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
import BackButton from "../components/BackButton.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import cardBackSrc from "../assets/cardBack.jpg"
import AddDeckButton from "../components/deckbuilder/AddDeckButton.tsx";
import UpdateDeleteDeckButtons from "../components/deckbuilder/UpdateDeleteDeckButtons.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function Deckbuilder({isEditMode}: { isEditMode?: boolean }) {

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const decks = useStore((state) => state.decks);
    const fetchDecks = useStore((state) => state.fetchDecks);
    const fetchCards = useStore((state) => state.fetchCards);
    const nameOfDeckToEdit = useStore(state => state.nameOfDeckToEdit);

    const [deckName, setDeckName] = useState<string>("New Deck");
    const [currentDeckLength, setCurrentDeckLength] = useState<number>(0);

    const initialFetch = useCallback(() => {
        fetchCards();
        fetchDecks();
        setCurrentDeckLength(decks.length);
        if (isEditMode) setDeckName(nameOfDeckToEdit);
    }, [decks.length, fetchCards, fetchDecks, isEditMode, nameOfDeckToEdit]);
    useEffect(() => initialFetch(), [initialFetch]);

    return (
        <MenuBackgroundWrapper>
            <OuterContainer>

                <ButtonContainer>
                    {isEditMode
                        ? <UpdateDeleteDeckButtons deckName={deckName}/>
                        : <AddDeckButton deckName={deckName} currentDeckLength={currentDeckLength}
                                         setCurrentDeckLength={setCurrentDeckLength}/>
                    }
                    <BackButton isOnEditPage={isEditMode}/>
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
                <CardImage src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBackSrc}
                           alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}/>
                    <CardNumberSpan>{(hoverCard ?? selectedCard)?.cardNumber}</CardNumberSpan>
                </CardImageContainer>

            </OuterContainer>
        </MenuBackgroundWrapper>
    );
}

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

export const ButtonContainer = styled.div`
  grid-area: buttons;
  width: 95%;
  display: flex;
  gap: 2%;
  justify-content: space-between;
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
  grid-area: details;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }

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
