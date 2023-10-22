import dataImage from '../assets/attribute_icons/data.png';
import virusImage from '../assets/attribute_icons/virus.png';
import vaccineImage from '../assets/attribute_icons/vaccine.png';
import freeImage from '../assets/attribute_icons/free.png';
import unknownImage from '../assets/attribute_icons/unknown.png';
import variableImage from '../assets/attribute_icons/variable.png';
import {CardType, CardTypeGame, CardTypeWithId} from "./types.ts";
import ancientIrismon from "../assets/profile_pictures/AncientIrismon.png";
import bearmon from "../assets/profile_pictures/Bearmon.png";
import belphemon from "../assets/profile_pictures/Belphemon.png";
import bloomLordmon from "../assets/profile_pictures/BloomLordmon.png";
import commandramon from "../assets/profile_pictures/Commandramon.png";
import darkKnightmonX from "../assets/profile_pictures/DarkKnightmonX.png";
import diablomon from "../assets/profile_pictures/Diablomon.png";
import guilmon from "../assets/profile_pictures/Guilmon.png";
import hexeblaumon from "../assets/profile_pictures/Hexeblaumon.png";
import impmon from "../assets/profile_pictures/Impmon.png";
import kaiserGreymon from "../assets/profile_pictures/KaiserGreymon.png";
import omegamon from "../assets/profile_pictures/Omegamon.png";
import sakuyamon from "../assets/profile_pictures/Sakuyamon.png";
import silphymon from "../assets/profile_pictures/Silphymon.png";
import solarmon from "../assets/profile_pictures/Solarmon.png";
import stingmon from "../assets/profile_pictures/Stingmon.png";
import superstarmon from "../assets/profile_pictures/Superstarmon.png";
import tyrannomon from "../assets/profile_pictures/Tyrannomon.png";
import vMon from "../assets/profile_pictures/V-mon.png";
import wereGarurumon from "../assets/profile_pictures/WereGarurumon.png";
import gammamon from "../assets/profile_pictures/Gammamon.png";
import justimon from "../assets/profile_pictures/Justimon.png";
import coronamon from "../assets/profile_pictures/Coronamon.png";
import hackmon from "../assets/profile_pictures/Hackmon.png";
import clearAgumon from "../assets/profile_pictures/ClearAgumon.png";
import terriermon from "../assets/profile_pictures/Terriermon.png";
import airdramon from "../assets/profile_pictures/Airdramon.png";
import tailmon from "../assets/profile_pictures/Tailmon.png";
import togemonX from "../assets/profile_pictures/TogemonX.png";
import wizardmonX from "../assets/profile_pictures/WizardmonX.png";
import placeholder from "../assets/profile_pictures/Placeholder.png";
import {
    playButtonClickSfx,
    playDrawCardSfx,
    playOpponentPlaceCardSfx,
    playRevealCardSfx,
    playSecurityRevealSfx, playShuffleDeckSfx,
    playSuspendSfx, playTrashCardSfx, playUnsuspendSfx
} from "./sound.ts";
import axios from "axios";
import {starterBeelzemon, starterGallantmon} from "./starterDecks.ts";

export function getBackgroundColor(color: string) {
    switch (color) {
        case 'Red':
            return "#b02626";
        case 'Yellow':
            return "#b0a325";
        case 'Green':
            return "#095E1C";
        case 'Blue':
            return "#085e8c";
        case 'Purple':
            return "#46136D";
        case 'Black':
            return "#070707";
        case 'White':
            return "#DBDBDB";
        case "default":
            return "rgba(0, 0, 0, 0)";
    }
}

export function getAttributeImage(attribute: string) {
    switch (attribute) {
        case 'Virus':
            return virusImage;
        case 'Data':
            return dataImage;
        case 'Vaccine':
            return vaccineImage;
        case 'Free':
            return freeImage;
        case 'Variable':
            return variableImage;
        case 'Unknown':
            return unknownImage;
        case 'default':
            return;
    }
}

export function getStrokeColor(hoverCard: CardType | null, selectedCard: CardType | null) {
    if (hoverCard) {
        switch (hoverCard.color) {
            case 'White':
                return "#070707";
            case 'Yellow':
                return "#070707";
            default:
                return "#C5C5C5";
        }
    }
    if (selectedCard) {
        switch (selectedCard.color) {
            case 'White':
                return "#070707";
            case 'Yellow':
                return "#070707";
            default:
                return "#C5C5C5";
        }
    }
    return "#C5C5C5";
}

export function profilePicture(avatarName: string) {
    switch (avatarName) {
        case "ava1":
            return ancientIrismon;
        case "ava2":
            return bearmon;
        case "ava3":
            return belphemon;
        case "ava4":
            return bloomLordmon;
        case "ava5":
            return commandramon;
        case "ava6":
            return darkKnightmonX;
        case "ava7":
            return diablomon;
        case "ava8":
            return guilmon;
        case "ava9":
            return hexeblaumon;
        case "ava10":
            return impmon;
        case "ava11":
            return kaiserGreymon;
        case "ava12":
            return omegamon;
        case "ava13":
            return sakuyamon;
        case "ava14":
            return silphymon;
        case "ava15":
            return solarmon;
        case "ava16":
            return stingmon;
        case "ava17":
            return superstarmon;
        case "ava18":
            return tyrannomon;
        case "ava19":
            return vMon;
        case "ava20":
            return wereGarurumon;
        case "ava21":
            return gammamon;
        case "ava22":
            return justimon;
        case "ava23":
            return coronamon;
        case "ava24":
            return hackmon;
        case "ava25":
            return clearAgumon;
        case "ava26":
            return terriermon;
        case "ava27":
            return airdramon;
        case "ava28":
            return tailmon;
        case "ava29":
            return togemonX;
        case "ava30":
            return wizardmonX;
        default:
            return placeholder;
    }
}

export function calculateCardRotation(handCardLength: number, index: number) {
    const middleIndex = Math.floor(handCardLength / 2);
    let value = ((index - middleIndex) / 2);
    if (handCardLength <= 6) value *= 2;
    if (handCardLength > 10) value = ((index - middleIndex) / 3.5);
    if (handCardLength > 15) value = ((index - middleIndex) / 4);
    if (handCardLength > 20) value = ((index - middleIndex) / 5.5);
    if (handCardLength > 25) value = ((index - middleIndex) / 8);
    return value * handCardLength + "deg";
}

export function calculateCardOffsetY(handCardLength: number, index: number) {
    if(handCardLength === 3 && index === 1) return "-5px";
    if (handCardLength <= 3) return "0px";

    const middleIndex = Math.floor(handCardLength / 2);
    const middleValue = 0;
    let endValue = handCardLength + 5 + (handCardLength / 3) * 2;
    if (handCardLength > 5) {
        if (index === 0 || index === handCardLength - 1) endValue += (handCardLength / 3) * 3.25;
        if (index === 1 || index === handCardLength - 2) endValue += (handCardLength / 3) * 1.9;
        if (index === 2 || index === handCardLength - 3) endValue += (handCardLength / 3) * 1.5;
        if (index === 3 || index === handCardLength - 4) endValue += (handCardLength / 3) * 1.25;
        if (index === 4 || index === handCardLength - 5) endValue += (handCardLength / 3) * 1.1;
    }
    const distanceToMiddle = Math.abs(index - middleIndex);
    let offset = ((middleValue + (endValue - middleValue) * (distanceToMiddle / (middleIndex - 1))) - handCardLength);
    if (index === middleIndex && handCardLength % 2 === 0) offset -= (2 + handCardLength / 6);
    return (index === middleIndex|| index === 0 && handCardLength == 6) ? offset + 10 - handCardLength/3 + handCardLength/10 + "px" : offset + "px";
}

export function calculateCardOffsetX(handCardLength: number, index: number) {
    if (handCardLength === 1) return "150px";
    if (handCardLength === 2) return (index * 200) / handCardLength + 80 + "px";
    if (handCardLength === 3) return (index * 300) / handCardLength + 50 + "px";
    if (handCardLength >= 4) return (index * 400) / handCardLength + "px";
}

export function topCardInfo(card: CardTypeGame, location:string, locationCards: CardTypeGame[]){
    const locationsWithInfo = ["myBreedingArea", "opponentBreedingArea",
        "myDigi1", "myDigi2", "myDigi3", "myDigi4", "myDigi5", "myDigi6", "myDigi7", "myDigi8", "myDigi9", "myDigi10",
        "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5", "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10"];
    if (!locationsWithInfo.find((l => l === location))) return undefined;

    let effectInfo = "Inherited effects: \n";
    locationCards.forEach((card, index) => {
        if (index === locationCards.length -1) return;
        if (card.soureeffect === null) return;
        effectInfo += "• " + card.soureeffect + "\n";
    });

    return card === locationCards[locationCards.length -1] ? effectInfo : undefined;
}

export function getOpponentSfx(command: string) {
    switch(command){
        case ("[REVEAL_SFX]"): {
            playRevealCardSfx();
            break;
        }
        case ("[SECURITY_REVEAL_SFX]"): {
            playSecurityRevealSfx();
            break;
        }
        case ("[PLACE_CARD_SFX]"): {
            playOpponentPlaceCardSfx();
            break;
        }
        case ("[DRAW_CARD_SFX]"): {
            playDrawCardSfx();
            break;
        }
        case ("[SUSPEND_CARD_SFX]"): {
            playSuspendSfx();
            break;
        }
        case ("[UNSUSPEND_CARD_SFX]"): {
            playUnsuspendSfx();
            break;
        }
        case ("[BUTTON_CLICK_SFX]"): {
            playButtonClickSfx();
            break;
        }
        case ("[TRASH_CARD_SFX]"): {
            playTrashCardSfx();
            break;
        }
        case ("[SHUFFLE_DECK_SFX]"): {
            playShuffleDeckSfx();
            break;
        }
    }
}

export function sortCards(deck: CardTypeWithId[]){
    const newDeck = [...deck];
    newDeck.sort(compareCardNumbers);
    newDeck.sort(compareCardLevels);
    newDeck.sort(compareCardTypes);
    return newDeck;
}

function compareCardNumbers(a: CardTypeWithId, b: CardTypeWithId){
    if (a.cardnumber < b.cardnumber) return -1;
    if (a.cardnumber > b.cardnumber) return 1;
    return 0;
}

function compareCardLevels(a: CardTypeWithId, b: CardTypeWithId){
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
        "Option": 1,
        "Tamer": 2,
        "Digimon": 3
    };
    const aTypeOrder = typeOrder[a.type];
    const bTypeOrder = typeOrder[b.type];

    if (aTypeOrder < bTypeOrder) return -1;
    if (aTypeOrder > bTypeOrder) return 1;

    return 0;
}

export function getCardSize(location: string) {
    switch (location) {
        case "myTrash":
            return "105px";
        case "mySecurity":
            return "105px";
        case "opponentTrash":
            return "105px";
        case "deck":
            return "102px";
        case "fetchedData":
            return "110px";
        case "myTamer":
            return "85px";
        default:
            return "95px";
    }
}

export function getConsecutiveDigimonIndex(card: CardTypeGame, locationCards: CardTypeGame[]): number {
    if (card.type !== "Digimon") return 0;
    const cardIndex = locationCards.findIndex((c) => c.id === card.id);
    let i = 1;
    for (let j = cardIndex - 1; j >= 0; j--) {
        if (locationCards[j].type === "Digimon") {
            i++;
        } else {
            break;
        }
    }
    return i;
}

export function getTamerCardIndex(card: CardTypeGame, locationCards: CardTypeGame[]): number {
    const cardIndex = locationCards.findIndex((c) => c.id === card.id);
    let count = 0;
    for (let i = 0; i < cardIndex; i++) {
        if (locationCards[i].type === "Tamer") {
            count++;
        }
    }
    return count;
}

export function convertForLog(location: string) {
    const locationMappings: Record<string, string> = {
        myHand: "Hand",
        myDeckField: "Deck",
        myEggDeck: "Egg-Deck",
        myTrash: "Trash",
        mySecurity: "Security",
        myTamer: "Tamers",
        myDelay: "Delay",
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
        myReveal: "Reveal",
    };
    return locationMappings[location] || location;
}

function saveStarterDeck(name:string, color: string, decklist: string[]){

    const deckToSave = {
        name: name,
        color: color,
        decklist: decklist,
        deckStatus: "INACTIVE"
    }

    axios
        .post("/api/profile/decks", deckToSave)
        .then((res) => res.data)
        .catch((error) => {
            console.error(error);
            throw error;
        });
}

export function addStarterDecks(){
    setTimeout(() => saveStarterDeck("[ADV. STARTER] Beelzemon","Purple", starterBeelzemon), 100);
    setTimeout(() => saveStarterDeck("[STARTER] Gallantmon","Red", starterGallantmon), 200);
}

export function mostFrequentColor(deckCards: CardTypeWithId[]){
    const colorOccurrences = {};

    for (const card of deckCards) {
        const color = card.color;
        // @ts-ignore
        if (colorOccurrences[color]) {
            // @ts-ignore
            colorOccurrences[color]++;
        } else {
            // @ts-ignore
            colorOccurrences[color] = 1;
        }
    }

    let mostFrequentColor = null;
    let maxOccurrences = 0;

    for (const color in colorOccurrences) {
        // @ts-ignore
        if (colorOccurrences[color] > maxOccurrences) {
            mostFrequentColor = color;
            // @ts-ignore
            maxOccurrences = colorOccurrences[color];
        }
    }

    return mostFrequentColor;
}
