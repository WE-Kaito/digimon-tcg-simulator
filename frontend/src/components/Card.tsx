import {CardTypeGame, CardTypeWithId, DraggedItem} from "../utils/types.ts";
import styled from '@emotion/styled';
import {useStore} from "../hooks/useStore.ts";
import {useDrag, useDrop} from "react-dnd";
import {useGame} from "../hooks/useGame.ts";
import {getCardSize, locationsWithInheritedInfo, topCardInfo} from "../utils/functions.ts";
import {playPlaceCardSfx, playSuspendSfx, playUnsuspendSfx} from "../utils/sound.ts";
import stackIcon from "../assets/stackIcon.png";
import {useEffect, useState} from "react";
import Lottie from "lottie-react";
import activateEffectAnimation from "../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../assets/lotties/target-animation.json";
import {getNumericModifier} from "./game/ModifierMenu.tsx";
import ShieldIcon from '@mui/icons-material/Shield';

const myBALocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8", "myDigi9",
    "myDigi10", "myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15", "myBreedingArea"]

const opponentBALocations = ["opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5", "opponentDigi6",
    "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10", "opponentDigi11", "opponentDigi12", "opponentDigi13",
    "opponentDigi14", "opponentDigi15", "opponentBreedingArea"]

const opponentFieldLocations = [...opponentBALocations, "opponentReveal", "opponentDeckField", "opponentEggDeck", "opponentTrash", "opponentSecurity"];

const cardBackUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/cardBack.jpg";

type CardProps = {
    card: CardTypeWithId | CardTypeGame,
    location: string,
    sendTiltCard?: (cardId: string, location: string) => void,
    sendSfx?: (sfx: string) => void,
    index?: number,
    draggedCards?: CardTypeGame[],
    setDraggedCards?: (cards: CardTypeGame[]) => void
    handleDropToStackBottom?: (cardId: string, from: string, to: string, name: string) => void,
    setImageError?: (imageError: boolean) => void
}

export default function Card( props : CardProps ) {
    const {card, location, sendTiltCard, sendSfx, index, draggedCards, setDraggedCards, handleDropToStackBottom, setImageError} = props;

    const selectCard = useStore((state) => state.selectCard);
    const selectedCard = useStore((state) => state.selectedCard);
    const setHoverCard = useStore((state) => state.setHoverCard);
    const tiltCard = useGame((state) => state.tiltCard);
    const locationCards = useGame((state) => state[location as keyof typeof state] as CardTypeGame[]);
    const addCardToDeck = useStore((state) => state.addCardToDeck);
    const opponentReady = useGame((state) => state.opponentReady);
    const hoverCard = useStore((state) => state.hoverCard)
    const cardIdWithEffect = useGame((state) => state.cardIdWithEffect);
    const getIsCardEffect = useGame((state) => state.getIsCardEffect);
    const cardIdWithTarget = useGame((state) => state.cardIdWithTarget);
    const getIsCardTarget = useGame((state) => state.getIsCardTarget);
    const setInheritCardInfo = useGame((state) => state.setInheritCardInfo);
    const getLocationCardsById = useGame((state) => state.getLocationCardsById);
    const setCardToSend = useGame((state) => state.setCardToSend);

    const [canDropToStackBottom, setCanDropToStackBottom] = useState(false);
    const [cardImageUrl, setCardImageUrl] = useState(card.imgUrl);

    const [renderEffectAnimation, setRenderEffectAnimation] = useState(false);
    const [renderTargetAnimation, setRenderTargetAnimation] = useState(false);

    const [{isDragging}, drag] = useDrag(() => ({
        type: "card",
        item: {id: card.id, location: location, cardNumber: card.cardNumber, cardType: card.cardType, name: card.name},
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

    const dragStackEffect = draggedCards ? draggedCards.includes(card as CardTypeGame) : false;
    const utilIcon: boolean = ((hoverCard === card) || !!('ontouchstart' in window || navigator.maxTouchPoints));

    useEffect(() => {
        if (setDraggedCards) {
            if (isDraggingStack && dragStackItem.index) {
                setDraggedCards(locationCards.slice(0, dragStackItem.index + 1));
            }
            if (!isDraggingStack) setDraggedCards([]);
        }
    }, [isDraggingStack, dragStackItem, locationCards, setDraggedCards]);

    useEffect(() => {
        if (!canDropToStackBottom && canDrop) {
            const timer = setTimeout(() => {
                setCanDropToStackBottom(true);
            }, 20); // could not make it work without timeout
            return () => clearTimeout(timer);
        }
        if (canDropToStackBottom && !canDrop) setCanDropToStackBottom(false)
    }, [canDrop, canDropToStackBottom, setCanDropToStackBottom]);

    useEffect(() => setRenderEffectAnimation(getIsCardEffect(card.id)), [cardIdWithEffect])
    useEffect(() => setRenderTargetAnimation(getIsCardTarget(card.id)), [cardIdWithTarget])

    function handleTiltCard() {
        if (["myReveal", "opponentReveal", "myBreedingArea", "deck", "fetchedData"].includes(location)) return;
        if (card !== locationCards[locationCards.length - 1] && card.cardType !== "Tamer") return;
        sendSfx && tiltCard(card.id, location, playSuspendSfx, playUnsuspendSfx);
        sendTiltCard?.(card.id, location);
    }

    const inheritedEffects = topCardInfo(locationCards ?? []).split("\n");
    const inheritAllowed = (index === locationCards?.length - 1) && (locationsWithInheritedInfo.includes(location)) && inheritedEffects[0].length;

    function handleClick(event: React.MouseEvent) {
        event.stopPropagation();
        if (location === "fetchedData") {
            addCardToDeck(card.cardNumber, card.cardType, card.uniqueCardNumber);
            playPlaceCardSfx();

            if (('ontouchstart' in window || navigator.maxTouchPoints) && window.innerWidth < 1000
                && card.id === selectedCard?.id) handleTiltCard(); // 'double click' on mobile
        } else {
            selectCard(card);
            if (inheritAllowed) setInheritCardInfo(inheritedEffects);
        }
    }

    function handleHover() {
        setHoverCard(card);
        if (inheritAllowed && !["deck", "fetchedData"].includes(location)) setInheritCardInfo(inheritedEffects);
        else setInheritCardInfo([]);
    }

    function handleStopHover() {
        setHoverCard(null);

        const locationKey = getLocationCardsById(selectedCard?.id ?? "", true) as string;
        if(!selectedCard || !locationKey) {
            setInheritCardInfo([]);
            return;
        }
        const locationState = getLocationCardsById(selectedCard.id) as CardTypeGame[] | null ?? [];
        const inhEff = topCardInfo(locationState).split("\n");
        const inhAll = (selectedCard.id === locationState.at(-1)?.id) && (locationsWithInheritedInfo.includes(locationKey));
        if (!inhEff[0].length) setInheritCardInfo([])
        else if (inhAll) setInheritCardInfo(inhEff);
    }

    const isHovering = hoverCard === card;
    const isModifiersAllowed = [...myBALocations, ...opponentBALocations].includes(location);
    const modifiers = isModifiersAllowed ? (card as CardTypeGame)?.modifiers : undefined;

    const finalDp = (modifiers && card.dp) ? (card.dp + modifiers.plusDp) < 0 ? 0 : (card.dp + modifiers.plusDp) : 0;
    const showDp = (card.cardType === "Digimon") && (finalDp !== card.dp) && isModifiersAllowed;
    const secAtkString = modifiers ? getNumericModifier(modifiers.plusSecurityAttacks) : "";

    return (
        <div style={{position: "relative"}}>
            {showDp && <PlusDpSpan isHovering={isHovering} isNegative={finalDp < card.dp!}
                                     isTilted={((card as CardTypeGame)?.isTilted)}>{finalDp.toString()}</PlusDpSpan>}
            {secAtkString && <PlusSecAtkSpan isHovering={isHovering} isNegative={secAtkString.startsWith("-")}
                                             isTilted={((card as CardTypeGame)?.isTilted)}>
                {secAtkString}<StyledShieldIcon/></PlusSecAtkSpan>}
            {!isDraggingStack && !!(index) && (index > 0) && utilIcon &&
                <DragIcon
                    ref={dragStack}
                    onMouseEnter={() => setHoverCard(hoverCard)}
                    onMouseLeave={() => setHoverCard(null)}
                    src={stackIcon} alt={"stack"}
                />}
            {renderEffectAnimation &&
                <CardAnimationContainer style={{
                    overflow: "hidden",
                    transform: ((card as CardTypeGame)?.isTilted) ? "rotate(30deg)" : "unset"
                }}>
                    <Lottie animationData={activateEffectAnimation} loop={true}/>
                </CardAnimationContainer>}
            {renderTargetAnimation &&
                <CardAnimationContainer>
                    <Lottie animationData={targetAnimation} loop={true}/>
                </CardAnimationContainer>}
            <StyledImage
                ref={!opponentFieldLocations.includes(location) && opponentReady ? drag : undefined}
                onClick={handleClick}
                onDoubleClick={handleTiltCard}
                onMouseEnter={handleHover}
                onMouseOver={handleHover}
                onMouseLeave={handleStopHover}
                alt={card.name + " " + card.uniqueCardNumber}
                src={cardImageUrl}
                isDragging={isDragging || dragStackEffect}
                location={location}
                isTilted={((card as CardTypeGame)?.isTilted) ?? false}
                activeEffect={renderEffectAnimation}
                targeted={renderTargetAnimation}
                onError={() => {
                    setImageError?.(true);
                    setCardImageUrl(cardBackUrl);
                }}
                onContextMenu={() => myBALocations.includes(location) && setCardToSend(card.id, location)}
            />
            {handleDropToStackBottom && (index === 0) && canDropToStackBottom &&
                <DTSBZone isOver={isOver} ref={dropToBottom}/>}
        </div>)
}

type StyledImageProps = {
    isDragging: boolean,
    location: string,
    isTilted: boolean,
    activeEffect: boolean,
    targeted?: boolean,
}

const StyledImage = styled.img<StyledImageProps>`
  width: ${({location}) => ((location === "deck" || location === "fetchedData") ? "63px" : "95px")};
  max-width: ${({location}) => (location === "deck" ? "130px" : "unset")};
  border-radius: 5px;
  transition: all 0.15s ease-out;
  cursor: ${({location}) => (location === "deck" ? "help" : (location === "fetchedData" ? "cell" : "grab"))};
  opacity: ${({isDragging}) => (isDragging ? 0.6 : 1)};
  filter: ${({isDragging}) => (isDragging ? "drop-shadow(0 0 3px #ff2190) saturate(10%) brightness(120%)" : "drop-shadow(0 0 1.5px #004567)")};
  transform: ${({isTilted}) => (isTilted ? "rotate(30deg)" : "rotate(0deg)")};
  animation: ${({
                  isTilted,
                  activeEffect,
                  targeted
                }) => (targeted ? "target-pulsate 0.95s ease-in-out infinite" : activeEffect ? "effect 0.85s ease-in-out infinite" : isTilted ? "pulsate 5s ease-in-out infinite" : "")};

  &:hover {
    filter: drop-shadow(0 0 1.5px ghostwhite) ${({isTilted}) => (isTilted ? "brightness(0.5)" : "")};
    transform: scale(1.1) ${({isTilted}) => (isTilted ? "rotate(30deg)" : "rotate(0deg)")};
  }

  @keyframes effect {
    0%, 40%, 100% {
      filter: drop-shadow(0 0 0px #004567) brightness(0.9) saturate(1.3);
    }
    70% {
      filter: drop-shadow(0 0 4px #0fe3b1) brightness(0.9) saturate(1.3);
    }
  }

  @keyframes pulsate {
    0%, 40%, 100% {
      filter: drop-shadow(0 0 0px #004567) brightness(0.65) saturate(0.8);
    }
    70% {
      filter: drop-shadow(0 0 4px #ff2190) brightness(0.65) saturate(1.5);
    }
  }

  @keyframes target-pulsate {
    0%, 30%, 100% {
      filter: drop-shadow(0 0 0px rgba(171, 138, 31, 0.25)) brightness(0.7) saturate(0.8);
    }
    70% {
      filter: drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1);
    }
  }

  @media (min-width: 500px) {
    min-width: 85px;
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
  @media (max-width: 390px) {
    width: 61px;
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

const DTSBZone = styled.div<{ isOver: boolean }>`
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

export const CardAnimationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  z-index: 10;
  pointer-events: none;
`;

const PlusDpSpan = styled.span<{isHovering: boolean, isNegative: boolean, isTilted: boolean}>`
  position: absolute;
  z-index: 10;
  top: ${({isHovering}) => (isHovering ? "-8px" : "-1px")};
  right: ${({isHovering}) => (isHovering ? "-6px" : 0)};
  font-size: ${({isHovering}) => (isHovering ? "1.1em" : "1em")};
  border: 1px solid #8b91fd;
  box-shadow: 0 0 2px black;
  pointer-events: none;
  user-select: none;
  font-family: Awsumsans, sans-serif;
  font-weight: 500;
  color: ${({isNegative}) => (isNegative ? "#ff2190" : "#49fcbd")};
  line-height: 0.9;
  padding: ${({isHovering}) => (isHovering ? "4px 2px 1px 2px" : "3px 2px 1px 2px")};;
  border-radius: 3px;
  background: rgba(21, 21, 21, 0.9);
  transition: all 0.05s;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({isTilted}) => (isTilted ? "translate(25px, 20px) rotate(30deg)" : "unset")};
  
  @media (min-width: 2000px) {
    line-height: 0.8;
  }
`;

const PlusSecAtkSpan = styled(PlusDpSpan)`
  left: ${({isHovering}) => (isHovering ? "-5px" : "0px")};
  right: unset;
  border: unset;
  background: unset;
  box-shadow: unset;
  font-size: 1em;
  transform: ${({isTilted}) => (isTilted ? "translate(34px, -10px) rotate(30deg)" : "unset")};
`;

const StyledShieldIcon = styled(ShieldIcon)`
  position: absolute;
  z-index: -1;
  color: rgba(21, 21, 21, 0.85);
  font-size: 30px;
  transform: translateX(1px);
  filter: drop-shadow(0 0 2px #5e65ee) drop-shadow(0 0 1px #5158e3);
`;
