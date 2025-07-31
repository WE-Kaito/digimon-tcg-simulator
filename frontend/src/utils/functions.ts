import cardBack from "../assets/cardBack.jpg";
import digimonImage from "../assets/cardtype_icons/gammamon.png";
import optionImage from "../assets/cardtype_icons/option.png";
import tamerImage from "../assets/cardtype_icons/tamer.png";
import eggImage from "../assets/cardtype_icons/egg.png";

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
    myDigi14: "BA 14",
    myDigi15: "BA 15",
    myDigi16: "BA 16",
    myDigi17: "Tamer 1",
    myDigi18: "Tamer 2",
    myDigi19: "Tamer 3",
    myDigi20: "Tamer 4",
    myDigi21: "Tamer 5",
    myLink1: "Link 1",
    myLink2: "Link 2",
    myLink3: "Link 3",
    myLink4: "Link 4",
    myLink5: "Link 5",
    myLink6: "Link 6",
    myLink7: "Link 7",
    myLink8: "Link 8",
    myLink9: "Link 9",
    myLink10: "Link 10",
    myLink11: "Link 11",
    myLink12: "Link 12",
    myLink13: "Link 13",
    myLink14: "Link 14",
    myLink15: "Link 15",
    myLink16: "Link 16",
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
    opponentDigi14: "BA 14",
    opponentDigi15: "BA 15",
    opponentDigi16: "BA 16",
    opponentDigi17: "Tamer 1",
    opponentDigi18: "Tamer 2",
    opponentDigi19: "Tamer 3",
    opponentDigi20: "Tamer 4",
    opponentDigi21: "Tamer 5",
    opponentLink1: "Link 1",
    opponentLink2: "Link 2",
    opponentLink3: "Link 3",
    opponentLink4: "Link 4",
    opponentLink5: "Link 5",
    opponentLink6: "Link 6",
    opponentLink7: "Link 7",
    opponentLink8: "Link 8",
    opponentLink9: "Link 9",
    opponentLink10: "Link 10",
    opponentLink11: "Link 11",
    opponentLink12: "Link 12",
    opponentLink13: "Link 13",
    opponentLink14: "Link 14",
    opponentLink15: "Link 15",
    opponentLink16: "Link 16",
    opponentReveal: "Reveal",
};

export function convertForLog(location: string) {
    return locationMappings[location] || location;
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

export function getNumericModifier(value: number, isSetting?: boolean) {
    if (value === 0 && !isSetting) return "";
    return value < 0 ? value.toString() : `+${value}`;
}

export const numbersWithModifiers = ["BT12-092", "BT17-087", "BT13-095", "BT13-099", "EX2-007", "BT21-086"];
