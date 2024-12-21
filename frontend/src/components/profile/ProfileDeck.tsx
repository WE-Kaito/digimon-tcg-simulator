import {CardType, DeckType} from "../../utils/types.ts";
import styled from "@emotion/styled";
import {useNavigate} from "react-router-dom";
import {fallbackCardNumber, useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {generateGradient, getCardTypeImage, handleImageError} from "../../utils/functions.ts";
import {getSleeve} from "../../utils/sleeves.ts";
import LevelDistribution from "./LevelDistribution.tsx";
import {Dispatch, SetStateAction} from "react";
import {Chip} from "@mui/material";
import { grey, teal } from '@mui/material/colors';
import {generalToken} from "../../utils/tokens.ts";
import hackmonImg from "../../assets/Hackmon.webp";
import {useSound} from "../../hooks/useSound.ts";

const tokenImageUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/tokenCard.jpg";

export type ProfileDeckProps = {
    deck: DeckType;
    setSleeveSelectionOpen: Dispatch<SetStateAction<boolean>>;
    setImageSelectionOpen: Dispatch<SetStateAction<boolean>>;
    isDragging?: boolean;
    lobbyView?: boolean;
}

export default function ProfileDeck(props: Readonly<ProfileDeckProps>) {

    const {deck, isDragging, setSleeveSelectionOpen, setImageSelectionOpen, lobbyView} = props;

    const fetchedCards = useGeneralStates(state => state.fetchedCards);
    const setSelectedSleeveOrImage = useGeneralStates((state) => state.setSelectedSleeveOrImage);
    const setDeckIdToSetSleeveOrImage = useGeneralStates((state) => state.setDeckIdToSetSleeveOrImage);
    const setDeckById = useGeneralStates((state) => state.setDeckById);

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const navigate = useNavigate();
    const navigateToDeck = () => {
        playDrawCardSfx();
        navigate(`/update-deck`);
        setDeckById(deck.id);
    }

    function onSleeveClick() {
        setSelectedSleeveOrImage(deck.sleeveName);
        setDeckIdToSetSleeveOrImage(deck.id);
        setSleeveSelectionOpen(true);
    }

    function onImageClick() {
        setDeckById(deck.id);
        setSelectedSleeveOrImage(deck.deckImageCardUrl);
        setDeckIdToSetSleeveOrImage(deck.id);
        setImageSelectionOpen(true);
    }

    const deckCards : CardType[] = deck.decklist.map((uniqueCardNumber) =>
        fetchedCards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0]
        ?? fetchedCards.filter((card) => card.cardNumber === uniqueCardNumber.split("_")[0])[0]
        ?? {...generalToken, cardNumber: fallbackCardNumber}
    );

    const digimonCount = deckCards.filter(card => card.cardType === "Digimon").length;
    const tamerCount = deckCards.filter(card => card.cardType === "Tamer").length;
    const optionCount = deckCards.filter(card => card.cardType === "Option").length;
    const eggCount = deckCards.filter(card => card.cardType === "Digi-Egg").length;

    const errorCount = deckCards.filter(card => card.cardNumber === fallbackCardNumber).length;

    return (
        <WrapperDiv style={{ pointerEvents: isDragging ? "none" : "unset"}} lobbyView={lobbyView}>
            {!!errorCount && <ErrorSpan>{`${errorCount} missing cards`}</ErrorSpan>}
            {!lobbyView && <DeckName>{deck.name}</DeckName>}
            <ContainerDiv style={{ transform: isDragging ? "scale(0.95)" : "unset" }} lobbyView={lobbyView}>

                <LevelDistribution deckCards={deckCards}/>

                <CardTypeDigimon><img src={getCardTypeImage("Digimon")} alt={"Digimon"}/><span>{digimonCount}</span></CardTypeDigimon>
                <CardTypeTamer><img src={getCardTypeImage("Tamer")} alt={"Tamer"}/><span>{tamerCount}</span></CardTypeTamer>
                <CardTypeOption><img src={getCardTypeImage("Option")} alt={"Option"}/><span>{optionCount}</span></CardTypeOption>
                <CardTypeEgg><img src={getCardTypeImage("Digi-Egg")} alt={"Egg"}/><span>{eggCount}</span></CardTypeEgg>

                <ChipEn label={"EN"} sx={{backgroundColor: deck.isAllowed_en ? teal["A700"] : grey[800]}} />
                <ChipJp label={"JP"} sx={{backgroundColor: deck.isAllowed_jp ? teal["A700"] : grey[800]}} />

                {!lobbyView && <EditButton onClick={navigateToDeck}>EDIT➤</EditButton>}

                <SleeveImage src={getSleeve(deck.sleeveName)} onError={handleImageError} onClick={onSleeveClick}/>

                <CardImage hasError={!!errorCount} src={errorCount ? hackmonImg : deck.deckImageCardUrl ?? tokenImageUrl}
                           onError={handleImageError} onClick={onImageClick}/>

                <ColorLineDiv style={{ background: generateGradient(deckCards)}}/>
            </ContainerDiv>
        </WrapperDiv>
    );
}

const WrapperDiv = styled.div<{lobbyView?: boolean}>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  border-radius: 12px;
  height: ${({lobbyView}) => lobbyView ? 160 : 180}px;
  width: 280px;
  background: linear-gradient(20deg, rgba(87, 171, 255, 0.12) 0%, rgba(93, 159, 236, 0.12) 70%, rgba(94, 187, 245, 0.22) 100%);
  padding: 3px;
  box-shadow: inset 0 0 3px 0 rgba(148, 224, 255, 0.4);
`;

const ContainerDiv = styled.div<{lobbyView?: boolean}>`
  position: relative;
  width: 100%;
  height: ${({lobbyView}) => lobbyView ? "92.5%" : "81.5%"};
  padding: 6px;
  display: grid;
  justify-content: center;
  align-items: center;
  gap: 4px;
  grid-template-columns: 1fr 1fr 1fr 0.8fr 0.8fr 1.2fr 1.2fr;
  grid-template-rows: repeat(6, 1fr);
  grid-template-areas:  'card-image card-image card-image levels levels digimons tamers'
                        'card-image card-image card-image levels levels options eggs'
                        'card-image card-image card-image sleeve sleeve allowed_en allowed_jp'
                        'card-image card-image card-image sleeve sleeve edit edit'
                        'card-image card-image card-image sleeve sleeve edit edit'
                        'card-image card-image card-image colors colors colors colors';
  background-color: #070707;
  box-shadow: inset 0 0 3px 0 rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  transition: all 0.2s ease;
`;

const EditButton = styled.button`
  grid-area: edit;
  padding: 0 0 1px 2px;

  border-bottom: 1px solid #131313;
  border-right: 1px solid #131313;

  cursor: pointer;
  width: 95%;
  height: 75%;
  border-radius: 0;
  background: black;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 14px;
  color: white;
  letter-spacing: 2px;
  box-shadow: 3px 6px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.9);
    color: #0c0c0c;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 1px 2px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

const DeckName = styled.span`
  font-family: 'League Spartan', sans-serif;
  font-size: 16px;
  color: ghostwhite;
  position: absolute;
  max-width: 240px;
  overflow-x: clip;
  left: 10px;
  top: 2px;
  text-align: left;
  text-shadow: 1px 1px 2px black;
`;


const CardImage = styled.img<{ hasError: boolean}>`
  max-height: 100%;
  grid-area: card-image;
  border-radius: 6px;
  pointer-events: ${({hasError}) => hasError ? "none" : "unset"};
  transform: ${({hasError}) => hasError ? "translate(-5px, -7px)" : "unset"};
  :hover {
    cursor: pointer;
    filter: drop-shadow(0 0 3px rgba(87, 160, 255, 0.6)) contrast(1.1);
  }
`;

const SleeveImage = styled.img`
  max-height: 100%;
  border-radius: 2px;
  grid-area: sleeve;
  transform: translate(-2px, -1px);
  
  :hover {
    cursor: pointer;
    filter: drop-shadow(0 0 2px rgba(87, 160, 255, 0.5)) contrast(1.1);
  }
`;

const CardTypeContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    height: 22px;
  }
  
  span {
    font-family: Cousine, sans-serif;
    font-size: 16px;
    position: absolute;
    left: 25px;
    top: 0;
  }
`;

const CardTypeDigimon = styled(CardTypeContainer)`
  grid-area: digimons;
`;

const CardTypeTamer = styled(CardTypeContainer)`
  grid-area: tamers;
`;

const CardTypeOption = styled(CardTypeContainer)`
  grid-area: options;
  img{
    transform: translateY(1px);
  }
`;

const CardTypeEgg = styled(CardTypeContainer)`
  grid-area: eggs;
`;

const ColorLineDiv = styled.div`
  grid-area: colors;
  width: 100%;
  height: 15px;
  border-radius: 3px;
  transform: translate(-1px, 2px);
  box-shadow: inset 0 0 2px 0 rgba(219, 236, 243, 0.4);
`;

const StyledChip = styled(Chip)`
  border-radius: 5px;
  height: 20px;
  font-weight: bolder;
  box-shadow: inset 0 0 2px 0 rgba(0, 0, 0, 0.7);
  transform: translateY(1px);
  span { transform: translateY(1px); }
`;

const ChipEn = styled(StyledChip)`
  grid-area: allowed_en;
`;

const ChipJp = styled(StyledChip)`
  grid-area: allowed_jp;
`;

const ErrorSpan = styled.span`
  font-family: 'League Spartan', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: crimson;
  position: absolute;
  bottom: 3px;
  left: 10px;
  z-index: 6;
`;
