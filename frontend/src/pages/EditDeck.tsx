import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
import BackButton from "../components/BackButton.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    DeckNameInput,
    OuterContainer,
    CardImage,
    StyledSpanSaveDeck,
    DeckNameContainer, DetailsContainer, ButtonContainer, CardImageContainer, CardNumberSpan
} from "./Deckbuilder.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function EditDeck() {

    const {id} = useParams();
    const setDeckById = useStore(state => state.setDeckById);
    const updateDeck = useStore(state => state.updateDeck);
    const nameOfDeckToEdit = useStore(state => state.nameOfDeckToEdit);
    const fetchCards = useStore((state) => state.fetchCards);
    const filterCards = useStore((state) => state.filterCards);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);
    const deleteDeck = useStore((state) => state.deleteDeck);
    const [deckName, setDeckName] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const navigate = useNavigate();

    const cardBackUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/cardBack.jpg";

    useEffect(() => {
        setDeckById(id);
        fetchCards();
        filterCards("", "", "", "", "", "", "", "", "", null, null, null, "", "", false, true);
        setDeckName(nameOfDeckToEdit);
    }, [setDeckName, nameOfDeckToEdit, id, setDeckById, fetchCards, filterCards]);

    const mobileSize = window.innerWidth < 500;

    function getDeleteString() {
        if (!isDeleting) {
            return "🗑️";
        } else {
            return mobileSize ? "🗑️?" : "DELETE PERMANENTLY";
        }
    }

    return (
        <MenuBackgroundWrapper>
            <OuterContainer>

                <ButtonContainer>
                    <UpdateDeckButton isDeleting={isDeleting}
                                      onClick={() => id && updateDeck(id, deckName)}>
                        <StyledSpanSaveDeck>
                            SAVE {`${!mobileSize ? "CHANGES" : ""}`}
                        </StyledSpanSaveDeck>
                    </UpdateDeckButton>
                    <DeleteDeckButton isDeleting={isDeleting} onClick={() => {
                        if (isDeleting && id) deleteDeck(id, navigate);
                        setIsDeleting(!isDeleting)
                    }}>{getDeleteString()}</DeleteDeckButton>
                    <BackButton isOnEditPage/>
                </ButtonContainer>

                <DeckImport deckName={deckName}/>

                <DeckNameContainer>
                    <DeckNameInput maxLength={35} value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
                </DeckNameContainer>

                <DeckSelection/>

                <SearchForm/>

                <FetchedCards/>

                <DetailsContainer>
                    <CardDetails/>
                </DetailsContainer>

                <CardImageContainer>
                <CardImage src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBackUrl}
                           alt={hoverCard?.name ?? (!hoverCard ? (selectedCard?.name ?? "Card") : "Card")}/>
                    <CardNumberSpan>{(hoverCard ?? selectedCard)?.cardNumber}</CardNumberSpan>
                </CardImageContainer>
            </OuterContainer>
        </MenuBackgroundWrapper>
    );
}

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
  min-width: 50px;
  font-size: 16px;
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

  @media (max-width: 768px) and (max-height: 850px) {
    font-family: 'Pixel Digivolve', sans-serif;
    font-size: ${props => props.isDeleting ? "1.15em" : "1em"};
    width: ${props => props.isDeleting ? "30%" : "20%"};
  }
`;
