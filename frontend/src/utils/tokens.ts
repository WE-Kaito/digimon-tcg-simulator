import Amon from "../assets/tokens/Amon.webp";
import Umon from "../assets/tokens/Umon.webp";
import Diaboromon from "../assets/tokens/Diaboromon.webp";
import KoHagurumon from "../assets/tokens/KoHagurumon.webp";
import Fujitsumon from "../assets/tokens/Fujitsumon.webp";
import Gyuukimon from "../assets/tokens/Gyuukimon.webp";
import HackmonToken from "../assets/tokens/tokenCard.jpg";
import VoleeUndZerdruecken from "../assets/tokens/VoleeUndZerdruecken.webp";
import Rapidmon from "../assets/tokens/Rapidmon.png";
import WarGrowlmon from "../assets/tokens/WarGrowlmon.png";
import Taomon from "../assets/tokens/Taomon.png";
import Familiar from "../assets/tokens/Familiar_Token.webp";
import PipeFox from "../assets/tokens/Fox_Token.webp";
import UkaNoMitama from "../assets/tokens/Mitama_Token.webp";
import AthoRenePor from "../assets/tokens/ARP_Token.webp";
import Petrification from "../assets/tokens/Petrification_Token.webp";

import { CardType } from "./types.ts";

const tokenEffect = (digimon: string): string =>
    `•This card can be used as a [${digimon}] token.\n•Tokens can't be included in decks.\n•Tokens can't digivolve or be used as digivolution cards.\n•Tokens are removed from the game when they leave play.`;

const emptyRestrictions = {
    chinese: "",
    english: "",
    japanese: "",
    korean: "",
};

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
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const fujitsumonToken: CardType = {
    imgUrl: Fujitsumon,
    uniqueCardNumber: "EX5-058-TOKEN",
    cardNumber: "",
    color: ["Purple"],
    cardType: "Digimon",
    dp: 3000,
    mainEffect:
        "[All Turns] This Digimon doesn't unsuspend.\n[On Deletion] Trash 1 card in your hand.\n" +
        tokenEffect("Fujitsumon"),
    name: "Fujitsumon",
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const koHagurumonToken: CardType = {
    imgUrl: KoHagurumon,
    uniqueCardNumber: "BT16-052-TOKEN",
    cardNumber: "",
    color: ["Black"],
    cardType: "Digimon",
    dp: 1000,
    mainEffect: "＜Blocker＞ ＜Decoy (Black)＞\n" + tokenEffect("KoHagurumon"),
    name: "KoHagurumon",
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

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
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const umonToken: CardType = {
    imgUrl: Umon,
    uniqueCardNumber: "BT14-018-Umon-TOKEN",
    cardNumber: "",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Blocker＞\n" + tokenEffect("Umon of Blue Thunder"),
    name: "Umon of Blue Thunder",
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const amonToken: CardType = {
    imgUrl: Amon,
    uniqueCardNumber: "BT14-018-Amon-TOKEN",
    cardNumber: "",
    color: ["Red"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Rush＞\n" + tokenEffect("Amon of Crimson Flame"),
    name: "Amon of Crimson Flame",
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const voleeToken: CardType = {
    imgUrl: VoleeUndZerdruecken,
    uniqueCardNumber: "EX7-058-TOKEN",
    cardNumber: "",
    color: ["Purple"],
    cardType: "Digimon",
    dp: 5000,
    level: 4,
    mainEffect: "＜Blocker＞ ＜Retaliation＞\n" + tokenEffect("Volée & Zerdrücken"),
    name: "Volée & Zerdrücken",
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol",
};

export const familiarToken: CardType = {
    imgUrl: Familiar,
    uniqueCardNumber: "Familiar-TOKEN",
    cardNumber: "",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 3000,
    mainEffect: "[On Deletion] 1 of your opponent's Digimon gets -3000 DP for the turn.\n" + tokenEffect("Familiar"),
    name: "Familiar",
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};

export const pipeFoxToken: CardType = {
    imgUrl: PipeFox,
    uniqueCardNumber: "PipeFox-TOKEN",
    cardNumber: "",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    name: "Pipe Fox",
    mainEffect: "＜Blocker＞.\n" + tokenEffect("Pipe Fox"),
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};
export const ukaNoMitamaToken: CardType = {
    imgUrl: UkaNoMitama,
    uniqueCardNumber: "UkanoMitama-TOKEN",
    cardNumber: "",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 9000,
    name: "Uka no Mitama",
    mainEffect: "＜Rush＞.\n" + tokenEffect("Uka no Mitama"),
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};
export const athoreneporToken: CardType = {
    imgUrl: AthoRenePor,
    uniqueCardNumber: "AthoRenePor-TOKEN",
    cardNumber: "",
    color: ["White"],
    cardType: "Digimon",
    dp: 6000,
    name: "Atho, Rene & Por",
    mainEffect: "＜Reboot＞ ＜Blocker＞ ＜Decoy (Red/Black)＞.\n" + tokenEffect("Atho, Rene & Por"),
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};
export const petrificationToken: CardType = {
    imgUrl: Petrification,
    uniqueCardNumber: "AthoRenePor-TOKEN",
    cardNumber: "",
    color: ["White"],
    cardType: "Digimon",
    dp: 3000,
    name: "Petrification",
    mainEffect:
        "[On Deletion] Trash your top security card.\n[Your Turn] This Digimon can't suspend.\n" +
        tokenEffect("Petrification"),
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};

export const rapidmonToken: CardType = {
    imgUrl: Rapidmon,
    uniqueCardNumber: "BT19-091-Rapidmon-TOKEN",
    cardNumber: "",
    color: ["Green"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect("Rapidmon"),
    name: "Rapidmon",
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};

export const warGrowlmonToken: CardType = {
    imgUrl: WarGrowlmon,
    uniqueCardNumber: "BT19-091-WarGrowlmon-TOKEN",
    cardNumber: "",
    color: ["Red"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect("WarGrowlmon"),
    name: "WarGrowlmon",
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};

export const taomonToken: CardType = {
    imgUrl: Taomon,
    uniqueCardNumber: "BT19-091-Taomon-TOKEN",
    cardNumber: "",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect("Taomon"),
    name: "Taomon",
    restrictions: emptyRestrictions,
    illustrator: "765Nanami",
};

export const generalToken: CardType = {
    imgUrl: HackmonToken,
    uniqueCardNumber: "TOKEN",
    cardNumber: "",
    cardType: "Digimon",
    color: ["Unknown"],
    attribute: "Unknown",
    name: "Token",
    restrictions: emptyRestrictions,
    illustrator: "",
};

export const tokenCollection = [
    amonToken,
    athoreneporToken,
    diaboromonToken,
    familiarToken,
    fujitsumonToken,
    gyuukimonToken,
    koHagurumonToken,
    petrificationToken,
    pipeFoxToken,
    rapidmonToken,
    taomonToken,
    ukaNoMitamaToken,
    umonToken,
    voleeToken,
    warGrowlmonToken,
];

export const findTokenByName = (name: string): CardType =>
    tokenCollection.find((token) => token.name === name) ?? generalToken;
