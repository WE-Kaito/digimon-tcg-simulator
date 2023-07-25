import styled from "styled-components";
import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";

export default function Deckbuilder() {

    const fetchCards = useStore((state) => state.fetchCards);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    return (
        <OuterContainer>

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
  max-height: 667px;
`;


const ContainerBottomRightQuarter = styled.div`
  grid-column-start: 2;
  grid-row-start: 2;
  display: flex;
  flex-direction: column;
  gap: 1vh;
`;





