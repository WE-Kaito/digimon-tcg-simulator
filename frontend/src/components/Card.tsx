import {CardType} from "../utils/types.ts";
import styled from "styled-components";

function Card({card}: { card: CardType }) {
    return (
        <StyledImage alt={card.name +" "+ card.cardnumber} src={card.image_url}/>
    );
}

export default Card;

const StyledImage = styled.img`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;
  filter: drop-shadow(0 0 1px #004567);

  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite);
    transform: scale(1.1);
  }

  @media (min-width: 768px) {
    width: 96px;
  }
`;