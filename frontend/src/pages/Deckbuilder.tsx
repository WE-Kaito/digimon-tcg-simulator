import styled from '@emotion/styled';
import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
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


const ContainerBottomRightQuarter = styled.div`
  grid-column-start: 2;
  grid-row-start: 2;
  display: flex;
  flex-direction: column;
  gap: 1vh;
`;

const ContainerUpperLeftQuarter = styled.div`
  grid-column-start: 1;
  grid-row-start: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;

`;

const ContainerUpperRightQuarter = styled.div`
  grid-column-start: 2;
  grid-row-start: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
`;

const CardImage = styled.img`
  width: 180px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
    @media (min-width: 767px) {
    width: 290px;
    }
`;





