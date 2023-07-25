import styled from "styled-components";
import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";

export default function Deckbuilder() {

    const fetchCards = useStore((state) => state.fetchCards);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    return (
        <OuterContainer>
            <ContainerBottomRightQuarter>
                <SearchForm>
                    <StyledFieldset></StyledFieldset>

                </SearchForm>


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




const SearchForm = styled.form`

  background-color: rgba(102,62,71, 0.985);
  width: 97%;
  height: 13vh;
  padding: 1.5%;
  border-radius: 5px;

`;

const StyledFieldset = styled.fieldset`
  color: #C5C5C5;
  height: 9.5vh;
  max-height: 300px;
  border-radius: 5px;
  margin-top: 2px;
  transform: translateX(0.5px);

  display: flex;
  flex-flow: row wrap;
  gap: 1.8vw;

  overflow: auto;
  scrollbar-width: thin;

  @media (min-width: 768px) {
    gap: 1.2vw;
    height: 10vh;
  }
`;

