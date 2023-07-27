import {CardType} from "../utils/types.ts";
import styled from '@emotion/styled';
import {useStore} from "../hooks/useStore.ts";

function Card({card}: { card: CardType }) {

    const selectCard = useStore((state) => state.selectCard);
    const setHoverCard = useStore((state) => state.setHoverCard);


    return (
        <StyledImage onClick={() => selectCard(card)}
                     onMouseEnter={() => setHoverCard(card)}
                     onMouseLeave={() => setHoverCard(null)}
                     alt={card.name + " " + card.cardnumber}
                     src={card.image_url}/>
    );
}

export default Card;

const StyledImage = styled.img`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;
  filter: drop-shadow(0 0 1px #004567);
  transition: transform 0.2s ease, filter 0.2s ease;
  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite);
    transform: scale(1.1);
    cursor: pointer;
  }

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;