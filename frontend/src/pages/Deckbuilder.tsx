import styled from "styled-components";
import axios from "axios";
import {CardType} from "../utils/types.ts";
import {useEffect, useState} from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";
import gatchmon from "../assets/gatchmon.png";
import Card from "../components/Card.tsx";

export default function Deckbuilder() {

    const [cards, setCards] = useState<CardType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    function fetchCards() {
        setIsLoading(true);
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .then((data) => {
                setCards(data);
                console.log(data);
            })
            .catch(console.error)
            .then(() => setIsLoading(false));
    }


    return (
        <OuterContainer>
            <FetchContainer><StyledFieldset>
                {!isLoading ? cards.map((card) => (
                        <Card key={card.cardnumber} card={card}/>
                    ))
                    :
                    <LoadingContainer><Lottie animationData={loadingAnimation} loop={true} style={{width: "90px"}}/>
                        <img alt="gatchmon" src={gatchmon} width={80} height={100}/>
                    </LoadingContainer>
                }

            </StyledFieldset></FetchContainer>
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

const FetchContainer = styled.div`

  grid-column-start: 2;
  grid-row-start: 2;
  background-color: rgba(18, 17, 17, 0.985);
  width: 97%;
  padding: 1.5%;
  border-radius: 5px;

`;

const StyledFieldset = styled.fieldset`
  color: #C5C5C5;
  height: 92.75%;
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
  }
`;

const LoadingContainer = styled.div`
  height: 90%;
  width: 90%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;