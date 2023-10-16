import {CardTypeGame, CardTypeWithId, DraggedItem} from "../utils/types.ts";
import styled from '@emotion/styled';
import {useStore} from "../hooks/useStore.ts";
import {useDrag, useDrop} from "react-dnd";
import {useGame} from "../hooks/useGame.ts";
import {getCardSize, topCardInfo} from "../utils/functions.ts";
import {playPlaceCardSfx, playSuspendSfx, playUnsuspendSfx} from "../utils/sound.ts";
import stackIcon from "../assets/stackIcon.png";
import {useEffect, useState} from "react";

type CardProps = {
    card: CardTypeWithId | CardTypeGame,
    location: string,
    sendUpdate?: () => void
    sendSfx?: (sfx: string) => void,
    index?: number,
    draggedCards?: CardTypeGame[],
    setDraggedCards?: (cards: CardTypeGame[]) => void
    handleDropToStackBottom?: (cardId: string, from: string, to: string, name: string) => void
}

const opponentFieldLocations = ["opponentReveal", "opponentDeckField", "opponentEggDeck", "opponentTrash", "opponentSecurity",
    "opponentTamer", "opponentDelay", "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5",
    "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10", "opponentBreedingArea"];
const tiltLocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8", "myDigi9", "myDigi10", "myTamer"];

export default function Card({card, location, sendUpdate, sendSfx, index, draggedCards, setDraggedCards, handleDropToStackBottom}: CardProps) {
    const selectCard = useStore((state) => state.selectCard);
    const selectedCard = useStore((state) => state.selectedCard);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const tiltCard = useGame((state) => state.tiltCard);
    const locationCards = useGame((state) => state[location as keyof typeof state] as CardTypeGame[]);
    const addCardToDeck = useStore((state) => state.addCardToDeck);
    const opponentReady = useGame((state) => state.opponentReady);
    const hoverCard = useStore((state) => state.hoverCard)
    const [canDropToStackBottom, setCanDropToStackBottom] = useState(false);

    const [{isDragging}, drag] = useDrag(() => ({
        type: "card",
        item: {id: card.id, location: location, cardnumber: card.cardnumber, type: card.type, name: card.name},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const [{isDraggingStack, dragStackItem}, dragStack] = useDrag({
        type: "card-stack",
        item: {index: index, location: location},
        collect: (monitor) => ({
            isDraggingStack: !!monitor.isDragging(),
            dragStackItem: monitor.getItem(),
        }),
    });

    const [{isOver, canDrop}, dropToBottom] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location: loc, type, name} = item;
            if (type === "Token" || !handleDropToStackBottom) return;
            handleDropToStackBottom(id, loc, location, name);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    useEffect(() => {
        if (setDraggedCards) {
            if (isDraggingStack && dragStackItem.index) {
                setDraggedCards(locationCards.slice(0, dragStackItem.index + 1));
            }
            if (!isDraggingStack) setDraggedCards([]);
        }
    }, [isDraggingStack, dragStackItem, locationCards, setDraggedCards]);

    useEffect(() => {
        if(!canDropToStackBottom && canDrop) {
            const timer = setTimeout(() => {
                setCanDropToStackBottom(true);
            }, 20);
            return () => clearTimeout(timer);
        }
        if (canDropToStackBottom && !canDrop) setCanDropToStackBottom(false)
    }, [canDrop,canDropToStackBottom, setCanDropToStackBottom]);

    const dragStackEffect = draggedCards ? draggedCards.includes(card as CardTypeGame) : false;

    function getTiltable() {
        if (location === "myTamer") {
            return card.type === "Tamer";
        } else {
            return tiltLocations.includes(location) && card === locationCards[locationCards.length - 1];
        }
    }

    function handleClick() {
        if (location === "fetchedData") {
            addCardToDeck(card.cardnumber, card.type);
            playPlaceCardSfx();
        } else {
            if (getTiltable() && sendSfx && selectedCard === card) {
                tiltCard(card.id, location, playSuspendSfx, playUnsuspendSfx, sendSfx);
                if (sendUpdate) sendUpdate();
            } else {
                selectCard(card);
            }
        }
    }

    const utilIcon: boolean = ((hoverCard === card) || !!('ontouchstart' in window || navigator.maxTouchPoints));

    return (
        <div style={{position: "relative"}}>
            {!isDraggingStack && !!(index) && (index > 0) && utilIcon &&
                <DragIcon
                    ref={dragStack}
                    onMouseEnter={() => setHoverCard(hoverCard)}
                    onMouseLeave={() => setHoverCard(null)}
                    src={stackIcon} alt={"stack"}
                />}
            <StyledImage
                ref={!opponentFieldLocations.includes(location) && opponentReady ? drag : undefined}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                onMouseEnter={() => setHoverCard(card)}
                onMouseOver={() => setHoverCard(card)}
                onMouseLeave={() => setHoverCard(null)}
                alt={card.name + " " + card.cardnumber}
                src={card.image_url}
                isDragging={isDragging || dragStackEffect}
                location={location}
                isTilted={((card as CardTypeGame)?.isTilted) ?? false}
                title={topCardInfo(card as CardTypeGame, location, locationCards)}
            />
            {handleDropToStackBottom && (index === 0) && canDropToStackBottom &&
                <DTSBZone isOver={isOver} ref={dropToBottom}/>}
        </div>)
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
  cursor: ${({location}) => (location === "deck" ? "help" : (location === "fetchedData" ? "cell" : "grab"))};
  opacity: ${({isDragging}) => (isDragging ? 0.6 : 1)};
  filter: ${({isDragging}) => (isDragging ? "drop-shadow(0 0 3px #ff2190) saturate(10%) brightness(120%)" : "drop-shadow(0 0 1.5px #004567)")};
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

  @media (min-width: 1000px) {
    width: ${(props) => getCardSize(props.location)};
  }

  @media (max-width: 700px) and (min-height: 800px) {
    width: 80px;
  }

  @media (max-width: 390px) and (min-height: 800px) {
    width: 68.5px;
  }
`;

const DragIcon = styled.img`
  width: 17px;
  position: absolute;
  z-index: 1;
  bottom: 2px;
  left: 1px;
  pointer-events: auto;
  transition: all 0.075s ease-in;

  &:hover, &:active {
    z-index: 1000;
    cursor: grab;
    transform: scale(1.75);
    filter: drop-shadow(0 0 1px ghostwhite) hue-rotate(90deg);
  }
`;

const DTSBZone = styled.div<{isOver: boolean}>`
  position: absolute;
  bottom: -3px;
  left: 0;
  z-index: 4;
  height: 27px;
  width: 95px;
  background: rgba(236, 148, 241, ${({isOver}) => (isOver ? "0.25" : "0")});
  border-radius: 5px;
  transition: all 0.15s ease-in-out;
`;
