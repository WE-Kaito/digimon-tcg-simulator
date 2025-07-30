import styled from "@emotion/styled";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/lotties/loading.json";
import noCardsFoundAnimation from "../../assets/lotties/noCardsFound.json";
import gatchmon from "../../assets/gatchmon.png";
import { CardTypeWithId } from "../../utils/types.ts";
import { Suspense, useEffect, useMemo } from "react";
import FetchCard from "./FetchCard.tsx";
import { useDeckStates } from "../../hooks/useDeckStates.ts";

export const Loading = () => (
    <LoadingContainer>
        <Lottie animationData={loadingAnimation} loop={true} style={{ width: "90px" }} />
        <img alt="" src={gatchmon} width={80} height={100} />
    </LoadingContainer>
);

export default function FetchedCards() {
    const isLoading = useDeckStates((state) => state.isLoading);
    const fetchedCards = useDeckStates((state) => state.fetchedCards);
    const filteredCards = useDeckStates((state) => state.filteredCards);

    const memoizedFilteredCards = useMemo(() => filteredCards, [filteredCards]);

    useEffect(() => {
        const container = document.getElementById("search-container");
        container?.addEventListener("contextmenu", function (event) {
            event.preventDefault();
        });
    }, []);

    return (
        <DeckContainer id={"search-container"}>
            <Suspense fallback={<Loading />}>
                {isLoading && <Loading />}

                {!isLoading && filteredCards.length < 2000 && filteredCards !== fetchedCards ? (
                    memoizedFilteredCards?.map((card: CardTypeWithId, index) => (
                        <FetchCard card={card} key={card.uniqueCardNumber + index} />
                    ))
                ) : (
                    <LoadingContainer>
                        <img alt="gatchmon" src={gatchmon} width={100} height={120} />
                    </LoadingContainer>
                )}

                {!isLoading && memoizedFilteredCards.length === 0 && (
                    <LoadingContainer>
                        <Lottie animationData={noCardsFoundAnimation} loop={false} style={{ width: "70px" }} />
                        <img alt="gatchmon" src={gatchmon} width={80} height={100} />
                    </LoadingContainer>
                )}
            </Suspense>
        </DeckContainer>
    );
}

const LoadingContainer = styled.div`
    height: 90%;
    width: 90%;
    max-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const DeckContainer = styled.div`
    flex: 1;
    min-height: 400px;
    max-height: calc(100vh - 238px);
    font-family: "AwsumSans", sans-serif;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    place-content: flex-start;
    gap: 16px;
    border-radius: 5px;

    overflow-y: scroll;
    overflow-x: hidden;

    padding: 8px 0 10px 12px;
    border: 2px solid rgba(87, 136, 210, 0.25);
    filter: drop-shadow(0 0 3px rgba(56, 111, 240, 0.325));

    @supports (-moz-appearance: none) {
        scrollbar-width: thin;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom right,
            rgba(140, 171, 238, 0.75) 0%,
            rgba(83, 106, 166, 0.75) 50%,
            rgba(69, 83, 114, 0.75) 100%
        );
        border-radius: 5px;
        box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            inset 0 -1px 3px rgba(0, 0, 0, 0.9);
    }

    box-shadow:
        inset 0 0 8px rgba(55, 185, 255, 0.1),
        inset 0 0 13px rgba(64, 180, 252, 0.1),
        inset 0 0 18px rgba(71, 187, 250, 0.1);
`;
