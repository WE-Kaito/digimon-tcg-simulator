import Amon from '../assets/tokens/Amon.webp';
import Umon from '../assets/tokens/Umon.webp';
import Diaboromon from '../assets/tokens/Diaboromon.webp';
import KoHagurumon from '../assets/tokens/KoHagurumon.webp';
import Fujitsumon from '../assets/tokens/Fujitsumon.webp';
import Gyuukimon from '../assets/tokens/Gyuukimon.webp';
import HackmonToken from '../assets/tokens/tokenCard.jpg';
import {CardType} from "./types.ts";

const tokenEffect = (digimon: string): string => `•This card can be used as a [${digimon}] token.\n•Tokens can't be included in decks.\n•Tokens can't digivolve or be used as digivolution cards.\n•Tokens are removed from the game when they leave play.`;

export const gyuukimonToken: CardType = {
    imgUrl: Gyuukimon,
    uniqueCardNumber: "LM-018-TOKEN",
    cardNumber: "",
    color: ["Purple"],
    cardType: "Digimon",
    level: 5,
    playCost: 7,
    dp: 6000,
    attribute: "Virus",
    stage: "Ultimate",
    digiType: ["Dark Animal"],
    name: "Gyuukimon",
    mainEffect: tokenEffect("Gyuukimon"),
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const fujitsumonToken: CardType = {
    imgUrl: Fujitsumon,
    uniqueCardNumber: "EX5-058-TOKEN",
    cardNumber: "EX5-058",
    color: ["Purple"],
    cardType: "Digimon",
    dp: 3000,
    mainEffect: "[All Turns] This Digimon doesn't unsuspend.\n[On Deletion] Trash 1 card in your hand.\n"+ tokenEffect("Fujitsumon"),
    name: "Fujitsumon",
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const koHagurumonToken: CardType = {
    imgUrl: KoHagurumon,
    uniqueCardNumber: "BT16-052-TOKEN",
    cardNumber: "BT16-052",
    color: ["Black"],
    cardType: "Digimon",
    dp: 1000,
    mainEffect: "＜Blocker＞ ＜Decoy (Black)＞\n" + tokenEffect("KoHagurumon"),
    name: "KoHagurumon",
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const diaboromonToken: CardType = {
    imgUrl: Diaboromon,
    uniqueCardNumber: "DIABOROMON-TOKEN",
    cardNumber: "",
    color: ["White"],
    cardType: "Digimon",
    level: 6,
    playCost: 14,
    dp: 3000,
    attribute: "Unknown",
    stage: "Mega",
    digiType: ["Unidentified"],
    name: "Diaboromon",
    mainEffect: tokenEffect("Diaboromon"),
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const umonToken: CardType = {
    imgUrl: Umon,
    uniqueCardNumber: "BT14-018-Umon-TOKEN",
    cardNumber: "BT14-018",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Blocker＞\n" + tokenEffect("Umon of Blue Thunder"),
    name: "Umon of Blue Thunder",
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const amonToken: CardType = {
    imgUrl: Amon,
    uniqueCardNumber: "BT14-018-Amon-TOKEN",
    cardNumber: "BT14-018",
    color: ["Red"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Rush＞\n" + tokenEffect("Amon of Crimson Flame"),
    name: "Amon of Crimson Flame",
    restriction_en: "",
    restriction_jp: "",
    illustrator: "Template By SergioGranSol"
}

export const generalToken: CardType = {
    imgUrl: HackmonToken,
    uniqueCardNumber: "Token",
    cardNumber: "",
    cardType: "Digimon",
    color: ["Unknown"],
    attribute: "Unknown",
    name: "Token",
    illustrator: "",
    restriction_en: "",
    restriction_jp: "",
}

export const tokenCollection = [amonToken, umonToken, gyuukimonToken, fujitsumonToken, koHagurumonToken, diaboromonToken];

export function findTokenByName(name: string): CardType {
    switch (name) {
        case "Gyuukimon":
            return gyuukimonToken;
        case "Fujitsumon":
            return fujitsumonToken;
        case "KoHagurumon":
            return koHagurumonToken;
        case "Diaboromon":
            return diaboromonToken;
        case "Umon of Blue Thunder":
            return umonToken;
        case "Amon of Crimson Flame":
            return amonToken;
        default:
            return generalToken;
    }
}
