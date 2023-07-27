import styled from '@emotion/styled';
import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/DeckSelection.tsx";
import CardDetails from "../components/CardDetails.tsx";

export default function Deckbuilder() {

    const fetchCards = useStore((state) => state.fetchCards);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    useEffect(() => {
        // @ts-ignore
        fetchCards();
    }, [fetchCards]);

    return (
        <OuterContainer>
            <ContainerUpperLeftQuarter>
                <input style={{height: "40px", width: "90%"}} placeholder="placeholder"></input>
                <CardImage src={(hoverCard || selectedCard)?.image_url || cardBack} alt={selectedCard?.name || "Card"}/>
            </ContainerUpperLeftQuarter>

            <ContainerUpperRightQuarter>
                <input style={{height: "40px", width: "90%"}} placeholder="placeholder"></input>
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





