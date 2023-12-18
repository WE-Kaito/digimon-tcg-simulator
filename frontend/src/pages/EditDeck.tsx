import styled from '@emotion/styled';
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore.ts";
import FetchedCards from "../components/deckbuilder/FetchedCards.tsx";
import SearchForm from "../components/deckbuilder/SearchForm.tsx";
import cardBack from "../assets/cardBack.jpg";
import DeckSelection from "../components/deckbuilder/DeckSelection.tsx";
//import CardDetails from "../components/CardDetails.tsx";
import BackButton from "../components/BackButton.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    Wrapper,
    ContainerUpperLeftQuarter,
    DeckNameInput,
    OuterContainer,
    CardImage,
    ContainerUpperRightQuarter,
    ContainerBottomRightQuarter,
    ContainerBottomLeftQuarter, StyledSpanSaveDeck, DeckNameContainer
} from "./Deckbuilder.tsx";
import DeckImport from "../components/deckbuilder/DeckImport.tsx";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "../components/ParticlesBackground.tsx";
import CardDetails from "../components/CardDetails.tsx";

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
    const [shouldRender, setShouldRender] = useState(window.innerWidth >= 1000);

    useEffect(() => {
        setDeckById(id);
        fetchCards();
        filterCards("", "", "", "", "", "", "", null, null, null, "", "");
        setDeckName(nameOfDeckToEdit);
        function handleResize() {
            setShouldRender(window.innerWidth >= 1000);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
        <Wrapper>
            <ParticlesBackground options={blueTriangles}/>
        <OuterContainer>

            <DeckNameContainer>
                <DeckNameInput maxLength={35} value={deckName} onChange={(e) => setDeckName(e.target.value)}/>
            </DeckNameContainer>

            <ButtonContainer>
                <UpdateDeckButton isDeleting={isDeleting}
                                  onClick={() => id && updateDeck(id, deckName)}><StyledSpanSaveDeck>SAVE
                    {`${!mobileSize ? "CHANGES" : ""}`}</StyledSpanSaveDeck></UpdateDeckButton>
                <DeleteDeckButton isDeleting={isDeleting} onClick={() => {
                    if (isDeleting && id) deleteDeck(id, navigate);
                    setIsDeleting(!isDeleting)
                }}>{getDeleteString()}</DeleteDeckButton>
                <BackButton/>
            </ButtonContainer>

            <ContainerUpperLeftQuarter>
                <CardImage src={(hoverCard ?? selectedCard)?.imgUrl ?? cardBack}
                           alt={selectedCard?.name ?? "Card"}/>
            </ContainerUpperLeftQuarter>

            <ContainerUpperRightQuarter>
                <CardDetails/>
            </ContainerUpperRightQuarter>


            <ContainerBottomLeftQuarter>
                {shouldRender && <DeckImport/>}
                <DeckSelection/>
            </ContainerBottomLeftQuarter>

            <ContainerBottomRightQuarter>
                <SearchForm/>
                <FetchedCards/>
            </ContainerBottomRightQuarter>
        </OuterContainer>
        </Wrapper>
    );
}

const ButtonContainer = styled.div`
  grid-area: buttons;
  width: 100%;
  max-width: 44.5vw;
  display: flex;
  padding-left: 3%;
  gap: 2%;
  padding-right: 3%;
  justify-content: space-between;
  @media (max-width: 600px) {
    transform: scale(0.9) translateX(-3px);
  }
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

  @media (max-width: 768px) and (max-height: 850px) {
    font-size: ${props => props.isDeleting ? "15px" : "21px"};
    width: ${props => props.isDeleting ? "60px" : "80px"};
  }

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
