import styled from "@emotion/styled";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
import BackButton from "../components/BackButton.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import cardBackSrc from "../assets/cardBack.jpg";
import UpdateDeckButtons from "../components/deckbuilder/UpdateDeckButtons.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";

export default function Deckbuilder({ isEditMode }: { isEditMode?: boolean }) {
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const decks = useGeneralStates((state) => state.decks);
    const fetchDecks = useGeneralStates((state) => state.fetchDecks);
    const fetchCards = useGeneralStates((state) => state.fetchCards);
    const nameOfDeckToEdit = useGeneralStates((state) => state.nameOfDeckToEdit);
    const deckCards = useGeneralStates((state) => state.deckCards);

    const [deckName, setDeckName] = useState<string>("New Deck");
    const [currentDeckLength, setCurrentDeckLength] = useState<number>(0);

    const initialFetch = useCallback(() => {
        fetchCards();
        fetchDecks();
        setCurrentDeckLength(decks.length);
        if (nameOfDeckToEdit !== "New Deck") setDeckName(nameOfDeckToEdit);
    }, [decks.length, fetchCards, fetchDecks, isEditMode, nameOfDeckToEdit]);

    useLayoutEffect(() => initialFetch(), [initialFetch]);

    const handleBeforeUnload = useCallback(() => {
        localStorage.setItem("nameOfDeckToEdit", JSON.stringify(deckName || nameOfDeckToEdit));
        localStorage.setItem("deckCards", JSON.stringify(deckCards));
    }, [deckName, nameOfDeckToEdit, deckCards]);

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleBeforeUnload]);

    // function onSleeveClick() {
    //     setSelectedSleeveOrImage(deck.sleeveName);
    //     setDeckIdToSetSleeveOrImage(deck.id);
    //     setSleeveSelectionOpen(true);
    // }

    return (
        <MenuBackgroundWrapper>
            <OuterContainerDiv>
                <DetailsContainerDiv>
                    <CardImage
                        src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBackSrc}
                        alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}
                    />
                    <CardDetails />
                </DetailsContainerDiv>

                <DeckContainerDiv>
                    <div style={{ display: "flex", height: 50, justifyContent: "center", alignItems: "center" }}>
                        <NameInput
                            type={"text"}
                            value={deckName}
                            maxLength={35}
                            onChange={(e) => setDeckName(e.target.value)}
                        />
                    </div>

                    {/*<SleeveImage*/}
                    {/*    className={"button"}*/}
                    {/*    src={getSleeve(deck.sleeveName)}*/}
                    {/*    onError={handleImageError}*/}
                    {/*    onClick={onSleeveClick}*/}
                    {/*/>*/}

                    <DeckSelection />
                    <DeckImport deckName={deckName} />
                </DeckContainerDiv>

                <SearchAndButtonsContainerDiv>
                    <div
                        style={{
                            width: "100%",
                            minHeight: 50,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <UpdateDeckButtons
                            deckName={deckName}
                            currentDeckLength={currentDeckLength}
                            setCurrentDeckLength={setCurrentDeckLength}
                            isEditMode={isEditMode}
                        />
                        <BackButton isInDeckbuilder />
                    </div>
                    <SearchForm />

                    <FetchedCards />
                </SearchAndButtonsContainerDiv>
            </OuterContainerDiv>
        </MenuBackgroundWrapper>
    );
}

const OuterContainerDiv = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap-reverse;
`;

const DetailsContainerDiv = styled.div`
    justify-self: flex-start;
    min-width: 380px;
    max-width: 380px;
    margin: 8px 5px 0 0;

    @media (max-width: 500px) {
        min-width: 98%;
        max-width: 98%;
        margin-right: 8px;
    }
`;

const DeckContainerDiv = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 500px;

    @media (max-width: 499px) {
        min-width: unset;
        max-width: 100vw;
    }
`;

const SearchAndButtonsContainerDiv = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 400px;
    max-width: 550px;
    padding-right: 6px;

    @media (max-width: 499px) {
        min-width: unset;
        max-width: 100%;
        padding: 0;
    }
`;

const CardImage = styled.img`
    grid-area: cardimage;
    aspect-ratio: 7 / 10;
    max-width: 100%;
    max-height: 380px;
    border-radius: 10px;
    filter: drop-shadow(0 0 3px #060e18);

    @media (max-width: 500px) {
        max-height: unset;
    }
`;

const NameInput = styled.input`
    height: 35px;
    width: 35ch;
    font-family: "League Spartan", sans-serif;
    letter-spacing: 1px;
    text-align: center;
    font-size: 30px;
    padding: 3px 5px 0 5px;
    border: none;

    background: rgba(15, 50, 145, 0.3);
    backdrop-filter: hue-rotate(100deg);

    &:focus {
        outline: 3px solid var(--blue);
    }
`;

// const SleeveImage = styled.img`
//     max-height: 100%;
//     border-radius: 2px;
//     grid-area: sleeve;
//     transform: translate(-2px, -1px);
//
//     :hover {
//         cursor: pointer;
//         filter: drop-shadow(0 0 2px rgba(87, 160, 255, 0.5)) contrast(1.1);
//     }
// `;
