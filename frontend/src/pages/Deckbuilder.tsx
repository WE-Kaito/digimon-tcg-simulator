import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
import BackButton from "../components/BackButton.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import cardBackSrc from "../assets/cardBack.jpg";
import AddDeckButton, { StyledSpanSaveDeck } from "../components/deckbuilder/AddDeckButton.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import { useNavigate } from "react-router-dom";

export default function Deckbuilder({ isEditMode }: { isEditMode?: boolean }) {
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const decks = useGeneralStates((state) => state.decks);
    const fetchDecks = useGeneralStates((state) => state.fetchDecks);
    const fetchCards = useGeneralStates((state) => state.fetchCards);
    const nameOfDeckToEdit = useGeneralStates((state) => state.nameOfDeckToEdit);

    const [deckName, setDeckName] = useState<string>("New Deck");
    const [currentDeckLength, setCurrentDeckLength] = useState<number>(0);

    const initialFetch = useCallback(() => {
        fetchCards();
        fetchDecks();
        setCurrentDeckLength(decks.length);
        if (isEditMode) setDeckName(nameOfDeckToEdit);
    }, [decks.length, fetchCards, fetchDecks, isEditMode, nameOfDeckToEdit]);

    useEffect(() => initialFetch(), [initialFetch]);

    // Edit
    const deleteDeck = useGeneralStates((state) => state.deleteDeck);
    const idOfDeckToEdit = useGeneralStates((state) => state.idOfDeckToEdit);
    const updateDeck = useGeneralStates((state) => state.updateDeck);
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    // ---

    return (
        <MenuBackgroundWrapper>
            <OuterContainer>
                <ButtonContainer>
                    {isEditMode ? (
                        <>
                            <UpdateDeckButton
                                isDeleting={isDeleting}
                                onClick={() => idOfDeckToEdit && updateDeck(idOfDeckToEdit, deckName)}
                            >
                                <StyledSpanSaveDeck>
                                    SAVE {`${window.innerWidth > 500 ? "CHANGES" : ""}`}
                                </StyledSpanSaveDeck>
                            </UpdateDeckButton>
                            {decks.length > 1 && (
                                <DeleteDeckButton
                                    isDeleting={isDeleting}
                                    onClick={() => {
                                        if (isDeleting && idOfDeckToEdit) deleteDeck(idOfDeckToEdit, navigate);
                                        setIsDeleting(!isDeleting);
                                    }}
                                >
                                    {isDeleting ? (window.innerWidth <= 500 ? "🗑️?" : "DELETE PERMANENTLY") : "🗑️"}
                                </DeleteDeckButton>
                            )}
                        </>
                    ) : (
                        <AddDeckButton
                            deckName={deckName}
                            currentDeckLength={currentDeckLength}
                            setCurrentDeckLength={setCurrentDeckLength}
                        />
                    )}
                    <BackButton isInDeckbuilder />
                </ButtonContainer>

                <DeckImport deckName={deckName} />

                <DeckNameContainer>
                    <DeckNameInput maxLength={35} value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                </DeckNameContainer>

                <DeckSelection />

                <SearchForm />

                <FetchedCards />
                <DetailsContainer>
                    <CardDetails />
                </DetailsContainer>

                <CardImageContainer>
                    <CardImage
                        src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBackSrc}
                        alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}
                    />
                    <CardNumberSpan>{(hoverCard ?? selectedCard)?.cardNumber}</CardNumberSpan>
                </CardImageContainer>
            </OuterContainer>
        </MenuBackgroundWrapper>
    );
}

export const OuterContainer = styled.div`
    position: absolute;
    display: flex;
    gap: 10px;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: 1900px;
    max-height: 1040px;
    width: 99vw;
    height: 98vh;
    container-type: inline-size;

    @media (max-width: 460px) {
        overflow-y: scroll;
        overflow-x: hidden;
    }

    @container (min-width: 450px) {
        display: grid;
        gap: unset;
        grid-template-rows: 0.1fr 1fr 1fr 1fr 2fr;
        grid-template-columns: 2.75fr 1fr 1.5fr;
        grid-template-areas:
            " deckname buttons buttons"
            "import-export-area cardimage details"
            "deckselection cardimage details"
            "deckselection searchform searchform"
            "deckselection fetchedcards fetchedcards";
    }
`;

export const CardImage = styled.img`
    grid-area: cardimage;
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
    filter: drop-shadow(0 0 3px #060e18);

    @container (max-width: 449px) {
        max-width: 95%;
    }
`;

export const DeckNameInput = styled.input`
    height: 40px;
    width: 95%;
    text-align: center;
    font-size: 34px;
    padding-top: 3px;
    font-family:
        League Spartan,
        sans-serif;
    border-radius: 5px;
    border: 2px solid #d32765;
    background: #1a1a1a;
`;

export const ButtonContainer = styled.div`
    grid-area: buttons;
    width: 95%;
    display: flex;
    gap: 2%;
    justify-content: space-between;
`;

export const DeckNameContainer = styled.div`
    grid-area: deckname;
    width: 100%;
    display: flex;
    justify-content: center;
`;

export const DetailsContainer = styled.div`
    height: 100%;
    padding: 0 10px 0 0;
    grid-area: details;
    overflow-y: scroll;
    overflow-x: hidden;

    @supports (-moz-appearance: none) {
        scrollbar-width: thin;
    }

    @container (min-width: 450px) {
        width: 100%;
    }

    &::-webkit-scrollbar {
        background-color: rgba(9, 8, 8, 0.98);
        border-radius: 2px;
        width: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(220, 220, 220, 0.25);
        border-radius: 2px;
    }
`;

export const CardImageContainer = styled.div`
    grid-area: cardimage;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 5px;
    position: relative;
`;

export const CardNumberSpan = styled.span`
    position: absolute;
    font-weight: 400;
    background: #0c0c0c;
    padding: 0px 3px 0px 3px;
    bottom: 0;
    right: 7%;
    border-radius: 5px;

    @media (max-width: 450px) {
        visibility: hidden;
    }
`;

const UpdateDeckButton = styled.button<{ isDeleting: boolean }>`
    height: 40px;
    width: ${(props) => (props.isDeleting ? "200px" : "300px")};
    padding: 0;
    padding-top: 5px;
    background: mediumaquamarine;
    color: black;
    font-size: ${(props) => (props.isDeleting ? "15px" : "23px")};
    font-weight: bold;
    text-align: center;
    font-family: "Sansation", sans-serif;
    filter: drop-shadow(1px 2px 3px #060e18);
    transition: all 0.3s ease;

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

const DeleteDeckButton = styled.button<{ isDeleting: boolean }>`
    font-weight: bold;
    max-height: 40px;
    min-width: 50px;
    font-size: 16px;
    background: ${(props) => (props.isDeleting ? "ghostwhite" : "crimson")};
    color: crimson;
    padding: 0;
    width: ${(props) => (props.isDeleting ? "40%" : "20%")};
    font-family: "Sansation", sans-serif;
    transition: all 0.3s ease;

    &:active {
        border: none;
        filter: none;
        transform: translateY(1px);
        box-shadow: inset 0 0 3px #000000;
    }

    &:focus {
        outline: none;
    }

    @media (max-width: 768px) and (max-height: 850px) {
        font-family: "Pixel Digivolve", sans-serif;
        font-size: ${(props) => (props.isDeleting ? "1.15em" : "1em")};
        width: ${(props) => (props.isDeleting ? "30%" : "20%")};
    }
`;
