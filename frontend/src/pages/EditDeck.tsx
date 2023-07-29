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
import {Props} from "simplebar-react";

export default function EditDeck() {

    const {id} = useParams();
    const setDeckById = useStore(state => state.setDeckById);
    const updateDeck = useStore(state => state.updateDeck);
    const nameOfDeckToEdit = useStore(state => state.nameOfDeckToEdit);
    const isLoading = useStore(state => state.isLoading);

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const [deckName, setDeckName] = useState<string>("");

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
                    <UpdateDeckButton onClick={() => id && updateDeck(id, deckName)}>💾</UpdateDeckButton>
                    <DeleteDeckButton isDeleting={isDeleting} onClick={()=> setIsDeleting(!isDeleting)}>{!isDeleting ? "🗑️" : "DELETE PERMANENTLY"}</DeleteDeckButton>
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

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  padding-left: 1%;
  gap: 2%;
  padding-right: 1%;
  justify-content: space-between;
`;

const UpdateDeckButton = styled.button`
  height: 40px;
  width: 40px;
  padding: 0;
  padding-top: 5px;
  background: mediumaquamarine;
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
  filter: drop-shadow(1px 2px 3px #060e18);

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

type ButtonProps = {
    isDeleting: boolean;
}

const DeleteDeckButton = styled.button<ButtonProps>`
background: crimson;
  padding: 0;
  width: ${props => props.isDeleting ? "200px" : "60px"};
  font-family: 'Sansation', sans-serif;
    font-size: ${props => props.isDeleting ? "15px" : "25px"};
  transition: all 0.3s ease;
`;