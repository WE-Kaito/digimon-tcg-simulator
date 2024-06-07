import styled from '@emotion/styled';
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/lotties/loading.json";
import noCardsFoundAnimation from "../../assets/lotties/noCardsFound.json";
import gatchmon from "../../assets/gatchmon.png";
import {useStore} from "../../hooks/useStore.ts";
import {CardTypeWithId} from "../../utils/types.ts";
import {Suspense, useEffect, useMemo} from 'react';
import FetchCard from "./FetchCard.tsx";

export const Loading = () => <LoadingContainer>
    <Lottie animationData={loadingAnimation} loop={true} style={{width: "90px"}}/>
    <img alt="" src={gatchmon} width={80} height={100}/>
</LoadingContainer>

export default function FetchedCards() {

    const isLoading = useStore((state) => state.isLoading);
    const fetchedCards = useStore((state) => state.fetchedCards);
    const filteredCards = useStore((state) => state.filteredCards);

    const memoizedFilteredCards = useMemo(() => filteredCards, [filteredCards]);

    useEffect(() => {
        const container = document.getElementById('search-container');
        container?.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    }, []);

    return (
        <FetchContainer id={"search-container"}>
            <Suspense fallback={<Loading/>}>
                <StyledFieldset>

                    {isLoading && <Loading/>}

                    {(!isLoading && (filteredCards.length < 2000) && (filteredCards !== fetchedCards))
                        ? memoizedFilteredCards?.map((card: CardTypeWithId, index) => (
                            <FetchCard card={card} key={card.uniqueCardNumber + index}/>
                        ))
                        : <LoadingContainer>
                            <img alt="gatchmon" src={gatchmon} width={100} height={120}/>
                        </LoadingContainer>
                    }

                    {!isLoading && (memoizedFilteredCards.length === 0) && (
                        <LoadingContainer>
                            <Lottie animationData={noCardsFoundAnimation} loop={false} style={{width: "70px"}}/>
                            <img alt="gatchmon" src={gatchmon} width={80} height={100}/>
                        </LoadingContainer>
                    )}

                </StyledFieldset>
            </Suspense>
        </FetchContainer>
    );
}

const FetchContainer = styled.div`
  grid-area: fetchedcards;
  background-color: rgba(18, 17, 17, 0.7);
  width: 97.5%;
  border-radius: 5px;
  height: 95%;
  min-height: 150px;
  margin-top: 3%;
  padding: 1.25%;
  position: relative;
  transform: translateY(-8px);
  
@container(max-width: 449px) {
  height: 99%;
  margin-top: unset;
  padding: 0;
}
`;

const StyledFieldset = styled.fieldset`
  position: absolute;
  color: #C5C5C5;
  height: 83.75%;
  width: 93%;
  border-radius: 5px;
  margin-top: 2px;
  transform: translateX(0.5px);
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  overflow-y: scroll;
  padding-top: 10px;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }

  &::-webkit-scrollbar {
    background-color: rgba(9, 8, 8, 0.98);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #C5C5C5;
    border-radius: 2px;
  }
@container(max-width: 549px) {
  &::-webkit-scrollbar {
    width: 3px;
  }
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
