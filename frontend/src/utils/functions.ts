import { CardType, CardTypeGame, CardTypeWithId } from "./types.ts";
import cardBack from "../assets/cardBack.jpg";
import dataImage from "../assets/attribute_icons/data.png";
import virusImage from "../assets/attribute_icons/virus.png";
import vaccineImage from "../assets/attribute_icons/vaccine.png";
import freeImage from "../assets/attribute_icons/free.png";
import unknownImage from "../assets/attribute_icons/unknown.png";
import variableImage from "../assets/attribute_icons/variable.png";
import godIconSrc from "../assets/attribute_icons/appmon/god.png";
import gameIconSrc from "../assets/attribute_icons/appmon/game.png";
import lifeIconSrc from "../assets/attribute_icons/appmon/life.png";
import naviIconSrc from "../assets/attribute_icons/appmon/navi.png";
import socialIconSrc from "../assets/attribute_icons/appmon/social.png";
import systemIconSrc from "../assets/attribute_icons/appmon/system.png";
import toolIconSrc from "../assets/attribute_icons/appmon/tool.png";
import digimonImage from "../assets/cardtype_icons/gammamon.png";
import optionImage from "../assets/cardtype_icons/option.png";
import tamerImage from "../assets/cardtype_icons/tamer.png";
import eggImage from "../assets/cardtype_icons/egg.png";
import axios from "axios";
import { starterBeelzemon, starterDragonOfCourage, starterGallantmon, starterVortexWarriors } from "./starterDecks.ts";

export function calculateCardRotation(handCardLength: number, index: number) {
    if (handCardLength > 15) return "0deg";
    const middleIndex = Math.floor(handCardLength / 2);
    let value = (index - middleIndex) / 1.5;
    if (handCardLength <= 6) value *= 2;
    if (handCardLength > 7) value = (index - middleIndex) / 3.25;
    return value * handCardLength + "deg";
}

export function calculateCardOffsetY(handCardLength: number, index: number) {
    if (handCardLength === 3 && index === 1) return "-5px";
    if (handCardLength <= 3) return "0px";
    if (handCardLength > 15) return "5%";

    const middleIndex = Math.floor(handCardLength / 2);
    const middleValue = 0;
    let endValue = handCardLength + 5 + (handCardLength / 3) * 2;
    if (handCardLength >= 5) {
        if (index === 0 || index === handCardLength - 1) endValue += (handCardLength / 3) * 3.25;
        if (index === 1 || index === handCardLength - 2) endValue += (handCardLength / 3) * 1.9;
        if (index === 2 || index === handCardLength - 3) endValue += (handCardLength / 3) * 1.5;
        if (index === 3 || index === handCardLength - 4) endValue += (handCardLength / 3) * 1.25;
        if (index === 4 || index === handCardLength - 5) endValue += (handCardLength / 3) * 1.1;
        if (index === 5 || index === handCardLength - 6) endValue += handCardLength / 3;
        if (index === 6 || index === handCardLength - 7) endValue += (handCardLength / 3) * 0.9;
    }
    const distanceToMiddle = Math.abs(index - middleIndex);
    let offset = middleValue + (endValue - middleValue) * (distanceToMiddle / (middleIndex - 1)) - handCardLength;
    if (index === middleIndex && handCardLength % 2 === 0) offset -= 2 + handCardLength / 6;
    return index === middleIndex || (index === 0 && handCardLength == 6)
        ? offset + 10 - handCardLength / 3 + handCardLength / 10 + "px"
        : offset + "px";
}

export function calculateCardOffsetX(handCardLength: number, index: number, cardWidth: number) {
    const scale = cardWidth / (70 - (handCardLength > 30 ? (handCardLength - 30) / 3 : 0));

    if (handCardLength === 1) return `${150 * scale}px`;
    if (handCardLength === 2) return `${(index * 150 * scale) / handCardLength + 80 * scale}px`;
    if (handCardLength === 3) return `${(index * 250 * scale) / handCardLength + 50 * scale}px`;
    if (handCardLength > 30) return `${(index * 350 * scale) / handCardLength - 10}px`;
    if (handCardLength > 3) return `${(index * 350 * scale) / handCardLength}px`;
}

export function topCardInfo(locationCards: CardTypeGame[]) {
    if (locationCards.length <= 1) return "";
    const effectInfo = [""];
    locationCards.forEach((card, index) => {
        if (index === locationCards.length - 1 || !card.inheritedEffect) return;
        effectInfo.push(card.inheritedEffect);
    });
    effectInfo.reverse();
    return effectInfo.join("\n");
}

export function topCardInfoLink(locationCards: CardTypeGame[]) {
    if (!locationCards.length) return [];
    const linkEffectInfo: { dp: number; effect: string }[] = [];
    locationCards.forEach((card) => {
        linkEffectInfo.push({ dp: card.linkDP ?? 0, effect: card.linkEffect ?? "" });
    });
    return linkEffectInfo.reverse();
}

type SfxFunctions = {
    playButtonClickSfx: () => void;
    playDrawCardSfx: () => void;
    playNextPhaseSfx: () => void;
    playOpponentPlaceCardSfx: () => void;
    playPassTurnSfx: () => void;
    playRevealCardSfx: () => void;
    playSecurityRevealSfx: () => void;
    playShuffleDeckSfx: () => void;
    playSuspendSfx: () => void;
    playTrashCardSfx: () => void;
    playUnsuspendSfx: () => void;
};

export function getOpponentSfx(command: string, functions: SfxFunctions) {
    const {
        playButtonClickSfx,
        playDrawCardSfx,
        playNextPhaseSfx,
        playOpponentPlaceCardSfx,
        playPassTurnSfx,
        playRevealCardSfx,
        playSecurityRevealSfx,
        playShuffleDeckSfx,
        playSuspendSfx,
        playTrashCardSfx,
        playUnsuspendSfx,
    } = functions;

    switch (command) {
        case "[REVEAL_SFX]": {
            playRevealCardSfx();
            break;
        }
        case "[SECURITY_REVEAL_SFX]": {
            playSecurityRevealSfx();
            break;
        }
        case "[PLACE_CARD_SFX]": {
            playOpponentPlaceCardSfx();
            break;
        }
        case "[DRAW_CARD_SFX]": {
            playDrawCardSfx();
            break;
        }
        case "[SUSPEND_CARD_SFX]": {
            playSuspendSfx();
            break;
        }
        case "[UNSUSPEND_CARD_SFX]": {
            playUnsuspendSfx();
            break;
        }
        case "[BUTTON_CLICK_SFX]": {
            playButtonClickSfx();
            break;
        }
        case "[TRASH_CARD_SFX]": {
            playTrashCardSfx();
            break;
        }
        case "[SHUFFLE_DECK_SFX]": {
            playShuffleDeckSfx();
            break;
        }
        case "[NEXT_PHASE_SFX]": {
            playNextPhaseSfx();
            break;
        }
        case "[PASS_TURN_SFX]": {
            playPassTurnSfx();
            break;
        }
    }
}

export function sortCards(deck: CardTypeWithId[]) {
    const newDeck = [...deck];
    newDeck.sort(compareCardNumbers);
    newDeck.sort(compareCardLevels);
    newDeck.sort(compareCardTypes);
    return newDeck;
}

function compareCardNumbers(a: CardTypeWithId, b: CardTypeWithId) {
    if (a.cardNumber < b.cardNumber) return -1;
    if (a.cardNumber > b.cardNumber) return 1;
    return 0;
}

function compareCardLevels(a: CardTypeWithId, b: CardTypeWithId) {
    if (a.level === null && b.level === null) return 0;
    if (a.level === null) return -1;
    if (b.level === null) return 1;
    if (a.level && b.level && a.level < b.level) return -1;
    if (a.level && b.level && a.level > b.level) return 1;
    return 0;
}

function compareCardTypes(a: CardTypeWithId, b: CardTypeWithId) {
    const typeOrder: { [key: string]: number } = {
        "Digi-Egg": 0,
        Option: 1,
        Tamer: 2,
        Digimon: 3,
    };
    const aTypeOrder = typeOrder[a.cardType];
    const bTypeOrder = typeOrder[b.cardType];

    if (aTypeOrder < bTypeOrder) return -1;
    if (aTypeOrder > bTypeOrder) return 1;

    return 0;
}

export function convertForLog(location: string) {
    const locationMappings: Record<string, string> = {
        myHand: "Hand",
        myDeckField: "Deck",
        myEggDeck: "Egg-Deck",
        myTrash: "Trash",
        mySecurity: "Security",
        myBreedingArea: "Breeding",
        myDigi1: "BA 1",
        myDigi2: "BA 2",
        myDigi3: "BA 3",
        myDigi4: "BA 4",
        myDigi5: "BA 5",
        myDigi6: "BA 6",
        myDigi7: "BA 7",
        myDigi8: "BA 8",
        myDigi9: "BA 9",
        myDigi10: "BA 10",
        myDigi11: "BA 11",
        myDigi12: "BA 12",
        myDigi13: "BA 13",
        myLink1: "Link 1",
        myLink2: "Link 2",
        myLink3: "Link 3",
        myLink4: "Link 4",
        myLink5: "Link 5",
        myLink6: "Link 6",
        myLink7: "Link 7",
        myLink8: "Link 8",
        myReveal: "Reveal",

        opponentHand: "Hand",
        opponentDeckField: "Deck",
        opponentEggDeck: "Egg-Deck",
        opponentTrash: "Trash",
        opponentSecurity: "Security",
        opponentBreedingArea: "Breeding",
        opponentDigi1: "BA 1",
        opponentDigi2: "BA 2",
        opponentDigi3: "BA 3",
        opponentDigi4: "BA 4",
        opponentDigi5: "BA 5",
        opponentDigi6: "BA 6",
        opponentDigi7: "BA 7",
        opponentDigi8: "BA 8",
        opponentDigi9: "BA 9",
        opponentDigi10: "BA 10",
        opponentDigi11: "BA 11",
        opponentDigi12: "BA 12",
        opponentDigi13: "BA 13",
        opponentLink1: "Link 1",
        opponentLink2: "Link 2",
        opponentLink3: "Link 3",
        opponentLink4: "Link 4",
        opponentLink5: "Link 5",
        opponentLink6: "Link 6",
        opponentLink7: "Link 7",
        opponentLink8: "Link 8",
        opponentReveal: "Reveal",
    };
    return locationMappings[location] || location;
}

function saveStarterDeck(name: string, decklist: string[], imgUrl: string, sleeveName: string) {
    const deckToSave = {
        name: name,
        decklist: decklist,
        deckImageCardUrl: imgUrl,
        sleeveName: sleeveName,
        isAllowed_en: sleeveName !== "Pteromon", // change after en release; restriction model on decks should be changed.
        isAllowed_jp: true,
    };

    axios
        .post("/api/profile/decks", deckToSave)
        .then((res) => res.data)
        .catch((error) => {
            console.error(error);
            throw error;
        });
}

const deckImgDragonOfCourage =
    "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST15-12.webp";
const deckImgGallantmon =
    "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST7-09.webp";
const deckImgBeelzemon =
    "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST14-10.webp";
const deckImgVortexWarriors =
    "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/P-038_P4-J.webp";

export function addStarterDecks() {
    setTimeout(
        () => saveStarterDeck("[STARTER] Dragon Of Courage", starterDragonOfCourage, deckImgDragonOfCourage, "Agumon"),
        10
    );
    setTimeout(() => saveStarterDeck("[STARTER] Gallantmon", starterGallantmon, deckImgGallantmon, "Guilmon"), 20);
    setTimeout(() => saveStarterDeck("[ADV. STARTER] Beelzemon", starterBeelzemon, deckImgBeelzemon, "Impmon"), 30);
    setTimeout(
        () => saveStarterDeck("[STARTER] Vortex Warriors", starterVortexWarriors, deckImgVortexWarriors, "Pteromon"),
        40
    );
}

export function getCardColor(color: string): [string, string] {
    switch (color) {
        case "Red":
            return ["#b02626", "ghostwhite"];
        case "Yellow":
            return ["#cbbc2f", "black"];
        case "Green":
            return ["#0c8a3e", "ghostwhite"];
        case "Blue":
            return ["#017fc2", "ghostwhite"];
        case "Purple":
            return ["#7f2dbd", "ghostwhite"];
        case "Black":
            return ["#212121", "ghostwhite"];
        case "White":
            return ["#DBDBDB", "black"];
        default:
            return ["transparent", ""];
    }
}

export function getAttributeImage(attribute: string | null | undefined) {
    switch (attribute) {
        case "Virus":
            return virusImage;
        case "Data":
            return dataImage;
        case "Vaccine":
            return vaccineImage;
        case "Free":
            return freeImage;
        case "Variable":
            return variableImage;
        case "Unknown":
            return unknownImage;
        case "God":
            return godIconSrc;
        case "Game":
            return gameIconSrc;
        case "Life":
            return lifeIconSrc;
        case "Navi":
            return naviIconSrc;
        case "Social":
            return socialIconSrc;
        case "System":
            return systemIconSrc;
        case "Tool":
            return toolIconSrc;
        case "default":
            return;
    }
}

export function getCardTypeImage(cardType: string | undefined) {
    switch (cardType) {
        case "Digimon":
            return digimonImage;
        case "Option":
            return optionImage;
        case "Tamer":
            return tamerImage;
        case "Digi-Egg":
            return eggImage;
        case "default":
            return;
    }
}

export function compareEffectText(searchText: string, card: CardTypeWithId): boolean {
    const text = searchText.toUpperCase();

    const mainEffectMatch = card.mainEffect?.toUpperCase().includes(text) ?? false;
    const inheritedEffectMatch = card.inheritedEffect?.toUpperCase().includes(text) ?? false;
    const securityEffectMatch = card.securityEffect?.toUpperCase().includes(text) ?? false;
    const digivolveEffectMatch = card.specialDigivolve?.toUpperCase().includes(text) ?? false;
    const dnaEffectMatch = card.dnaDigivolve?.toUpperCase().includes(text) ?? false;
    const burstEffectMatch = card.burstDigivolve?.toUpperCase().includes(text) ?? false;
    const xrosEffectMatch = card.digiXros?.toUpperCase().includes(text) ?? false;

    return (
        mainEffectMatch ||
        inheritedEffectMatch ||
        securityEffectMatch ||
        digivolveEffectMatch ||
        dnaEffectMatch ||
        burstEffectMatch ||
        xrosEffectMatch
    );
}

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) =>
    ((event.target as HTMLImageElement).src = cardBack);

//workaround for double cards in fetchCardList
export function filterDoubleCardNumbers(cards: CardTypeWithId[]): CardTypeWithId[] {
    const uniqueCards = [];
    let prevCardNumber = null;
    for (const card of cards) {
        if (card.uniqueCardNumber !== prevCardNumber) {
            uniqueCards.push(card);
            prevCardNumber = card.uniqueCardNumber;
        }
    }
    return uniqueCards;
}

export function generateGradient(deckCards: CardType[]) {
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

export function getIsDeckAllowed(deck: CardTypeWithId[], format: "english" | "japanese"): boolean {
    if (deck.find((card) => ["Banned", "Not released"].includes(card.restrictions[format]))) return false;

    const restrictedCards = deck.filter((card) => card.restrictions[format] === "Restricted to 1");
    let lastCard: CardTypeWithId;

    restrictedCards.forEach((card) => {
        if (lastCard === card) return false;
        lastCard = card;
    });

    return true;
}

export function getNumericModifier(value: number, isSetting?: boolean) {
    if (value === 0 && !isSetting) return "";
    return value < 0 ? value.toString() : `+${value}`;
}

export const numbersWithModifiers = ["BT12-092", "BT17-087", "BT13-095", "BT13-099", "EX2-007"];

export function arraysEqualUnordered(arr1: string[], arr2: string[]) {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort((a, b) => a.localeCompare(b));
    const sortedArr2 = [...arr2].sort((a, b) => a.localeCompare(b));
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const isTrue = (value: string): boolean => value === "true";
