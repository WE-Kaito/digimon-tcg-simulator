import { CardTypeWithId } from "../utils/types.ts";
import styled from '@emotion/styled';
import { useStore } from "../hooks/useStore.ts";
import { useDrag } from "react-dnd";

export default function Card({ card, location }: { card: CardTypeWithId, location: string }) {
    const selectCard = useStore((state) => state.selectCard);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const deleteFromDeck = useStore((state) => state.deleteFromDeck);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "card",
        item: { id: card.id, location: location, cardnumber: card.cardnumber, type: card.type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <StyledImage
            ref={drag}
            onClick={() => location === "deck" ? deleteFromDeck(card.id) : selectCard(card)}
            onMouseEnter={() => setHoverCard(card)}
            onMouseLeave={() => setHoverCard(null)}
            alt={card.name + " " + card.cardnumber}
            src={card.image_url}
            isDragging={isDragging}
            location={location}
        />
    );
}

type StyledImageProps = {
    isDragging: boolean,
    location: string
}

const StyledImage = styled.img<StyledImageProps>`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;
  transition: transform 0.2s ease, filter 0.2s ease;
  cursor: ${(props) => (props.location === "deck" ? "not-allowed" : "grab")};
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
  filter: ${(props) => (props.isDragging ? "drop-shadow(0 0 3px #ff2190)" : "drop-shadow(0 0 1.5px #004567)")};

  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite);
    transform: scale(1.1);
  }

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;
