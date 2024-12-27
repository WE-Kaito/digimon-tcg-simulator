import {CardTypeGame, DragMode} from "../utils/types.ts";
import styled from '@emotion/styled';
import {useGeneralStates} from "../hooks/useGeneralStates.ts";
import {useGameBoardStates} from "../hooks/useGameBoardStates.ts";
import {arraysEqualUnordered, getCardColor, getNumericModifier, numbersWithModifiers, topCardInfo} from "../utils/functions.ts";
import {CSSProperties, useEffect, useState} from "react";
import Lottie from "lottie-react";
import activateEffectAnimation from "../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../assets/lotties/target-animation.json";
import suspendedAPNG from "../assets/lotties/square-sparkle-apng.png";
import ShieldIcon from '@mui/icons-material/Shield';
import {AceSpan} from "./cardDetails/DetailsHeader.tsx";
import cardBackSrc from "../assets/cardBack.jpg";
import {useSound} from "../hooks/useSound.ts";
import {getSleeve} from "../utils/sleeves.ts";
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {WSUtils} from "../pages/GamePage.tsx";
import {useGameUIStates} from "../hooks/useGameUIStates.ts";
import {useLongPress} from "../hooks/useLongPress.ts";

const digimonLocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8",
    "myDigi9", "myDigi10", "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5",
    "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10"];

const tamerLocations = ["myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15",
    "opponentDigi11", "opponentDigi12", "opponentDigi13", "opponentDigi14", "opponentDigi15"];

const myBALocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8", "myDigi9",
    "myDigi10", "myDigi11", "myDigi12", "myDigi13", "myDigi14", "myDigi15", "myBreedingArea"]

const opponentBALocations = ["opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5", "opponentDigi6",
    "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10", "opponentDigi11", "opponentDigi12", "opponentDigi13",
    "opponentDigi14", "opponentDigi15", "opponentBreedingArea"]

const opponentFieldLocations = [...opponentBALocations, "opponentReveal", "opponentDeckField", "opponentEggDeck", "opponentTrash", "opponentSecurity"];

const locationsWithInheritedInfo = ["myBreedingArea", "opponentBreedingArea",
    "myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8", "myDigi9", "myDigi10",
    "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5",
    "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10"];

const locationsWithAdditionalInfo = [ ...locationsWithInheritedInfo, ...tamerLocations];

type CardProps = {
    card: CardTypeGame,
    location: string,
    wsUtils?: WSUtils,
    index?: number,
    setImageError?: (imageError: boolean) => void,
    style?: CSSProperties
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}

export default function Card( props : CardProps ) {
    "use no memo"; // opts out this component from being compiled by React Compiler
    const {card, location, index, setImageError, style, onContextMenu, wsUtils} = props;

    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const selectCard = useGeneralStates((state) => state.selectCard);
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const setHoverCard = useGeneralStates((state) => state.setHoverCard);
    const tiltCard = useGameBoardStates((state) => state.tiltCard);
    const locationCards = useGameBoardStates((state) => state[location as keyof typeof state] as CardTypeGame[]);
    const opponentReady = useGameBoardStates((state) => state.opponentReady);
    const hoverCard = useGeneralStates((state) => state.hoverCard)
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const getIsCardEffect = useGameBoardStates((state) => state.getIsCardEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);
    const getIsCardTarget = useGameBoardStates((state) => state.getIsCardTarget);
    const setInheritCardInfo = useGameBoardStates((state) => state.setInheritCardInfo);
    const setCardToSend = useGameBoardStates((state) => state.setCardToSend);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const isHandHidden = useGameBoardStates((state) => state.isHandHidden);
    const mySleeve = useGameBoardStates((state) => state.mySleeve);
    const [stackSliceIndex, setStackSliceIndex] = useGameBoardStates((state) => [state.stackSliceIndex, state.setStackSliceIndex]);
    const dragMode = useGameUIStates((state) => state.dragMode);
    const stackModal = useGameUIStates((state) => state.stackModal);

    const playSuspendSfx = useSound((state) => state.playSuspendSfx);
    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const [cardImageUrl, setCardImageUrl] = useState(card.imgUrl);

    const [renderEffectAnimation, setRenderEffectAnimation] = useState(false);
    const [renderTargetAnimation, setRenderTargetAnimation] = useState(false);

    const inTamerField = tamerLocations.includes(location);

    const {
        attributes,
        listeners,
        setNodeRef: drag,
        isDragging,
        transform,
        over,
        active,
    } = useDraggable({
        id: card.id + "_" + location,
        data: { type: 'card', content: {id: card.id, location, cardNumber: card.cardNumber, cardType: card.cardType, name: card.name, imgSrc: card.imgUrl} },
        disabled: opponentFieldLocations.includes(location) || !opponentReady,
    });

    const {
        attributes: stackAttributes,
        listeners: stackListeners,
        setNodeRef: dragStack,
        isDragging: isDraggingStack,
        transform: stackTransform,
    } = useDraggable({
        id: location + "_stack" + dragMode,
        data: { type: 'card-stack', content: { location } },
    });

    useEffect(() => setRenderEffectAnimation(getIsCardEffect(card.id)), [cardIdWithEffect])
    useEffect(() => setRenderTargetAnimation(getIsCardTarget(card.id)), [cardIdWithTarget])

    function handleTiltCard() {
        if (!location.includes("myDigi")) return;
        if (card !== locationCards[inTamerField ? 0 : locationCards.length - 1] && card.cardType !== "Tamer") return;
        tiltCard(card.id, location, playSuspendSfx, playUnsuspendSfx);
        wsUtils?.sendMessage(`${wsUtils.matchInfo.gameId}:/tiltCard:${wsUtils.matchInfo.opponentName}:${card.id}:${location}`);
    }

    const inheritedEffects = topCardInfo(locationCards ?? []).split("\n");
    const inheritAllowed = (index === locationCards?.length - 1) && (locationsWithInheritedInfo.includes(location)) && inheritedEffects[0].length;

    function handleClick(event: React.MouseEvent) {
        event.stopPropagation();
        selectCard(card);
        if (inheritAllowed) setInheritCardInfo(inheritedEffects);
    }

    function handleHover() {
        if (index !== undefined && !active && (dragMode === DragMode.STACK)) setStackSliceIndex(index);
        if (isHandHidden && location === "myHand") return;
        setHoverCard(card);
        if (inheritAllowed) setInheritCardInfo(inheritedEffects);
        else setInheritCardInfo([]);
    }

    const selectedCardLocation = getCardLocationById(selectedCard?.id ?? "");
    const locationCardsOfSelected = useGameBoardStates((state) => state[selectedCardLocation as keyof typeof state] as CardTypeGame[]);
    function handleStopHover() {
        if(isDragging) return;
        setHoverCard(null);
        if(!selectedCard || !selectedCardLocation) {
            setInheritCardInfo([]);
            return;
        }
        const inhEff = topCardInfo(locationCardsOfSelected).split("\n");
        const inhAll = (selectedCard.id === locationCardsOfSelected.at(-1)?.id) && (locationsWithInheritedInfo.includes(selectedCardLocation));
        if (!inhEff[0].length) setInheritCardInfo([])
        else if (inhAll) setInheritCardInfo(inhEff);
    }

    const isModifiersAllowed = [...myBALocations, ...opponentBALocations].includes(location) && ((card.cardType === "Digimon") || numbersWithModifiers.includes(card.cardNumber));
    const modifiers = isModifiersAllowed ? card.modifiers : undefined;

    let finalDp = (modifiers && card.dp) ? (card.dp + modifiers.plusDp) < 0 ? 0 : (card.dp + modifiers.plusDp) : 0;
    if (numbersWithModifiers.includes(card.cardNumber) && card.cardNumber !== "EX2-007") finalDp = modifiers?.plusDp ?? 0;
    const secAtkString = modifiers ? getNumericModifier(modifiers.plusSecurityAttacks) : "";
    const aceIndex = card.aceEffect?.indexOf("-") ?? -1;
    const aceOverflow = card.aceEffect ? card.aceEffect[aceIndex + 1] : null;
    const showColors = modifiers?.colors && !arraysEqualUnordered(modifiers?.colors, card.color);

    const isHovered = hoverCard === card;
    const isPartOfDraggedStack = isDraggingStack && (index !== undefined) && (inTamerField ? (index >= stackSliceIndex) : (index <= stackSliceIndex));

    const overId = String(over?.id);
    const opacity = over ? overId.includes("mySecurity") ? 0 : (overId.includes("bottom") || overId === "opponentSecurity") ? 0.35 : 1 : 1;
    const transformWithoutRotation = style?.transform?.split(" ").slice(0, 2).join(" ") ?? "unset";

    const isSingleDrag = dragMode === DragMode.SINGLE
        || ["myHand", "mySecurity", "myTrash"].includes(location)
        || (stackSliceIndex === 0 && !tamerLocations.includes(location))
        || (stackSliceIndex === locationCards.length - 1 && tamerLocations.includes(location))
        || (stackModal === location);

    const dragRef = isSingleDrag ? drag : dragStack;
    const dragAttributes = isSingleDrag ? attributes : stackAttributes;
    const dragListeners = isSingleDrag ? listeners : stackListeners;

    const showCardModifiers = locationsWithAdditionalInfo.includes(location) && cardWidth > 60 && !isDragging && !isDraggingStack;
    const renderModifiersOnTop = (digimonLocations.includes(location) && index === (locationCards.length - 1)) || (tamerLocations.includes(location) && index === 0);

    function onLongPress(e: React.TouchEvent<HTMLImageElement>) {
        if (myBALocations.includes(location)) setCardToSend(card.id, location);
        onContextMenu?.(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
    }

    const { handleTouchStart, handleTouchEnd } = useLongPress({onLongPress});

    return (
        <Wrapper id={index === locationCards.length - 1 ? location : ""}
                 style={{...style, ...(isDragging && { transform: transformWithoutRotation, zIndex: 9999 })}}
                 ref={dragRef} {...dragAttributes} {...dragListeners}
        >
            {showCardModifiers && <>
                {renderModifiersOnTop && <>
                    {isModifiersAllowed && <PlusDpSpan isHovering={isHovered} isNegative={finalDp < card.dp!}
                                                       {...(finalDp === card.dp && {style: {color: "ghostwhite"}})}>
                        {finalDp.toString()}
                    </PlusDpSpan>}
                    {secAtkString && <PlusSecAtkSpan isHovering={isHovered} isNegative={secAtkString.startsWith("-")}>
                        {secAtkString}<StyledShieldIcon/>
                    </PlusSecAtkSpan>}

                    {hoverCard !== card && <>
                        {showColors && <ColorStack>
                            {modifiers?.colors.map((c) => <span key={`${c}_${card.id}_view`}>{getCardColor(c)[1]}</span>)}
                        </ColorStack>}
                        <KeywordWrapper>
                            {modifiers?.keywords.map((keyword) =>
                                <ModifierSpan keyword={keyword} key={`${keyword}_${card.id}`}>
                                    <span>{keyword}</span></ModifierSpan>)}
                        </KeywordWrapper>
                        {card.level && <LevelSpan isMega={card.level >= 6}><span>Lv.</span>{card.level}</LevelSpan>}
                        {card.aceEffect && <StyledAceSpan isMega={card.level! >= 6}>ACE-{aceOverflow}</StyledAceSpan>}
                    </>}
                </>}

                {renderEffectAnimation &&
                    <CardAnimationContainer style={{overflow: "hidden"}}>
                        <Lottie animationData={activateEffectAnimation} loop={true}/>
                    </CardAnimationContainer>}
                {renderTargetAnimation &&
                    <CardAnimationContainer>
                        <Lottie animationData={targetAnimation} loop={true}/>
                    </CardAnimationContainer>}
            </>}
            {card.isTilted &&
                <CardAnimationContainer style={{overflow: "clip", top: 5, left: 5, right: 5, bottom: "25%", opacity,
                transform: CSS.Translate.toString(isPartOfDraggedStack ? stackTransform : transform)}}>
                    <img alt={"suspended"} src={suspendedAPNG}/>
                </CardAnimationContainer>}

            {(isDragging || isPartOfDraggedStack) && !isHandHidden &&
                <DragImage alt={card.name + " " + card.uniqueCardNumber} src={cardImageUrl} isTilted={card.isTilted}
                           transform={CSS.Translate.toString(isDraggingStack ? stackTransform : transform)}
                           width={cardWidth}
                           style={{ opacity }}
                           inModal={["myTrash", "mySecurity"].includes(location) || stackModal === location}
                />}

            {((!isDragging && !isPartOfDraggedStack) || isHandHidden) && <StyledImage
                style={{ ...(isDragging && isHandHidden && {transform: CSS.Translate.toString(transform), cursor: "grabbing"})}}
                className={"prevent-default-long-press"}
                onClick={handleClick}
                onDoubleClick={handleTiltCard}
                onMouseEnter={handleHover}
                onMouseOver={handleHover}
                onMouseLeave={handleStopHover}
                alt={card.name + " " + card.uniqueCardNumber}
                src={isHandHidden && location === "myHand" ? getSleeve(mySleeve) : cardImageUrl}
                location={location}
                isTilted={card.isTilted}
                activeEffect={renderEffectAnimation}
                targeted={renderTargetAnimation}
                isTopCard={index === locationCards?.length - 1 || stackModal === location}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                onError={() => {
                    setImageError?.(true);
                    setCardImageUrl(cardBackSrc);
                }}
                onContextMenu={(e) => {
                    if (myBALocations.includes(location)) setCardToSend(card.id, location);
                    onContextMenu?.(e);
                }}
                width={style ? style.width : 95}
            />}
        </Wrapper>)
}

type StyledImageProps = {
    location: string;
    isTilted: boolean;
    activeEffect: boolean;
    targeted?: boolean;
    isTopCard?: boolean;
}

const StyledImage = styled.img<StyledImageProps>`
  border-radius: 5px;
  transition: all 0.15s ease-out, filter 0.5s ease-in-out;
  cursor: ${({ location }) => opponentFieldLocations?.includes(location) ? "pointer" : "grab"};
  touch-action: none;
  
  animation: ${({ isTilted, activeEffect, targeted, isTopCard }) =>
    targeted
        ? `target-pulsate${isTopCard ? "-first" : ""} 0.95s ease-in-out infinite`
        : activeEffect
            ? `effect${isTopCard ? "-first" : ""} 0.85s ease-in-out infinite`
            : isTilted
                ? "pulsate 5s ease-in-out infinite"
                : "none"};

  outline: ${({ isTilted }) => (isTilted ? "2px solid #191970" : "none")};
  outline-offset: -1px;
  border-bottom: ${({ location }) => ((location.includes("Digi") && (Number(location.split("Digi")[1]) <= 10) || location.includes("Breeding")) ? "1px solid rgba(0,0,0, 0.75)" : "none")};
  border-right: ${({ location }) => (location.includes("Digi") && Number(location.split("Digi")[1]) > 10 ? "1px solid rgba(0,0,0, 0.75)" : "none")};
  filter: ${({ isTilted }) => (isTilted ? "brightness(0.7) saturate(0.7)" : "none")};

  &:hover {
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5))
      ${({ isTilted }) => (isTilted ? "brightness(0.7) saturate(0.7)" : "none")};
    transform: scale(1.1);
  }
  
  @keyframes effect {
    0%, 40%, 100% {
      filter: drop-shadow(0 0 0px #004567) brightness(0.9) saturate(1.3);
      transform: unset;
    }
    70% {
      filter: drop-shadow(0 0 4px #0fe3b1) brightness(0.9) saturate(1.3);
      transform: translateY(5px);
    }
  }

  @keyframes effect-first {
    0%, 40%, 100% {
      filter: drop-shadow(0 0 0px #004567) brightness(0.9) saturate(1.3);
    }
    70% {
      filter: drop-shadow(0 0 4px #0fe3b1) brightness(0.9) saturate(1.3);
    }
  }

  @keyframes target-pulsate {
    0%, 30%, 100% {
      filter: drop-shadow(0 0 0px rgba(171, 138, 31, 0.25)) brightness(0.7) saturate(0.8);
      transform: unset;
    }
    70% {
      filter: drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1);
      transform: translateY(5px);
    }
  }

  @keyframes target-pulsate-first {
    0%, 30%, 100% {
      filter: drop-shadow(0 0 0px rgba(171, 138, 31, 0.25)) brightness(0.7) saturate(0.8);
    }
    70% {
      filter: drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1);
    }
  }
`;

const DragImage = styled.img<{ transform?: string, isTilted?: boolean, hasOffset?: boolean, inModal: boolean}>`
  touch-action: none;
  cursor: grabbing;
  position: fixed;
  outline: ${({isTilted}) => (isTilted ? "2px solid #191970" : "none")};
  outline-offset: -1px;
  border-radius: 5px;
  transform: ${({transform}) => transform} ${({inModal}) => inModal ? "translateX(-50%)" : "translate(-50%, -100%)"} scale(1.1);
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.5)) brightness(110%) saturate(1.05);
  transition: ${({hasOffset}) => (hasOffset ? "transform 0.35s ease" : "unset")};
  z-index: 10000;
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

const PlusDpSpan = styled.span<{isHovering?: boolean, isNegative?: boolean}>`
  position: absolute;
  z-index: 11;
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
  padding: ${({isHovering}) => (isHovering ? "4px 2px 1px 2px" : "3px 2px 1px 2px")};
  border-radius: 3px;
  background: rgba(21, 21, 21, 0.9);
  transition: all 0.05s;
  display: flex;
  align-items: center;
  justify-content: center;
  
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
`;

const LevelSpan = styled(PlusSecAtkSpan)<{isMega: boolean}>`
  top: unset;
  left: 4px;
  bottom: ${({isMega}) => (isMega? "10px" : "24px")};
  background: unset;
  color: ghostwhite;
  filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black);
  span {
    font-size:  ${({isHovering}) => (isHovering ? "0.6em" : "0.5em")};
    transform: translateY(3px);
  }
`;

const StyledShieldIcon = styled(ShieldIcon)`
  position: absolute;
  z-index: -1;
  color: rgba(21, 21, 21, 0.85);
  font-size: 30px;
  transform: translateX(1px);
  filter: drop-shadow(0 0 2px #5e65ee) drop-shadow(0 0 1px #2b4fff);
`;

const StyledAceSpan = styled(AceSpan)<{isMega: boolean}>`
  font-size: 13px;
  position: absolute;
  background-image: linear-gradient(320deg, #dedede, #8f8f8f);
  bottom: ${({isMega}) => (isMega? "10px" : "25px")};
  right: 5px;
  z-index: 1;
  filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black);
  pointer-events: none;
  transform: unset;
`;

const Wrapper = styled.div`
  touch-action: none;
  position: relative;
  -moz-user-select: none;
  user-select: none;
  transition: transform 0.35s;
`;

const ModifierSpan = styled.div<{keyword: string}>`
  font-family: "League Spartan", sans-serif;
  color: ghostwhite;
  background: ${({keyword}) => (keyword === "SICK" ? "rgba(1,78,114,0.9)" : "rgba(110, 48, 5, 0.9)")};
  border-radius: 25px;
  height: 18px;
  text-align: center;
  transition: background 0.3s;
  padding: ${({keyword}) => (keyword.length >= 8 ? "2px" : "1px")} 5px ${({keyword}) => (keyword.length >= 8 ? "1px" : "2px")} 5px;
  font-size: ${({keyword}) => (keyword.length >= 8 ? "0.8em" : "1em")};

  span {
    filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
  }
`;

const KeywordWrapper = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 22px;
    right: -15px;
    z-index: 1;
    gap: 3px;
    max-height: 70px;
    flex-wrap: wrap-reverse;
    pointer-events: none;
`;

const ColorStack = styled.div`
  font-size: 12px;
  display: flex;
  gap: 2px;
  flex-direction: row;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
`;
