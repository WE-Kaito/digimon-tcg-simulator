import { CardType, CardTypeGame } from "./types.ts";
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

export function topCardInfo(locationCards: CardTypeGame[]) {
    if (locationCards.length <= 1) return "";
    const effectInfo = [""];
    locationCards.forEach((card, index) => {
        if (index === locationCards.length - 1 || !card.inheritedEffect || !card.isFaceUp) return;
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

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) =>
    ((event.target as HTMLImageElement).src = cardBack);

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

export function getNumericModifier(value: number, isSetting?: boolean) {
    if (value === 0 && !isSetting) return "";
    return value < 0 ? value.toString() : `+${value}`;
}

export const numbersWithModifiers = ["BT12-092", "BT17-087", "BT13-095", "BT13-099", "EX2-007", "BT21-086"];

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
