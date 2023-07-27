import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/DeckSelection.tsx";
import CardDetails from "../components/CardDetails.tsx";
import { ToastContainer } from 'react-toastify';

export default function Deckbuilder() {

    const fetchCards = useStore((state) => state.fetchCards);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const saveDeck = useStore((state) => state.saveDeck);
    const [deckName, setDeckName] = useState<string>("New Deck");

    useEffect(() => {
        // @ts-ignore
        fetchCards();
    }, [fetchCards]);


    return (
            <OuterContainer>

                <ToastContainer />

                <ContainerUpperLeftQuarter>
                    <DeckNameInput value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
                    <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                               alt={selectedCard?.name ?? "Card"}/>
                </ContainerUpperLeftQuarter>

                <ContainerUpperRightQuarter>
                        <div>
                            <SaveDeckButton onClick={()=>saveDeck(deckName)}>SAVE</SaveDeckButton>
                        </div>
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

const OuterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: 
    ". ."
    ". .";
  width: 98vw;
  height: 98vh;
  padding: 1vh 1vw 1vh 1vw;
  max-width: 1000px;
  max-height: 1000px;
`;

const Quarter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  align-items: center;
`;

const ContainerBottomRightQuarter = styled(Quarter)`
  grid-column-start: 2;
  grid-row-start: 2;
`;

const ContainerUpperLeftQuarter = styled(Quarter)`
  grid-column-start: 1;
  grid-row-start: 1;
`;

const ContainerUpperRightQuarter = styled(Quarter)`
  grid-column-start: 2;
  grid-row-start: 1;
`;

const ContainerBottomLeftQuarter = styled(Quarter)`
  grid-column-start: 1;
  grid-row-start: 2;
`;

const CardImage = styled.img`
  width: 180px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  transform: translateY(2px);
  @media (min-width: 767px) {
    width: 282px;
  }
`;

const DeckNameInput = styled.input`
  height: 40px;
  width: 275px;
  text-align: center;
  font-size: 25px;
  font-family: 'Sansation', sans-serif;
    border-radius: 5px;
  border: 2px solid #D32765;
  background: #1a1a1a;
`;

const SaveDeckButton = styled.button`
  height: 40px;
  width: 275px;
  padding: 0;
  padding-top: 5px;
  background: mediumaquamarine;
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 3px #060e18);
  
  :hover {
    background: aquamarine;
  }

  &:active {
    background-color: aqua;
    border: none;
    filter: none;
    transform: translateY(1px);
    box-shadow: inset 0 0 3px #000000;
  }

  &:focus {
    outline: none;
  }
`;