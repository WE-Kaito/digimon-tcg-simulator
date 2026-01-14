import styled from "@emotion/styled";
import loadingAnimation from "../../assets/lotties/loading.json";
import Lottie from "lottie-react";
import { fallbackCardNumber } from "../../hooks/useGeneralStates.ts";
import { CardTypeWithId } from "../../utils/types.ts";
import DeckbuilderCard from "./DeckbuilderCard.tsx";
import { getCardTypeImage } from "../../utils/functions.ts";
import { useSound } from "../../hooks/useSound.ts";
import LevelDistribution from "../deckPanel/LevelDistribution.tsx";
import { useMediaQuery } from "@mui/material";
import { cardsWithoutLimit, sortCards, useDeckStates } from "../../hooks/useDeckStates.ts";

export default function DeckSelection() {
    const mainDeckCards = useDeckStates((state) => state.mainDeckCards);
    const eggDeckCards = useDeckStates((state) => state.eggDeckCards);
    const isLoading = useDeckStates((state) => state.isLoading);
    const isSettingDeck = useDeckStates((state) => state.isSettingDeck);
    const addCardToDeck = useDeckStates((state) => state.addCardToDeck);
    const deleteFromDeck = useDeckStates((state) => state.deleteFromDeck);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);

    const digimonLength = mainDeckCards.filter((card: CardTypeWithId) => card.cardType === "Digimon").length;
    const tamerLength = mainDeckCards.filter((card: CardTypeWithId) => card.cardType === "Tamer").length;
    const optionLength = mainDeckCards.filter((card: CardTypeWithId) => card.cardType === "Option").length;
    const eggLength = eggDeckCards.length;

    const sortedDeck = sortCards([...eggDeckCards, ...mainDeckCards]);
    const cardGroups: { [key: string]: CardTypeWithId[] } = {};
    sortedDeck.forEach((card) => {
        const uniqueCardNumber = card.uniqueCardNumber;
        if (!cardGroups[uniqueCardNumber]) {
            cardGroups[uniqueCardNumber] = [];
        }
        cardGroups[uniqueCardNumber].push(card);
    });

    function getAddAllowed(card: CardTypeWithId) {
        if (card.cardType === "Digi-Egg") {
            return eggLength < 5 && eggDeckCards.filter((c) => c.cardNumber === card.cardNumber).length < 4;
        }
        return (
            (mainDeckCards.length < 50 && mainDeckCards.filter((c) => c.cardNumber === card.cardNumber).length < 4) ||
            [...cardsWithoutLimit, fallbackCardNumber].includes(card.cardNumber)
        );
    }

    const isMobile = useMediaQuery("(max-width:499px)");

    return (
        <>
            <Stats>
                <StyledSpan style={{ scale: isMobile ? 0.9 : undefined }}>{mainDeckCards.length} / 50</StyledSpan>

                <div style={{ transform: "translateY(3px)", scale: isMobile ? 0.9 : 1.1, width: 50 }}>
                    <LevelDistribution deckCards={mainDeckCards} />
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: isMobile ? 8 : 24 }}>
                    <StatContainer>
                        <StyledIcon src={getCardTypeImage("Digi-Egg")} alt="Egg: " />
                        <StyledSpan>{eggLength} / 5</StyledSpan>
                    </StatContainer>

                    <StatContainer>
                        <StyledIcon
                            style={{ width: isMobile ? 40 : 50, transform: "translateY(1px)" }}
                            src={getCardTypeImage("Option")}
                            alt="Option: "
                        />
                        <StyledSpan>{optionLength}</StyledSpan>
                    </StatContainer>

                    <StatContainer>
                        <StyledIcon src={getCardTypeImage("Tamer")} alt="Tamer: " />
                        <StyledSpan>{tamerLength}</StyledSpan>
                    </StatContainer>

                    <StatContainer>
                        <StyledIcon src={getCardTypeImage("Digimon")} alt="Digimon: " />
                        <StyledSpan>{digimonLength}</StyledSpan>
                    </StatContainer>
                </div>
            </Stats>

            <DeckContainer>
                {!isLoading && !isSettingDeck ? (
                    Object.values(cardGroups).map((group, groupIndex) => {
                        return (
                            <GroupContainer key={groupIndex}>
                                {group.map((card: CardTypeWithId, index) => {
                                    if (index > 0) {
                                        if (group[index - 1]?.uniqueCardNumber === card.uniqueCardNumber) {
                                            const pos = index < 3 ? 5 * index : 3 * 5;
                                            return (
                                                <div
                                                    key={card.id}
                                                    style={{ position: "absolute", left: pos, top: pos }}
                                                >
                                                    {index < 4 && <DeckbuilderCard card={card} location={"deck"} />}
                                                </div>
                                            );
                                        }
                                    }
                                    return (
                                        <div key={card.id}>
                                            <DeckbuilderCard card={card} location={"deck"} />
                                        </div>
                                    );
                                })}
                                <AmountContainer>
                                    <DecButton
                                        className={"button"}
                                        onClick={() => {
                                            deleteFromDeck(group.at(-1)!.id);
                                            playTrashCardSfx();
                                        }}
                                    >
                                        −
                                    </DecButton>
                                    <span style={{ color: group.length > 4 ? "#ffcf00" : undefined }}>
                                        {group.length}
                                    </span>
                                    <IncButton
                                        className={"button"}
                                        disabled={!getAddAllowed(group[0])}
                                        onClick={() => {
                                            addCardToDeck(
                                                group[0].cardNumber,
                                                group[0].cardType,
                                                group[0].uniqueCardNumber
                                            );
                                            playPlaceCardSfx();
                                        }}
                                    >
                                        +
                                    </IncButton>
                                </AmountContainer>
                            </GroupContainer>
                        );
                    })
                ) : (
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Lottie animationData={loadingAnimation} loop={true} style={{ width: "50%" }} />
                    </div>
                )}
            </DeckContainer>
        </>
    );
}

const GroupContainer = styled.div`
    border-radius: 5px;
    padding: 0 16px 30px 0;
    position: relative;
    height: fit-content;

    ::before {
        content: "";
        position: absolute;
        opacity: 1;
        inset: 0;
        border-radius: 8px;
        background-image: repeating-linear-gradient(135deg, black 0px, transparent 1px);
        filter: blur(1px); /* Blur the pattern only */
        z-index: -1;
    }
`;

const AmountContainer = styled.span`
    width: 100px;
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    color: ghostwhite;
    text-shadow: 0 0 2px black;
    font-size: 18px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: space-between;
`;

const Stats = styled.div`
    width: 100%;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;

    background: var(--blue);
`;

const StatContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const StyledIcon = styled.img`
    width: 45px;

    @media (max-width: 499px) {
        width: 35px;
    }
`;

const StyledSpan = styled.span`
    font-size: 25px;
    font-family: "AwsumSans", sans-serif;
    transform: translateY(4px);
`;

const DeckContainer = styled.div`
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    max-height: calc(100vh - 250px);
    font-family: "AwsumSans", sans-serif;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    place-content: flex-start;
    gap: 16px;

    overflow-y: scroll;
    overflow-x: hidden;

    padding: 8px 0 10px 12px;
    border: 2px solid var(--blue);
    //border-radius: 5px;
    filter: drop-shadow(0 0 3px rgba(56, 111, 240, 0.325));

    animation: neon-inset-glow 5s infinite alternate;

    @supports (-moz-appearance: none) {
        scrollbar-width: thin;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(
            to bottom right,
            rgba(63, 109, 207, 0.75) 0%,
            rgba(48, 95, 217, 0.75) 50%,
            rgba(84, 126, 215, 0.75) 100%
        );
        border-radius: 5px;
        box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            inset 0 -1px 3px rgba(0, 0, 0, 0.9);
    }

    @keyframes neon-inset-glow {
        0% {
            box-shadow:
                inset 0 0 5px rgba(30, 144, 255, 0.125),
                inset 0 0 10px rgba(30, 144, 255, 0.125),
                inset 0 0 15px rgba(30, 144, 255, 0.125);
        }
        100% {
            box-shadow:
                inset 0 0 8px rgba(30, 144, 255, 0.2),
                inset 0 0 13px rgba(30, 144, 255, 0.2),
                inset 0 0 18px rgba(30, 144, 255, 0.2);
        }
    }
`;

const IncButton = styled.div<{ disabled?: boolean }>`
    border-radius: 3px;
    background: #1d6c63;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    width: 32px;
    font-size: 24px;
    margin-bottom: 3px;
    font-family: sans-serif;
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.5);
    z-index: 1000;
    opacity: 0.75;

    &:hover {
        opacity: 1;
        filter: brightness(1.2) contrast(1.2) saturate(1.1);
    }

    &:active {
        opacity: 1;
        filter: brightness(1.25) contrast(1.25) saturate(1.25);
    }

    pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
    filter: ${(props) => (props.disabled ? "grayscale(1) opacity(0.5)" : "none")};
`;

const DecButton = styled(IncButton)`
    background: #721b39;
`;
