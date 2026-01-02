import { CardType, DeckType } from "../../utils/types.ts";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { fallbackCardNumber } from "../../hooks/useGeneralStates.ts";
import { getCardTypeImage, handleImageError } from "../../utils/functions.ts";
import { getSleeve } from "../../utils/sleeves.ts";
import LevelDistribution from "./LevelDistribution.tsx";
import { useState } from "react";
import { generalToken } from "../../utils/tokens.ts";
import hackmonImg from "../../assets/Hackmon.webp";
import { useSound } from "../../hooks/useSound.ts";
import { useDeckStates } from "../../hooks/useDeckStates.ts";
import MenuDialog from "../MenuDialog.tsx";
import CustomDialogTitle from "./CustomDialogTitle.tsx";
import ChooseMainDeckSleeve from "./ChooseMainDeckSleeve.tsx";
import ChooseDeckImage from "./ChooseDeckImage.tsx";
import ChooseEggDeckSleeve from "./ChooseEggDeckSleeve.tsx";
import { EditSquare as EditIcon } from "@mui/icons-material";
import DeckReadyCheck from "./DeckReadyCheck.tsx";

const tokenImageUrl =
    "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/tokenCard.jpg";

export type ProfileDeckProps = {
    deck: DeckType;
    isDragging?: boolean;
    lobbyView?: boolean;
    inRoom?: boolean;
};

function generateGradient(deckCards: CardType[]) {
    const colorMap = {
        Blue: "#3486E3FF",
        Green: "#25AB3BFF",
        Red: "#AB2530FF",
        Yellow: "#AB9925FF",
        Purple: "#9135AFFF",
        Black: "#212121FF",
        White: "#B2B2B2FF",
    };

    const colorCounts = {
        Blue: 0,
        White: 0,
        Green: 0,
        Purple: 0,
        Black: 0,
        Red: 0,
        Yellow: 0,
    };

    deckCards.forEach((card) =>
        card.color.forEach((color) => {
            // @ts-expect-error - colorCounts is defined above
            if (color in colorCounts) colorCounts[color]++;
        })
    );

    const totalCards = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);

    const gradientParts: string[] = [];
    let accumulatedPercentage = 0;

    Object.entries(colorCounts)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, count]) => count > 0)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .sort(([_, countA], [__, countB]) => countB - countA)
        .forEach(([color, count], index) => {
            const thisColorPercentage = (count / totalCards) * 100;
            // @ts-expect-error - colorMap is defined above
            const hexColor = colorMap[color];

            // for smooth gradients:
            // if (index === 0) gradientParts.push(`${hexColor} ${accumulatedPercentage.toFixed(2)}%`);
            //
            // accumulatedPercentage += thisColorPercentage;
            //
            // if (index === array.length - 1) accumulatedPercentage = 100;
            //
            // gradientParts.push(`${hexColor} ${accumulatedPercentage.toFixed(2)}%`);

            // for sharp gradients:
            const startPercentage = accumulatedPercentage;
            let endPercentage = accumulatedPercentage + thisColorPercentage;

            if (index === Object.keys(colorCounts).length - 1) endPercentage = 100;

            gradientParts.push(`${hexColor} ${startPercentage.toFixed(2)}%`);
            gradientParts.push(`${hexColor} ${endPercentage.toFixed(2)}%`);

            accumulatedPercentage += thisColorPercentage;
        });

    return `linear-gradient(90deg, ${gradientParts.join(", ")})`;
}

export default function DeckPanel(props: Readonly<ProfileDeckProps>) {
    const { deck, isDragging, lobbyView, inRoom } = props;

    const [isMainSleeveSelectionOpen, setIsMainSleeveSelectionOpen] = useState(false);
    const [selectedMainSleeve, setSelectedMainSleeve] = useState("");

    const [isEggSleeveSelectionOpen, setIsEggSleeveSelectionOpen] = useState(false);
    const [selectedEggSleeve, setSelectedEggSleeve] = useState("");

    const [isCoverCardSelectionOpen, setCoverCardSelectionOpen] = useState(false);
    const [selectedCoverCard, setSelectedCoverCard] = useState("");

    const fetchedCards = useDeckStates((state) => state.fetchedCards);
    const decks = useDeckStates((state) => state.decks);

    const cardMap = new Map(fetchedCards.map((card) => [card.uniqueCardNumber, card]));
    const uniqueCardNumbers = Array.from(new Set([...deck.mainDeckList, ...deck.eggDeckList]));
    const coverCardSelection = uniqueCardNumbers
        .map((cardNumber) => cardMap.get(cardNumber)?.imgUrl)
        .filter((url) => url !== undefined);

    const playDrawCardSfx = useSound((state) => state.playDrawCardSfx);

    const navigate = useNavigate();
    const navigateToDeck = (e: React.MouseEvent<HTMLDivElement>) => {
        if (inRoom) {
            e.preventDefault();
            const confirmed = window.confirm("Opening Deck Builder will make you leave the room!");
            if (!confirmed) return;
        }
        playDrawCardSfx();
        navigate(`/deckbuilder/${deck.id}`);
    };

    function onMainSleeveClick() {
        if (!selectedMainSleeve) setSelectedMainSleeve(deck.mainSleeveName);
        setIsMainSleeveSelectionOpen(true);
    }

    function onEggSleeveClick() {
        if (!selectedEggSleeve) setSelectedEggSleeve(deck.eggSleeveName);
        setIsEggSleeveSelectionOpen(true);
    }

    function onImageClick() {
        if (!selectedCoverCard) setSelectedCoverCard(deck.deckImageCardUrl);
        setCoverCardSelectionOpen(true);
    }

    const mainDeckCards: CardType[] = deck.mainDeckList.map(
        (uniqueCardNumber) =>
            fetchedCards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0] ??
            fetchedCards.filter((card) => card.cardNumber === uniqueCardNumber.split("_")[0])[0] ?? {
                ...generalToken,
                cardNumber: fallbackCardNumber,
            }
    );

    const eggDeckCards: CardType[] = deck.eggDeckList.map(
        (uniqueCardNumber) =>
            fetchedCards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0] ??
            fetchedCards.filter((card) => card.cardNumber === uniqueCardNumber.split("_")[0])[0] ?? {
                ...generalToken,
                cardNumber: fallbackCardNumber,
            }
    );

    const digimonCount = mainDeckCards.filter((card) => card.cardType === "Digimon").length;
    const tamerCount = mainDeckCards.filter((card) => card.cardType === "Tamer").length;
    const optionCount = mainDeckCards.filter((card) => card.cardType === "Option").length;
    const eggCount = eggDeckCards.length;

    const errorCount =
        mainDeckCards.filter((card) => card.cardNumber === fallbackCardNumber).length +
        eggDeckCards.filter((card) => card.cardNumber === fallbackCardNumber).length;

    return (
        <WrapperDiv style={{ pointerEvents: isDragging ? "none" : "unset" }} lobbyView={lobbyView}>
            <MenuDialog
                onClose={() => setIsMainSleeveSelectionOpen(false)}
                open={isMainSleeveSelectionOpen}
                PaperProps={{ sx: { overflow: "hidden" } }}
            >
                <CustomDialogTitle
                    handleOnClose={() => setIsMainSleeveSelectionOpen(false)}
                    title={"Set main deck sleeve:"}
                />
                <ChooseMainDeckSleeve
                    deckId={deck.id}
                    selectedSleeve={selectedMainSleeve}
                    setSelectedSleeve={setSelectedMainSleeve}
                />
            </MenuDialog>

            <MenuDialog
                onClose={() => setIsEggSleeveSelectionOpen(false)}
                open={isEggSleeveSelectionOpen}
                PaperProps={{ sx: { overflow: "hidden" } }}
            >
                <CustomDialogTitle
                    handleOnClose={() => setIsEggSleeveSelectionOpen(false)}
                    title={"Set egg deck sleeve:"}
                />
                <ChooseEggDeckSleeve
                    deckId={deck.id}
                    selectedSleeve={selectedEggSleeve}
                    setSelectedSleeve={setSelectedEggSleeve}
                />
            </MenuDialog>

            <MenuDialog onClose={() => setCoverCardSelectionOpen(false)} open={isCoverCardSelectionOpen}>
                <CustomDialogTitle handleOnClose={() => setCoverCardSelectionOpen(false)} title={"Set cover card:"} />
                <ChooseDeckImage
                    deckId={deck.id}
                    selection={coverCardSelection}
                    selectedImage={selectedCoverCard}
                    setSelectedImage={setSelectedCoverCard}
                />
            </MenuDialog>

            {!!errorCount && fetchedCards.length > 0 && decks.length > 0 && (
                <ErrorSpan>{`${errorCount} missing cards`}</ErrorSpan>
            )}
            {!lobbyView && <DeckName>{deck.name}</DeckName>}
            <ContainerDiv style={{ transform: isDragging ? "scale(0.95)" : "unset" }} lobbyView={lobbyView}>
                <LevelDistribution deckCards={mainDeckCards} />

                <CardTypeDigimon>
                    <img src={getCardTypeImage("Digimon")} alt={"Digimon"} />
                    <span>{digimonCount}</span>
                </CardTypeDigimon>
                <CardTypeTamer>
                    <img src={getCardTypeImage("Tamer")} alt={"Tamer"} />
                    <span>{tamerCount}</span>
                </CardTypeTamer>
                <CardTypeOption>
                    <img src={getCardTypeImage("Option")} alt={"Option"} />
                    <span>{optionCount}</span>
                </CardTypeOption>
                <CardTypeEgg>
                    <img src={getCardTypeImage("Digi-Egg")} alt={"Egg"} />
                    <span>{eggCount}</span>
                </CardTypeEgg>

                <PanelButtonContainer className={"button"} onClick={navigateToDeck}>
                    <EditIcon />
                </PanelButtonContainer>

                <SleeveImage
                    className={"button"}
                    src={getSleeve("Digimon", selectedMainSleeve ? selectedMainSleeve : deck.mainSleeveName)}
                    onError={handleImageError}
                    onClick={onMainSleeveClick}
                />

                <EggSleeveImage
                    className={"button"}
                    src={getSleeve("Digi-Egg", selectedEggSleeve ? selectedEggSleeve : deck.eggSleeveName)}
                    onError={handleImageError}
                    onClick={onEggSleeveClick}
                />

                <DeckReadyCheck deck={deck} isLobbyView={!!lobbyView} />

                {fetchedCards.length > 0 && mainDeckCards.length > 0 && (
                    <CardImage
                        className={"button"}
                        hasError={!!errorCount}
                        src={
                            errorCount
                                ? hackmonImg
                                : selectedCoverCard
                                  ? selectedCoverCard
                                  : (deck.deckImageCardUrl ?? tokenImageUrl)
                        }
                        onError={handleImageError}
                        onClick={onImageClick}
                    />
                )}

                <ColorLineDiv style={{ background: generateGradient([...mainDeckCards, ...eggDeckCards]) }} />
            </ContainerDiv>
        </WrapperDiv>
    );
}

const WrapperDiv = styled.div<{ lobbyView?: boolean }>`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    border-radius: 12px;
    height: ${({ lobbyView }) => (lobbyView ? 160 : 180)}px;
    width: 280px;
    background: linear-gradient(
        20deg,
        rgba(87, 171, 255, 0.12) 0%,
        rgba(93, 159, 236, 0.12) 70%,
        rgba(94, 187, 245, 0.22) 100%
    );
    padding: 3px;
    box-shadow: inset 0 0 3px 0 rgba(148, 224, 255, 0.4);
`;

const ContainerDiv = styled.div<{ lobbyView?: boolean }>`
    position: relative;
    width: 100%;
    height: ${({ lobbyView }) => (lobbyView ? "92.5%" : "81.5%")};
    padding: 6px;
    display: grid;
    justify-content: center;
    align-items: center;
    gap: 4px;
    grid-template-columns: 1fr 1fr 1fr 0.8fr 0.8fr 1.2fr 1.2fr;
    grid-template-rows: repeat(6, 1fr);
    grid-template-areas:
        "card-image card-image card-image sleeve sleeve egg-sleeve edit"
        "card-image card-image card-image sleeve sleeve egg-sleeve edit"
        "card-image card-image card-image sleeve sleeve . ready"
        "card-image card-image card-image levels levels digimons tamers"
        "card-image card-image card-image levels levels options eggs"
        "card-image card-image card-image colors colors colors colors";
    background-color: #070707;
    box-shadow: inset 0 0 3px 0 rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    transition: all 0.2s ease;
`;

const DeckName = styled.span`
    font-family: "League Spartan", sans-serif;
    font-size: 16px;
    color: ghostwhite;
    position: absolute;
    max-width: 240px;
    overflow-x: clip;
    left: 10px;
    top: 2px;
    text-align: left;
    text-shadow: 1px 1px 2px black;
`;

const CardImage = styled.img<{ hasError: boolean }>`
    max-height: 100%;
    grid-area: card-image;
    border-radius: 6px;
    pointer-events: ${({ hasError }) => (hasError ? "none" : "unset")};
    transform: ${({ hasError }) => (hasError ? "translate(-5px, -7px)" : "unset")};
    :hover {
        cursor: pointer;
        filter: drop-shadow(0 0 3px rgba(87, 160, 255, 0.6)) contrast(1.1);
    }
`;

const SleeveImage = styled.img`
    max-height: 100%;
    border-radius: 2px;
    grid-area: sleeve;
    transform: translateX(-2px);

    :hover {
        filter: drop-shadow(0 0 2px rgba(87, 160, 255, 0.5)) contrast(1.1);
    }
`;

const EggSleeveImage = styled.img`
    border-radius: 2px;
    grid-area: egg-sleeve;
    position: absolute;
    height: 71px;
    width: 53px;

    left: 0;
    top: 0;
    transform: translateX(-5px);

    :hover {
        filter: drop-shadow(0 0 2px rgba(87, 160, 255, 0.5)) contrast(1.1);
    }
`;

const CardTypeContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transform: translateY(3px);

    img {
        height: 22px;
    }

    span {
        font-family: Cousine, sans-serif;
        font-size: 16px;
        position: absolute;
        left: 25px;
        top: 0;
    }
`;

const CardTypeDigimon = styled(CardTypeContainer)`
    grid-area: digimons;
`;

const CardTypeTamer = styled(CardTypeContainer)`
    grid-area: tamers;
`;

const CardTypeOption = styled(CardTypeContainer)`
    grid-area: options;
    img {
        transform: translateY(1px);
    }
`;

const CardTypeEgg = styled(CardTypeContainer)`
    grid-area: eggs;
`;

const ColorLineDiv = styled.div`
    grid-area: colors;
    width: 100%;
    height: 15px;
    border-radius: 3px;
    transform: translate(-2px, 1px);
    box-shadow: inset 0 0 2px 0 rgba(219, 236, 243, 0.4);
`;

const ErrorSpan = styled.span`
    font-family: "League Spartan", sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: crimson;
    position: absolute;
    bottom: 3px;
    left: 10px;
    z-index: 6;
`;

const PanelButtonContainer = styled.div`
    grid-area: edit;
    width: 92%;
    height: 80%;
    background: linear-gradient(
        135deg,
        rgba(87, 171, 255, 0.125) 0%,
        rgba(93, 159, 236, 0.125) 70%,
        rgba(94, 187, 245, 0.125) 98%,
        rgba(94, 187, 245, 0.1) 100%
    );

    border-right: none;
    border-radius: 0 10px 0 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    transform: translate(10px, -11px);

    &:hover {
        color: #508dd3;
        background: linear-gradient(
            135deg,
            rgba(87, 171, 255, 0.14) 0%,
            rgba(93, 159, 236, 0.13) 70%,
            rgba(94, 187, 245, 0.125) 98%,
            rgba(94, 187, 245, 0.1) 100%
        );
    }

    &:active {
        color: #3184e3;
        svg {
            scale: 0.95;
        }
    }
`;
