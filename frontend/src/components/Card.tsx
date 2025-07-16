import { CardTypeGame } from "../utils/types.ts";
import styled from "@emotion/styled";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import {
    arraysEqualUnordered,
    getNumericModifier,
    numbersWithModifiers,
    topCardInfo,
    topCardInfoLink,
} from "../utils/functions.ts";
import { CSSProperties, useEffect, useState } from "react";
import Lottie from "lottie-react";
import activateEffectAnimation from "../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../assets/lotties/target-animation.json";
import suspendedAPNG from "../assets/lotties/square-sparkle-apng.png";
import { ContentCopyTwoTone as DragStackIcon, Shield as ShieldIcon } from "@mui/icons-material";
import cardBackSrc from "../assets/cardBack.jpg";
import { useSound } from "../hooks/useSound.ts";
import { getSleeve } from "../utils/sleeves.ts";
import { DragPreviewImage, useDrag } from "react-dnd";
import { WSUtils } from "../pages/GamePage.tsx";
import { OpenedCardModal, useGameUIStates } from "../hooks/useGameUIStates.ts";
import { useLongPress } from "../hooks/useLongPress.ts";
import { useSettingStates } from "../hooks/useSettingStates.ts";

const myDigimonLocations = ["myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8"];

const digimonLocations = [
    ...myDigimonLocations,
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
];

const myTamerLocations = ["myDigi9", "myDigi10", "myDigi11", "myDigi12", "myDigi13"];

const tamerLocations = [
    ...myTamerLocations,
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentDigi14",
    "opponentDigi15",
];

const myBALocations = [
    ...myDigimonLocations,
    "myDigi9",
    "myDigi10",
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "myBreedingArea",
];

const opponentBALocations = [
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentBreedingArea",
];

const opponentFieldLocations = [
    ...opponentBALocations,
    "opponentLink1",
    "opponentLink2",
    "opponentLink3",
    "opponentLink4",
    "opponentLink5",
    "opponentLink6",
    "opponentLink7",
    "opponentLink8",
    "opponentReveal",
    "opponentDeckField",
    "opponentEggDeck",
    "opponentTrash",
    "opponentSecurity",
    "opponentHand",
];

const locationsWithInheritedInfo = [
    "myBreedingArea",
    "opponentBreedingArea",
    "myDigi1",
    "myDigi2",
    "myDigi3",
    "myDigi4",
    "myDigi5",
    "myDigi6",
    "myDigi7",
    "myDigi8",
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
];

const locationsWithAdditionalInfo = [...locationsWithInheritedInfo, ...tamerLocations];

type CardProps = {
    card: CardTypeGame;
    location: string;
    wsUtils?: WSUtils;
    index?: number;
    setImageError?: (imageError: boolean) => void;
    style?: CSSProperties;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export default function Card(props: CardProps) {
    const { card, location, index, setImageError, style, onContextMenu, wsUtils } = props;

    const cardWidth = useGeneralStates((state) => state.cardWidth);
    const selectCard = useGeneralStates((state) => state.selectCard);
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const setHoverCard = useGeneralStates((state) => state.setHoverCard);
    const tiltCard = useGameBoardStates((state) => state.tiltCard);
    const locationCards = useGameBoardStates((state) => state[location as keyof typeof state] as CardTypeGame[]);
    const opponentReady = useGameBoardStates((state) => state.opponentReady);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const getIsCardEffect = useGameBoardStates((state) => state.getIsCardEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);
    const getIsCardTarget = useGameBoardStates((state) => state.getIsCardTarget);
    const setInheritCardInfo = useGameBoardStates((state) => state.setInheritCardInfo);
    const setLinkCardInfo = useGameBoardStates((state) => state.setLinkCardInfo);
    const getLinkCardsForLocation = useGameBoardStates((state) => state.getLinkCardsForLocation);
    const setCardToSend = useGameBoardStates((state) => state.setCardToSend);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const isHandHidden = useGameBoardStates((state) => state.isHandHidden);
    const mySleeve = useGameBoardStates((state) => state.mySleeve);
    const opponentSleeve = useGameBoardStates((state) => state.opponentSleeve);
    const stackSliceIndex = useGameBoardStates((state) => state.stackSliceIndex);
    const setStackSliceIndex = useGameBoardStates((state) => state.setStackSliceIndex);

    const useToggleForStacks = useSettingStates((state) => state.useToggleForStacks);
    const isStackDragMode = useGameUIStates((state) => state.isStackDragMode);
    const stackModal = useGameUIStates((state) => state.stackModal);
    const stackDragIcon = useGameUIStates((state) => state.stackDragIcon);
    const setStackDragIcon = useGameUIStates((state) => state.setStackDragIcon);
    const stackDraggedLocation = useGameUIStates((state) => state.stackDraggedLocation);
    const setStackDraggedLocation = useGameUIStates((state) => state.setStackDraggedLocation);

    const playSuspendSfx = useSound((state) => state.playSuspendSfx);
    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const [cardImageUrl, setCardImageUrl] = useState(card.imgUrl);

    const [renderEffectAnimation, setRenderEffectAnimation] = useState(false);
    const [renderTargetAnimation, setRenderTargetAnimation] = useState(false);

    const inTamerField = tamerLocations.includes(location);

    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const isCardFaceDown =
        !(openedCardModal === OpenedCardModal.MY_SECURITY && location === "mySecurity") &&
        ((isHandHidden && location === "myHand") || (!card.isFaceUp && location !== "myHand"));

    // Determine drag mode logic
    const isSingleDrag =
        !isStackDragMode ||
        ["myHand", "mySecurity", "myTrash"].includes(location) ||
        (stackSliceIndex === 0 && !tamerLocations.includes(location)) ||
        (stackSliceIndex === locationCards.length - 1 && tamerLocations.includes(location));

    // React-DND drag logic
    const [{ isDragging }, dragRef, preview] = useDrag(
        () => ({
            type: isSingleDrag ? "card" : "card-stack",
            item: isSingleDrag
                ? {
                      type: "card",
                      content: {
                          id: card.id,
                          location,
                          cardnumber: card.cardNumber,
                          type: card.cardType,
                          name: card.name,
                          imgSrc: card.imgUrl,
                          isFaceUp: card.isFaceUp,
                      },
                  }
                : {
                      type: "card-stack",
                      content: {
                          location,
                          cards: inTamerField
                              ? locationCards.slice(index ?? 0) // For tamers, drag from current index to end
                              : locationCards.slice(0, (index ?? 0) + 1), // For digimon, drag from start to current index
                      },
                  },
            canDrag: !opponentFieldLocations.includes(location) && opponentReady,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [
            isSingleDrag,
            card.id,
            location,
            card.cardNumber,
            card.cardType,
            card.name,
            card.imgUrl,
            card.isFaceUp,
            locationCards,
            opponentFieldLocations,
            opponentReady,
        ]
    );

    // Separate drag logic for stack icon - always drags as card-stack
    const [{ isDragging: isStackDragging }, stackDragRef, previewStackIcon] = useDrag(() => {
        const stackCards = inTamerField
            ? locationCards.slice(index ?? 0) // For tamers, drag from current index to end
            : locationCards.slice(0, (index ?? 0) + 1); // For digimon, drag from start to current index

        return {
            type: "card-stack",
            item: {
                type: "card-stack",
                content: {
                    location,
                    cards: stackCards,
                },
            },
            canDrag: !opponentFieldLocations.includes(location) && opponentReady && stackDraggedLocation === null,
            end: () => {
                setStackSliceIndex(0);
                setStackDragIcon(null);
                setStackDraggedLocation(null);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        };
    }, [location, locationCards, index, inTamerField, opponentFieldLocations, opponentReady]);

    useEffect(() => setStackDraggedLocation(isStackDragging ? location : null), [isStackDragging]);

    useEffect(() => setRenderEffectAnimation(getIsCardEffect(card.id)), [cardIdWithEffect]);
    useEffect(() => setRenderTargetAnimation(getIsCardTarget(card.id)), [cardIdWithTarget]);

    function handleTiltCard() {
        if (!location.includes("myDigi") && location !== "myBreedingArea") return;
        if (card !== locationCards[inTamerField ? 0 : locationCards.length - 1] && card.cardType !== "Tamer") return;
        tiltCard(card.id, location, playSuspendSfx, playUnsuspendSfx);
        wsUtils?.sendMessage(
            `${wsUtils.matchInfo.gameId}:/tiltCard:${wsUtils.matchInfo.opponentName}:${card.id}:${location}`
        );
    }
    const [hoveredId, setHoveredId] = useState<string>("");

    const inheritedEffects = topCardInfo(locationCards ?? []).split("\n");
    const inheritAllowed = index === locationCards?.length - 1 && locationsWithInheritedInfo.includes(location);

    const linkCardsForLocation = getLinkCardsForLocation(location);
    const linkCardInfo = topCardInfoLink(linkCardsForLocation);

    function handleClick(event: React.MouseEvent) {
        if ((isCardFaceDown && location === "mySecurity") || (isCardFaceDown && !location.includes("my"))) return;
        event.stopPropagation();
        selectCard(card);
        if (inheritAllowed) {
            setInheritCardInfo(inheritedEffects);
            setLinkCardInfo(linkCardInfo);
        }
    }

    function handleHover() {
        if (index !== undefined && isStackDragMode) setStackSliceIndex(index);
        if (isCardFaceDown) setHoveredId(card.id);
        if ((isCardFaceDown && location === "mySecurity") || (isCardFaceDown && !location.includes("my"))) return;
        setHoverCard(card);
        if (inheritAllowed) {
            setInheritCardInfo(inheritedEffects);
            setLinkCardInfo(linkCardInfo);
        } else {
            setInheritCardInfo([]);
            setLinkCardInfo([]);
        }
    }

    const selectedCardLocation = getCardLocationById(selectedCard?.id ?? "");
    const locationCardsOfSelected = useGameBoardStates(
        (state) => state[selectedCardLocation as keyof typeof state] as CardTypeGame[]
    );
    function handleStopHover() {
        if (isDragging) return;
        setHoverCard(null);
        setHoveredId("");
        if (!selectedCard || !selectedCardLocation) {
            setInheritCardInfo([]);
            setLinkCardInfo([]);
            return;
        }
        const inhEff = topCardInfo(locationCardsOfSelected).split("\n");
        const inhAll =
            selectedCard.id === locationCardsOfSelected.at(-1)?.id &&
            locationsWithInheritedInfo.includes(selectedCardLocation);
        if (!inhEff[0].length) setInheritCardInfo([]);
        else if (inhAll) setInheritCardInfo(inhEff);

        const linkInfo = topCardInfoLink(getLinkCardsForLocation(selectedCardLocation));
        const linkAllowed =
            selectedCard.id === locationCardsOfSelected.at(-1)?.id && digimonLocations.includes(selectedCardLocation);

        if (!linkInfo.length) setLinkCardInfo([]);
        else if (linkAllowed) setLinkCardInfo(linkInfo);
    }

    const isModifiersAllowed =
        [...myBALocations, ...opponentBALocations].includes(location) &&
        (card.cardType === "Digimon" || numbersWithModifiers.includes(card.cardNumber));
    const modifiers = isModifiersAllowed ? card.modifiers : undefined;

    const linkDP = linkCardsForLocation.reduce((sum, card) => sum + (card.linkDP ?? 0), 0);

    let finalDp = modifiers && card.dp ? (card.dp + modifiers.plusDp < 0 ? 0 : card.dp + modifiers.plusDp) + linkDP : 0;
    if (numbersWithModifiers.includes(card.cardNumber) && card.cardNumber !== "EX2-007") {
        finalDp = modifiers?.plusDp ?? 0;
    }
    const secAtkString = modifiers ? getNumericModifier(modifiers.plusSecurityAttacks) : "";
    const aceIndex = card.aceEffect?.indexOf("-") ?? -1;
    const aceOverflow = card.aceEffect ? card.aceEffect[aceIndex + 1] : null;
    const showColors = modifiers?.colors && !arraysEqualUnordered(modifiers?.colors, card.color);

    const isHovered = hoverCard === card;
    const isPartOfDraggedStack =
        stackDraggedLocation === location &&
        index !== undefined &&
        (inTamerField ? index >= stackSliceIndex : index <= stackSliceIndex); // Simplified for react-dnd

    const opacity = 1; // Simplified for react-dnd

    const isPartOfDraggableStack =
        index !== undefined &&
        !!stackDragIcon &&
        location === stackDragIcon.location &&
        (inTamerField ? index >= stackDragIcon.index : index <= stackDragIcon.index);

    const showCardModifiers =
        locationsWithAdditionalInfo.includes(location) && cardWidth > 60 && !isDragging && !isCardFaceDown;
    const renderModifiersOnTop =
        (digimonLocations.includes(location) && index === locationCards.length - 1) ||
        (tamerLocations.includes(location) && index === 0);

    const isDragIconHovered = index === stackDragIcon?.index && location === stackDragIcon?.location;

    function handleHoverDragIcon() {
        if (index !== undefined) {
            if (!isCardFaceDown && hoverCard !== card) setHoverCard(card);
            if (stackSliceIndex !== index) setStackSliceIndex(index);
            if (stackDragIcon?.index !== index || stackDragIcon?.location !== location)
                setStackDragIcon({ index, location });
        }
    }

    function onLongPress(e: React.TouchEvent<HTMLImageElement>) {
        if (myBALocations.includes(location)) setCardToSend(card.id, location);
        onContextMenu?.(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
    }

    const { handleTouchStart, handleTouchEnd } = useLongPress({ onLongPress });

    if (isDragging || isPartOfDraggedStack) {
        if (stackModal === location)
            return (
                <div
                    style={{ width: style?.width ?? cardWidth }}
                    id={index === (myTamerLocations.includes(location) ? 0 : locationCards.length - 1) ? location : ""}
                />
            );
        else
            return (
                <div
                    style={{ width: 1 }}
                    id={index === (myTamerLocations.includes(location) ? 0 : locationCards.length - 1) ? location : ""}
                />
            );
    }

    return (
        <>
            <DragPreviewImage
                connect={preview}
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" // Transparent 1x1 GIF
            />
            <DragPreviewImage
                connect={previewStackIcon}
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" // Transparent 1x1 GIF
            />
            <Wrapper
                // id is set for correct AttackArrow targeting
                id={index === (myTamerLocations.includes(location) ? 0 : locationCards.length - 1) ? location : ""}
                style={style}
                ref={dragRef as any}
                isDragIconHovered={isDragIconHovered}
            >
                {((index !== 0 && (myDigimonLocations.includes(location) || location === "myBreedingArea")) ||
                    (index !== locationCards.length - 1 && myTamerLocations.includes(location))) &&
                    (isHovered || isDragIconHovered || hoveredId === card.id) &&
                    !useToggleForStacks && (
                        <DragStackIconDiv
                            ref={stackDragRef as any}
                            className={"custom-hand-cursor"}
                            style={{
                                right: -(cardWidth / 15),
                                bottom: -(cardWidth / 15),
                                position: stackModal === location ? "absolute" : "fixed",
                            }}
                            onMouseEnter={handleHoverDragIcon}
                            onMouseOver={handleHoverDragIcon}
                            onMouseLeave={() => {
                                setHoverCard(null);
                                setStackDragIcon(null);
                            }}
                        >
                            <DragStackIcon fontSize={"large"} />
                        </DragStackIconDiv>
                    )}
                {showCardModifiers && (
                    <>
                        {renderModifiersOnTop && (
                            <>
                                {isModifiersAllowed && (
                                    <PlusDpSpan
                                        isHovering={isHovered}
                                        isNegative={finalDp < card.dp!}
                                        {...(finalDp === card.dp && { style: { color: "ghostwhite" } })}
                                    >
                                        {finalDp.toString()}
                                    </PlusDpSpan>
                                )}
                                {secAtkString && (
                                    <PlusSecAtkSpan isHovering={isHovered} isNegative={secAtkString.startsWith("-")}>
                                        {secAtkString}
                                        <StyledShieldIcon />
                                    </PlusSecAtkSpan>
                                )}

                                {hoverCard !== card && (
                                    <>
                                        {showColors && (
                                            <ColorStack>
                                                {modifiers?.colors.map((c) => (
                                                    <span key={`${c}_${card.id}_view`}>{getColor(c)}</span>
                                                ))}
                                            </ColorStack>
                                        )}
                                        <KeywordWrapper>
                                            {modifiers?.keywords
                                                .filter((w) => w !== "SICK")
                                                .map((keyword) => (
                                                    <ModifierSpan keyword={keyword} key={`${keyword}_${card.id}`}>
                                                        <span>{keyword}</span>
                                                    </ModifierSpan>
                                                ))}
                                        </KeywordWrapper>
                                        {card.level && (
                                            <LevelSpan isMega={card.level >= 6}>
                                                <span>Lv.</span>
                                                {card.level}
                                            </LevelSpan>
                                        )}
                                        {card.aceEffect && (
                                            <StyledAceSpan isMega={card.level! >= 6}>ACE-{aceOverflow}</StyledAceSpan>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {renderEffectAnimation && (
                            <CardAnimationContainer style={{ overflow: "hidden" }}>
                                <Lottie animationData={activateEffectAnimation} loop={true} />
                            </CardAnimationContainer>
                        )}
                        {renderTargetAnimation && (
                            <CardAnimationContainer>
                                <Lottie animationData={targetAnimation} loop={true} />
                            </CardAnimationContainer>
                        )}
                    </>
                )}
                {card.modifiers.keywords.includes("SICK") && (
                    <CardAnimationContainer
                        style={{
                            overflow: "clip",
                            top: 5,
                            left: 5,
                            right: 5,
                            bottom: "25%",
                            opacity,
                        }}
                    >
                        <img
                            style={{
                                filter: "drop-shadow(0 0 5px black) drop-shadow(0 0 2px goldenrod) drop-shadow(0 0 4px black)",
                            }}
                            alt={"suspended"}
                            src={suspendedAPNG}
                        />
                    </CardAnimationContainer>
                )}

                <StyledImage
                    style={{
                        ...(isPartOfDraggableStack && {
                            outline: "3px solid dodgerblue",
                            filter: "brightness(0.5) saturate(1.25) hue-rotate(30deg)",
                        }),
                    }}
                    className={opponentFieldLocations?.includes(location) ? undefined : "custom-hand-cursor"}
                    onClick={handleClick}
                    onTouchStartCapture={() => index && isStackDragMode && setStackSliceIndex(index)}
                    onDoubleClick={handleTiltCard}
                    onMouseEnter={handleHover}
                    onMouseOver={handleHover}
                    onMouseLeave={handleStopHover}
                    alt={card.name + " " + card.uniqueCardNumber}
                    src={isCardFaceDown ? getSleeve(location.includes("my") ? mySleeve : opponentSleeve) : cardImageUrl}
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
                        if (myBALocations.includes(location) || location === "myHand") setCardToSend(card.id, location);
                        onContextMenu?.(e);
                    }}
                    width={style ? style.width : 95}
                />
            </Wrapper>
        </>
    );
}

type StyledImageProps = {
    location: string;
    isTilted: boolean;
    activeEffect: boolean;
    targeted?: boolean;
    isTopCard?: boolean;
};

const StyledImage = styled.img<StyledImageProps>`
    border-radius: 5px;
    transition: all 0.15s ease-out;
    cursor: ${({ location }) => (opponentFieldLocations?.includes(location) ? "pointer" : undefined)};
    touch-action: none;
    display: block;
    object-fit: fill;
    aspect-ratio: 7 / 9.75;

    animation: ${({ isTilted, activeEffect, targeted, isTopCard, location }) =>
        targeted
            ? `target-pulsate${isTopCard || location.includes("Hand") ? "-first" : ""} 0.95s ease-in-out infinite`
            : activeEffect
              ? `effect${isTopCard ? "-first" : ""} 0.85s ease-in-out infinite`
              : isTilted
                ? "pulsate 5s ease-in-out infinite"
                : "none"};

    border-bottom: ${({ location }) =>
        digimonLocations.includes(location) || location.includes("Breeding") ? "1px solid rgba(0,0,0, 0.75)" : "none"};
    border-right: ${({ location }) =>
        locationsWithInheritedInfo.includes(location) ? "1px solid rgba(0,0,0, 0.75)" : "none"};

    filter: ${({ isTilted }) => (isTilted ? "brightness(0.7) saturate(0.7)" : "none")};

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;

    &:hover {
        filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5))
            ${({ isTilted }) => (isTilted ? "brightness(0.7) saturate(0.7)" : "none")};
        transform: scale(1.1);
    }

    @keyframes effect {
        0%,
        40%,
        100% {
            filter: drop-shadow(0 0 0px #004567) brightness(0.9) saturate(1.3);
            transform: unset;
        }
        70% {
            filter: drop-shadow(0 0 4px #0fe3b1) brightness(0.9) saturate(1.3);
            transform: translateY(5px);
        }
    }

    @keyframes effect-first {
        0%,
        40%,
        100% {
            filter: drop-shadow(0 0 0px #004567) brightness(0.9) saturate(1.3);
        }
        70% {
            filter: drop-shadow(0 0 4px #0fe3b1) brightness(0.9) saturate(1.3);
        }
    }

    @keyframes target-pulsate {
        0%,
        30%,
        100% {
            filter: drop-shadow(0 0 0px rgba(171, 138, 31, 0.25)) brightness(0.7) saturate(0.8);
            transform: unset;
        }
        70% {
            filter: drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1);
            transform: translateY(5px);
        }
    }

    @keyframes target-pulsate-first {
        0%,
        30%,
        100% {
            filter: drop-shadow(0 0 0px rgba(171, 138, 31, 0.25)) brightness(0.7) saturate(0.8);
        }
        70% {
            filter: drop-shadow(0 0 4px #e51042) brightness(0.5) saturate(1.1);
        }
    }
`;

export const CardAnimationContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 20px;
    z-index: 10000;
    pointer-events: none;
`;

const PlusDpSpan = styled.span<{ isHovering?: boolean; isNegative?: boolean }>`
    position: absolute;
    z-index: 15000;
    top: ${({ isHovering }) => (isHovering ? "-8px" : "-1px")};
    right: ${({ isHovering }) => (isHovering ? "-6px" : 0)};
    font-size: ${({ isHovering }) => (isHovering ? "1.1em" : "1em")};
    border: 1px solid #8b91fd;
    box-shadow: 0 0 2px black;
    pointer-events: none;
    user-select: none;
    font-family: Awsumsans, sans-serif;
    font-weight: 500;
    color: ${({ isNegative }) => (isNegative ? "#ff2190" : "#49fcbd")};
    line-height: 0.9;
    padding: ${({ isHovering }) => (isHovering ? "4px 2px 1px 2px" : "3px 2px 1px 2px")};
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
    left: ${({ isHovering }) => (isHovering ? "-5px" : "0px")};
    right: unset;
    border: unset;
    background: unset;
    box-shadow: unset;
    font-size: 1em;
`;

const LevelSpan = styled(PlusSecAtkSpan)<{ isMega: boolean }>`
    top: unset;
    left: 4px;
    bottom: ${({ isMega }) => (isMega ? "10px" : "24px")};
    background: unset;
    color: ghostwhite;
    filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black);
    span {
        font-size: ${({ isHovering }) => (isHovering ? "0.6em" : "0.5em")};
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

const StyledAceSpan = styled.span<{ isMega: boolean }>`
    font-family: Sakana, sans-serif;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    line-height: 1;
    font-size: 13px;
    position: absolute;
    background-image: linear-gradient(320deg, #dedede, #8f8f8f);
    bottom: ${({ isMega }) => (isMega ? "10px" : "25px")};
    right: 5px;
    z-index: 1;
    filter: drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black);
    pointer-events: none;
    transform: unset;
`;

const Wrapper = styled.div<{ isDragIconHovered: boolean }>`
    touch-action: none;
    position: relative;
    -moz-user-select: none;
    user-select: none;
    transition: transform 0.35s;
    display: block;
    &:hover {
        z-index: ${({ isDragIconHovered }) => (isDragIconHovered ? 99 : "unset")};
    }
`;

const ModifierSpan = styled.div<{ keyword: string }>`
    font-family: "League Spartan", sans-serif;
    color: ghostwhite;
    background: ${({ keyword }) => (keyword === "SICK" ? "rgba(1,78,114,0.9)" : "rgba(110, 48, 5, 0.9)")};
    border-radius: 25px;
    height: 18px;
    text-align: center;
    transition: background 0.3s;
    padding: ${({ keyword }) => (keyword.length >= 8 ? "2px" : "1px")} 5px
        ${({ keyword }) => (keyword.length >= 8 ? "1px" : "2px")} 5px;
    font-size: ${({ keyword }) => (keyword.length >= 8 ? "0.8em" : "1em")};

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

const DragStackIconDiv = styled.div`
    position: fixed;
    bottom: 0;
    z-index: 9999;
    border-radius: 3px;
    padding: 1px;
    display: flex;
    justify-content: center;
    align-items: center;

    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.5);
    background: rgba(0, 0, 0, 0.75);

    :hover {
        svg {
            color: dodgerblue;
        }
    }
`;

export function getColor(color: string): string {
    switch (color) {
        case "Red":
            return "🔴";
        case "Yellow":
            return "🟡";
        case "Green":
            return "🟢";
        case "Blue":
            return "🔵";
        case "Purple":
            return "🟣";
        case "Black":
            return "⚫";
        case "White":
            return "⚪";
        default:
            return "";
    }
}
