import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/DeckSelection.tsx";
import CardDetails from "../components/CardDetails.tsx";
import {ToastContainer} from 'react-toastify';
import BackButton from "../components/BackButton.tsx";

export default function Deckbuilder() {

    const fetchCards = useStore((state) => state.fetchCards);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const saveDeck = useStore((state) => state.saveDeck);
    const [deckName, setDeckName] = useState<string>("New Deck");
    const clearDeck = useStore((state) => state.clearDeck);
    const isSaving = useStore((state) => state.isSaving);

    useEffect(() => {
        clearDeck();
        fetchCards(null, null, null, null, null, null, null, null, null, null,);
    }, [clearDeck, fetchCards]);


    return (
        <OuterContainer>

            <ToastContainer/>
            <DeckNameContainer>
                <DeckNameInput value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
            </DeckNameContainer>
            <ButtonContainer>
                <SaveDeckButton isSaving={isSaving} disabled={isSaving} onClick={() => {
                    saveDeck(deckName)
                }}><StyledSpanSaveDeck>SAVE</StyledSpanSaveDeck></SaveDeckButton>
                <BackButton/>
            </ButtonContainer>

            <ContainerUpperLeftQuarter>
                <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                           alt={selectedCard?.name ?? "Card"}/>
            </ContainerUpperLeftQuarter>

            <ContainerUpperRightQuarter>
                <CardDetails/>
            </ContainerUpperRightQuarter>

            <ContainerBottomLeftQuarter>
                <DeckSelection/>
            </ContainerBottomLeftQuarter>

            <ContainerBottomRightQuarter>
                <SearchForm/>
                <FetchedCards/>
            </ContainerBottomRightQuarter>
        </OuterContainer>
    );
}

export const OuterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 0.1fr 1fr 1fr;
  grid-template-areas: "deckname buttons"
                        "cardimage carddetails"
                        "deckselection searchform";
  width: 98vw;
  height: 98vh;
  padding: 1vh 1vw 1vh 1vw;
  max-width: 1000px;
  max-height: 1000px;

  @media (max-width: 700px) and (min-height: 800px) {
    grid-template-rows: 1fr 1.5fr;
  }

  @media (max-width: 700px) and (min-height: 900px) {
    grid-template-rows: 1fr 1.8fr;
  }

  @media (min-width: 767px) {
    max-width: 1500px;
  }

  @media (min-width: 1000px) {
    grid-template-rows: 0.1fr 1fr 1fr;
    grid-template-columns: 2fr 1fr 1.5fr;
    grid-template-areas: "deckselection deckname buttons"
                        "deckselection cardimage carddetails"
                        "deckselection searchform searchform";
  }
`;

export const Quarter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  align-items: center;
`;

export const ContainerBottomRightQuarter = styled(Quarter)`
  grid-area: searchform;
  @media (min-width: 767px) {
    justify-content: flex-start;
    transform: translateY(-2.5vh);
  }
`;

export const ContainerUpperLeftQuarter = styled(Quarter)`
  grid-area: cardimage;
  @media (min-width: 1000px) {
    margin-top: 20px;
  }
`;

export const ContainerUpperRightQuarter = styled(Quarter)`
  grid-area: carddetails;
  @media (min-width: 1000px) {
    margin-top: 20px;
  }
`;

export const ContainerBottomLeftQuarter = styled(Quarter)`
  grid-area: deckselection;
`;

export const CardImage = styled.img`
  width: 180px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  transform: translateY(2px);
  @media (min-width: 767px) {
    width: 282px;
  }
`;

export const DeckNameInput = styled.input`
  height: 40px;
  width: 275px;
  text-align: center;
  font-size: 25px;
  font-family: 'Sansation', sans-serif;
  border-radius: 5px;
  border: 2px solid #D32765;
  background: #1a1a1a;
  @media (max-width: 766px) {
    transform: translateY(-0.5px);
    width: 175px;
    border: 1px solid #D32765;
    font-size: 18px;
  };
  @media (min-width: 767px) {
    transform: translateY(10px);
  }
`;

const SaveDeckButton = styled.button<{ isSaving: boolean }>`
  height: 40px;
  width: 95%;
  padding: 0;
  padding-top: 5px;
  margin-left: 5px;
  background: ${(props) => props.isSaving ? "grey" : "mediumaquamarine"};
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 3px #060e18);

  :hover {
    background: ${(props) => props.isSaving ? "grey" : "aquamarine"};
  }

  &:active {
    background-color: ${(props) => props.isSaving ? "grey" : "aquamarine"};
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 766px) {
    transform: translateY(-0.5px);
    width: 95px;
    font-size: 20px;
  };

`;

const ButtonContainer = styled.div`
  grid-area: buttons;
  width: 100%;
  display: flex;
  padding-left: 1%;
  gap: 2%;
  padding-right: 1%;
  justify-content: space-between;
  @media (min-width: 767px) {
    transform: translateY(12px);
  }
`;

export const StyledSpanSaveDeck = styled.span`
  font-family: 'Pixel Digivolve', sans-serif;
  font-weight: bold;
  font-size: 0.9em;
  margin: 0;
  letter-spacing: 2px;
  color: #0e1625;
  margin-bottom: 10px;
`;

export const DeckNameContainer = styled.div`
  grid-area: deckname;
  width: 100%;
  display: flex;
  justify-content: center;
`;