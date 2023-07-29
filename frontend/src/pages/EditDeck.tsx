import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/DeckSelection.tsx";
import CardDetails from "../components/CardDetails.tsx";
import {ToastContainer} from 'react-toastify';
import BackButton from "../components/BackButton.tsx";
import {useParams} from "react-router-dom";
import {
    ContainerUpperLeftQuarter,
    DeckNameInput,
    OuterContainer,
    CardImage,
    ContainerUpperRightQuarter,
    ContainerBottomRightQuarter,
    ContainerBottomLeftQuarter
} from "./Deckbuilder.tsx";
import {css} from "@emotion/css";

export default function EditDeck() {

    const {id} = useParams();
    const setDeckById = useStore(state => state.setDeckById);
    const updateDeck = useStore(state => state.updateDeck);
    const nameOfDeckToEdit = useStore(state => state.nameOfDeckToEdit);
    const isLoading = useStore(state => state.isLoading);

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const [deckName, setDeckName] = useState<string>("");

    useEffect(() => {
        setDeckById(id);
        setDeckName(nameOfDeckToEdit);
    }, [setDeckName, nameOfDeckToEdit, id, setDeckById]);

    if (isLoading) {
        return <h1 className={css`font-family: 'Pixel Digivolve', sans-serif;`}>Loading...</h1>
    }

    return (
        <OuterContainer>

            <ToastContainer/>

            <ContainerUpperLeftQuarter>
                <DeckNameInput value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
                <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                           alt={selectedCard?.name ?? "Card"}/>
            </ContainerUpperLeftQuarter>

            <ContainerUpperRightQuarter>
                <ButtonContainer>
                    <UpdateDeckButton onClick={() => id && updateDeck(id, deckName)}>Update</UpdateDeckButton>
                    <BackButton/>
                </ButtonContainer>
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

const ButtonContainer = styled.div``;

const UpdateDeckButton = styled.button``;