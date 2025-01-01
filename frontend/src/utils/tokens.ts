import Amon from '../assets/tokens/Amon.webp';
import Umon from '../assets/tokens/Umon.webp';
import Diaboromon from '../assets/tokens/Diaboromon.webp';
import KoHagurumon from '../assets/tokens/KoHagurumon.webp';
import Fujitsumon from '../assets/tokens/Fujitsumon.webp';
import Gyuukimon from '../assets/tokens/Gyuukimon.webp';
import HackmonToken from '../assets/tokens/tokenCard.jpg';
import VoleeUndZerdruecken from '../assets/tokens/VoleeUndZerdruecken.webp';
import Familiar from '../assets/tokens/Familiar.webp';
import PipeFox from '../assets/tokens/kuda-kitsune.webp';
import UkaNoMitama from '../assets/tokens/Uka-no-Mitama.webp';
import Rapidmon from '../assets/tokens/Rapidmon V-Pet.webp';
import WarGrowlmon from '../assets/tokens/WarGrowlmon V-Pet.webp';
import Taomon from '../assets/tokens/Taomon V-Pet.webp';
import {CardType} from "./types.ts";

const tokenEffect = (digimon: string): string => `•This card can be used as a [${digimon}] token.\n•Tokens can't be included in decks.\n•Tokens can't digivolve or be used as digivolution cards.\n•Tokens are removed from the game when they leave play.`;

const emptyRestrictions = {
    chinese: "",
    english: "",
    japanese: "",
    korean: "",
}

const GYUUKIMON_TOKEN_NAME = "Gyuukimon";
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
    name: GYUUKIMON_TOKEN_NAME,
    mainEffect: tokenEffect(GYUUKIMON_TOKEN_NAME),
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const FUJITSUMON_TOKEN_NAME = "Fujitsumon";
export const fujitsumonToken: CardType = {
    imgUrl: Fujitsumon,
    uniqueCardNumber: "EX5-058-TOKEN",
    cardNumber: "EX5-058-TOKEN",
    color: ["Purple"],
    cardType: "Digimon",
    dp: 3000,
    mainEffect: "[All Turns] This Digimon doesn't unsuspend.\n[On Deletion] Trash 1 card in your hand.\n"+ tokenEffect(FUJITSUMON_TOKEN_NAME),
    name: FUJITSUMON_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const KO_HAGURUMON_TOKEN_NAME = "KoHagurumon";
export const koHagurumonToken: CardType = {
    imgUrl: KoHagurumon,
    uniqueCardNumber: "BT16-052-TOKEN",
    cardNumber: "BT16-052-TOKEN",
    color: ["Black"],
    cardType: "Digimon",
    dp: 1000,
    mainEffect: "＜Blocker＞ ＜Decoy (Black)＞\n" + tokenEffect(KO_HAGURUMON_TOKEN_NAME),
    name: KO_HAGURUMON_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const DIABOROMON_TOKEN_NAME = "Diaboromon";
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
    name: DIABOROMON_TOKEN_NAME,
    mainEffect: tokenEffect(DIABOROMON_TOKEN_NAME),
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const UMUMON_OF_BLUE_THUNDER_TOKEN_NAME = "Umon of Blue Thunder";
export const umonToken: CardType = {
    imgUrl: Umon,
    uniqueCardNumber: "BT14-018-Umon-TOKEN",
    cardNumber: "BT14-018-TOKEN",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Blocker＞\n" + tokenEffect(UMUMON_OF_BLUE_THUNDER_TOKEN_NAME),
    name: UMUMON_OF_BLUE_THUNDER_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const AMON_OF_CRIMSON_FLAME_TOKEN_NAME = "Amon of Crimson Flame";
export const amonToken: CardType = {
    imgUrl: Amon,
    uniqueCardNumber: "BT14-018-Amon-TOKEN",
    cardNumber: "BT14-018-TOKEN",
    color: ["Red"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Rush＞\n" + tokenEffect(AMON_OF_CRIMSON_FLAME_TOKEN_NAME),
    name: AMON_OF_CRIMSON_FLAME_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const VOLEE_UND_ZERDRUECKEN_TOKEN_NAME = "Volée & Zerdrücken";
export const voleeToken: CardType = {
    imgUrl: VoleeUndZerdruecken,
    uniqueCardNumber: "EX7-058-TOKEN",
    cardNumber: "EX7-058-TOKEN",
    color: ["Purple"],
    cardType: "Digimon",
    dp: 5000,
    level: 4,
    mainEffect: "＜Blocker＞ ＜Retaliation＞\n" + tokenEffect(VOLEE_UND_ZERDRUECKEN_TOKEN_NAME),
    name: VOLEE_UND_ZERDRUECKEN_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const PIPE_FOX_TOKEN_NAME = "Pipe Fox";
export const pipeFoxToken: CardType = {
    imgUrl: PipeFox,
    uniqueCardNumber: "EX7-058-TOKEN",
    cardNumber: "EX7-058-TOKEN",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: "＜Blocker＞\n" + tokenEffect(PIPE_FOX_TOKEN_NAME),
    name: PIPE_FOX_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const UKA_NO_MITAMA_TOKEN_NAME = "Uka-no-Mitama";
export const ukaNoMitamaToken: CardType = {
    imgUrl: UkaNoMitama,
    uniqueCardNumber: "EX8-037-TOKEN",
    cardNumber: "EX8-037-TOKEN",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 9000,
    mainEffect: "＜Rush＞\n" + tokenEffect(UKA_NO_MITAMA_TOKEN_NAME),
    name: UKA_NO_MITAMA_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const RAPIDMON_TOKEN_NAME = "Rapidmon";
export const rapidmonToken: CardType = {
    imgUrl: Rapidmon,
    uniqueCardNumber: "BT19-091-Rapidmon-TOKEN",
    cardNumber: "BT19-091-TOKEN",
    color: ["Green"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect(RAPIDMON_TOKEN_NAME),
    name: RAPIDMON_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const WAR_GROWLMON_TOKEN_NAME = "WarGrowlmon";
export const warGrowlmonToken: CardType = {
    imgUrl: WarGrowlmon,
    uniqueCardNumber: "BT19-091-WarGrowlmon-TOKEN",
    cardNumber: "BT19-091-TOKEN",
    color: ["Red"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect(WAR_GROWLMON_TOKEN_NAME),
    name: WAR_GROWLMON_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const TAOMON_TOKEN_NAME = "Taomon";
export const taomonToken: CardType = {
    imgUrl: Taomon,
    uniqueCardNumber: "BT19-091-Taomon-TOKEN",
    cardNumber: "BT19-091-TOKEN",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 6000,
    mainEffect: tokenEffect(TAOMON_TOKEN_NAME),
    name: TAOMON_TOKEN_NAME,
    restrictions: emptyRestrictions,
    illustrator: "Template By SergioGranSol"
}

const FAMILIAR_TOKEN_NAME = "Familiar";
export const familiarToken: CardType = {
    imgUrl: Familiar,
    uniqueCardNumber: "Familiar-TOKEN",
    cardNumber: "EX7-030- / ST19-12-TOKEN",
    color: ["Yellow"],
    cardType: "Digimon",
    dp: 3000,
    mainEffect: "＜On Deletion＞ 1 of your opponent's Digimon gets -3000 DP for the turn.\n" + tokenEffect(FAMILIAR_TOKEN_NAME),
    name: FAMILIAR_TOKEN_NAME,
    restrictions: emptyRestrictions,
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
    restrictions: emptyRestrictions,
    illustrator: "",
}

export const tokenCollection = [
    amonToken,
    diaboromonToken,
    familiarToken,
    fujitsumonToken,
    gyuukimonToken,
    koHagurumonToken,
    pipeFoxToken,
    rapidmonToken,
    taomonToken,
    ukaNoMitamaToken,
    umonToken,
    voleeToken,
    warGrowlmonToken
];

export const findTokenByName = (name: string): CardType => tokenCollection.find(token => token.name === name) ?? generalToken;
