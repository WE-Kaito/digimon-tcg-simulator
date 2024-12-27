import {CardTypeWithId} from "../../utils/types.ts";
import styled from '@emotion/styled';
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {MouseEvent, useState} from "react";
import cardBackSrc from "../../assets/cardBack.jpg";
import {useSound} from "../../hooks/useSound.ts";

type CardProps = {
    card: CardTypeWithId,
    location: string,
    setImageError?: (imageError: boolean) => void,
}

export default function DeckbuilderCard( props : CardProps ) {
    const { card, location, setImageError } = props;

    const selectCard = useGeneralStates((state) => state.selectCard);
    const setHoverCard = useGeneralStates((state) => state.setHoverCard);
    const addCardToDeck = useGeneralStates((state) => state.addCardToDeck);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);

    const [cardImageUrl, setCardImageUrl] = useState(card.imgUrl);

    function handleClick(event: MouseEvent) {
        event.stopPropagation();
        if (location === "fetchedData") {
            addCardToDeck(card.cardNumber, card.cardType, card.uniqueCardNumber);
            playPlaceCardSfx();
        } else selectCard(card);
    }

    return (
        <StyledImage
            onClick={handleClick}
            onMouseEnter={() => setHoverCard(card)}
            onMouseOver={() => setHoverCard(card)}
            onMouseLeave={() => setHoverCard(null)}
            alt={card.name + " " + card.uniqueCardNumber}
            src={cardImageUrl}
            location={location}
            onError={() => {
                setImageError?.(true);
                setCardImageUrl(cardBackSrc);
            }}
        />
    )
}

const StyledImage = styled.img<{ location: string }>`
  width: ${({location}) => ((location === "deck" || location === "fetchedData") ? "63px" : "95px")};
  max-width: ${({location}) => (location === "deck" ? "130px" : "unset")};
  border-radius: 5px;
  transition: all 0.15s ease-out;
  cursor: ${({location}) => (location === "deck" ? "help" : "cell" )};
  opacity: 1;
  filter: drop-shadow(0 0 1.5px #004567);

  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite);
    transform: scale(1.1);
  }

  @media (min-width: 500px) {
    min-width: 85px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
  
  @media (min-width: 1000px) {
    width: ${({location}) => (location === "deck" ? "5.9vw" : "105px")};
  }

  @media (max-width: 700px) and (min-height: 800px) {
    width: 80px;
  }
  
  @media (max-width: 390px) {
    width: 61px;
  }
`;
