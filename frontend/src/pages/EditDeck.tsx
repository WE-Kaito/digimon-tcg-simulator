import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/FetchedCards.tsx";
import SearchForm from "../components/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/DeckSelection.tsx";
import CardDetails from "../components/CardDetails.tsx";
import BackButton from "../components/BackButton.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    ContainerUpperLeftQuarter,
    DeckNameInput,
    OuterContainer,
    CardImage,
    ContainerUpperRightQuarter,
    ContainerBottomRightQuarter,
    ContainerBottomLeftQuarter, StyledSpanSaveDeck, DeckNameContainer
} from "./Deckbuilder.tsx";

export default function EditDeck() {

    const {id} = useParams();
    const setDeckById = useStore(state => state.setDeckById);
    const updateDeck = useStore(state => state.updateDeck);
    const nameOfDeckToEdit = useStore(state => state.nameOfDeckToEdit);

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const deleteDeck = useStore((state) => state.deleteDeck);
    const [deckName, setDeckName] = useState<string>("");

    const fetchCards = useStore((state) => state.fetchCards);
    const fetchedCards = useStore((state) => state.fetchedCards);
    const filterCards = useStore((state) => state.filterCards);

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setDeckById(id);
        setDeckName(nameOfDeckToEdit);
    }, [setDeckName, nameOfDeckToEdit, id, setDeckById]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    useEffect(() => {
        filterCards(null, null, null, null, null, null, null, null, null, null, null);
    }, [fetchedCards, filterCards]);

    return (
        <OuterContainer>

            <DeckNameContainer>
                <DeckNameInput maxLength={35} value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
            </DeckNameContainer>

            <ButtonContainer>
                <UpdateDeckButton isDeleting={isDeleting}
                                  onClick={() => id && updateDeck(id, deckName)}><StyledSpanSaveDeck>SAVE
                    CHANGES</StyledSpanSaveDeck></UpdateDeckButton>
                <DeleteDeckButton isDeleting={isDeleting} onClick={() => {
                    if (isDeleting && id) deleteDeck(id, navigate);
                    setIsDeleting(!isDeleting)
                }}>{!isDeleting ? "🗑️" : "DELETE PERMANENTLY"}</DeleteDeckButton>
                <BackButton/>
            </ButtonContainer>

            <ContainerUpperLeftQuarter>
                <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                           alt={selectedCard?.name ?? "Card"}/>
            </ContainerUpperLeftQuarter>

            <ContainerUpperRightQuarter>
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
  grid-area: buttons;
  width: 100%;
  display: flex;
  padding-left: 3%;
  gap: 2%;
  padding-right: 3%;
  justify-content: space-between;
  @media (min-width: 767px) {
    transform: translateY(12px);
  }
`;

const UpdateDeckButton = styled.button<ButtonProps>`
  height: 40px;
  width: ${props => props.isDeleting ? "200px" : "300px"};
  padding: 0;
  padding-top: 5px;
  background: mediumaquamarine;
  color: black;
  font-size: ${props => props.isDeleting ? "15px" : "23px"};
  font-weight: bold;
  text-align: center;
  font-family: 'Sansation', sans-serif;
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

type ButtonProps = {
    isDeleting: boolean;
}

const DeleteDeckButton = styled.button<ButtonProps>`
  font-weight: bold;
  max-height: 40px;
  background: ${props => props.isDeleting ? "ghostwhite" : "crimson"};
  color: crimson;
  padding: 0;
  width: ${props => props.isDeleting ? "40%" : "20%"};
  font-family: 'Sansation', sans-serif;
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
`;
