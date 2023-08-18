import {CardTypeGame, CardTypeWithId} from "../utils/types.ts";
import styled from '@emotion/styled';
import {useStore} from "../hooks/useStore.ts";
import {useDrag} from "react-dnd";
import {useGame} from "../hooks/useGame.ts";
import {topCardInfo} from "../utils/functions.ts";
import {playSuspendSfx} from "../utils/sound.ts";

type CardProps = {
    card: CardTypeWithId | CardTypeGame,
    location: string,
    sendUpdate?: () => void
}

export default function Card({card, location, sendUpdate}: CardProps) {
    const selectCard = useStore((state) => state.selectCard);
    const selectedCard = useStore((state) => state.selectedCard);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const deleteFromDeck = useStore((state) => state.deleteFromDeck);
    const tiltCard = useGame((state) => state.tiltCard);
    const locationCards = useGame((state) => state[location as keyof typeof state] as CardTypeGame[]);

    const [{isDragging}, drag] = useDrag(() => ({
        type: "card",
        item: {id: card.id, location: location, cardnumber: card.cardnumber, type: card.type},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const tiltLocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5"];
    const tiltable = tiltLocations.includes(location);

    function handleClick() {
        if (location === "deck") {
            deleteFromDeck(card.id);
        } else {
            if (tiltable && selectedCard === card) {
                playSuspendSfx();
                tiltCard(card.id, location);
            } else {
                selectCard(card);
            }
            if (tiltable && sendUpdate) sendUpdate();
        }
    }

    return (
        <StyledImage
            ref={drag}
            onClick={handleClick}
            onMouseEnter={() => setHoverCard(card)}
            onMouseLeave={() => setHoverCard(null)}
            alt={card.name + " " + card.cardnumber}
            src={card.image_url}
            isDragging={isDragging}
            location={location}
            isTilted={(card as CardTypeGame)?.isTilted ?? false}
            title={topCardInfo(card as CardTypeGame, location, locationCards)}
        />)
}

type StyledImageProps = {
    isDragging: boolean,
    location: string
    isTilted: boolean
}

const StyledImage = styled.img<StyledImageProps>`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;
  transition: all 0.15s ease-out;
  cursor: ${({location}) => (location === "deck" ? "not-allowed" : "grab")};
  opacity: ${({isDragging}) => (isDragging ? 0.5 : 1)};
  filter: ${({isDragging}) => (isDragging ? "drop-shadow(0 0 3px #ff2190)" : "drop-shadow(0 0 1.5px #004567)")};
  transform: ${({isTilted}) => (isTilted ? "rotate(30deg)" : "rotate(0deg)")};
  animation: ${({isTilted}) => (isTilted ? "pulsate 5s ease-in-out infinite" : "")};

  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite) ${({isTilted}) => (isTilted ? "brightness(0.5)" : "")};
    transform: scale(1.1) ${({isTilted}) => (isTilted ? "rotate(30deg)" : "rotate(0deg)")};
  }

  @keyframes pulsate {
    0%, 40%, 100% {
      filter: drop-shadow(0 0 0px #004567) brightness(0.65) saturate(0.8);
    }
    70% {
      filter: drop-shadow(0 0 4px #ff2190) brightness(0.65) saturate(1.5);
    }
  }

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: ${(props) => ((props.location === "myTrash" || props.location === "opponentTrash") ? "105px" : "95px")};
  }
`;
