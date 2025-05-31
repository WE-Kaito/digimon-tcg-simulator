import { Picture } from "./types.ts";
import koromon from "../assets/sleeves/ST1_01_KOROMON.png";
import tsunomon from "../assets/sleeves/BT6_006_TSUNOMON.png";
import agumon from "../assets/sleeves/BT1_010_AGUMON.png";
import gabumon from "../assets/sleeves/BT2_069_GABUMON.png";
import tanemon from "../assets/sleeves/BT11_004_TANEMON.png";
import rosemon from "../assets/sleeves/BT1_082_ROSEMON.png";
import gaomon from "../assets/sleeves/BT4_021_GAOMON.png";
import tapirmon from "../assets/sleeves/BT2_070_TAPIRMON.png";
import seadramon from "../assets/sleeves/BT2_024_SEADRAMON.png";
import upamon from "../assets/sleeves/BT1_003_UPAMON.png";
import boltmon from "../assets/sleeves/BT3_089_BOLTMON.png";
import beelstarmon from "../assets/sleeves/BT6_112_BEELSTARMON.png";
import grumblemon from "../assets/sleeves/BT7_060_GRUMBLEMON.png";
import impmon from "../assets/sleeves/ST14_02_IMPMON.png";
import vamdemon from "../assets/sleeves/BT8_080_VAMDEMON.png";
import wizardmon from "../assets/sleeves/P_077_WIZARDMON.png";
import tokomon from "../assets/sleeves/BT11_003_TOKOMON.png";
import tsukaimon from "../assets/sleeves/BT1_045_TSUKAIMON.png";
import tyrannomon from "../assets/sleeves/BT11_052_TYRANNOMON.png";
import shinegreymon from "../assets/sleeves/BT12_043_SHINEGREYMON.png";
import yasyamon from "../assets/sleeves/BT12_051_YASYAMON.png";
import skillmammothmon from "../assets/sleeves/ST16_14_SKULLMAMMOTHMON.png";
import coronamon from "../assets/sleeves/EX5_007_CORONAMON.png";
import lunamon from "../assets/sleeves/EX5_016_LUNAMON.png";
import gammamon from "../assets/sleeves/P_058_GAMMAMON.png";
import jellymon from "../assets/sleeves/BT9_021_JELLYMON.png";
import bosamon from "../assets/sleeves/RB1_003_BOSAMON.png";
import blacktailmonuver from "../assets/sleeves/RB1_028_BLACKTAILMONUVER.png";
import lopmon from "../assets/sleeves/ST10_03_LOPMON.png";
import terriermon from "../assets/sleeves/BT8_046_TERRIERMON.png";
import angewomon from "../assets/sleeves/EX3_034_ANGEWOMON.png";
import ladydevimon from "../assets/sleeves/BT3_088_LADYDEVIMON.png";
import astamon from "../assets/sleeves/BT13_084_ASTAMON.png";
import kokuwamon from "../assets/sleeves/BT10_045_KOKUWAMON.png";
import penguinmon from "../assets/sleeves/BT11_024_PENGUINMON.png";
import angoramon from "../assets/sleeves/RB1_020_ANGORAMON.png";
import spadamon from "../assets/sleeves/BT10_059_SPADAMON.png";
import commandramon from "../assets/sleeves/BT4_063_COMMANDRAMON.png";
import veemon from "../assets/sleeves/BT2_021_VEEMON.png";
import guilmon from "../assets/sleeves/EX3_056_GUILMON.png";
import renamon from "../assets/sleeves/BT5_036_RENAMON.png";
import machinedramon from "../assets/sleeves/BT2_066_MACHINEDRAMON.png";
import monzaemon from "../assets/sleeves/BT1_038_MONZAEMON.png";
import leviamon from "../assets/sleeves/EX5_063_LEVIAMON.png";
import numemon from "../assets/sleeves/RB1_017_NUMEMON.png";
import pulsemon from "../assets/sleeves/P_028_PULSEMON.png";
import loogamon from "../assets/sleeves/BT14_071_LOOGAMON.png";
import dorumon from "../assets/sleeves/BT13_063_DORUMON.png";
import ryudamon from "../assets/sleeves/BT15_056_RYUDAMON.png";
import kurisarimon from "../assets/sleeves/EX6_039_KURISARIMON.png";
import wormmon from "../assets/sleeves/BT12_047_WORMMON.png";
import hawkmon from "../assets/sleeves/BT3_009_HAWKMON.png";
import armadillomon from "../assets/sleeves/BT3_032_ARMADILLOMON.png";
import plesiomon from "../assets/sleeves/EX3_023_PLESIOMON.png";
import tsukaimon2 from "../assets/sleeves/EX6_045_TSUKAIMON.png";
import sukamon from "../assets/sleeves/BT11_040_SUKAMON.png";
import pteromon from "../assets/sleeves/P_131_PTEROMON.png";
import muchomon from "../assets/sleeves/ST18_05_MUCHOMON.png";
import malomyotismon from "../assets/sleeves/BT3_092_MALOMYOTISMON.png";
import meramon from "../assets/sleeves/BT5_011_MERAMON.png";
import labramon from "../assets/sleeves/BT17_021_LABRAMON.png";
import mervamon from "../assets/sleeves/BT11_086_MERVAMON_7D6.png";
import shoemon from "../assets/sleeves/ST19_03_SHOEMON.png";
import funbeemonSrc from "../assets/sleeves/BT18_044_FUNBEEMON.png";
import medievalGallantmonSrc from "../assets/sleeves/EX8_074_MEDIEVALGALLANTMON.png";
import otamamonSrc from "../assets/sleeves/EX7_015_OTAMAMON.png";
import lilithmonSrc from "../assets/sleeves/EX6_057_LILITHMON.png";
import gracenovamonSrc from "../assets/sleeves/EX5_073_GRACENOVAMON.png";
import dobemonSrc from "../assets/sleeves/BT4_082_DOBERMON.png";

import defaultBlack from "../assets/sleeves/cardBackBlack.jpg";
import defaultWhite from "../assets/sleeves/cardBackWhite.jpg";
import defaultRed from "../assets/sleeves/cardBackRed.jpg";
import defaultBlue from "../assets/sleeves/cardBackBlue.jpg";
import defaultGreen from "../assets/sleeves/cardBackGreen.jpg";
import defaultYellow from "../assets/sleeves/cardBackYellow.jpg";
import defaultPurple from "../assets/sleeves/cardBackPurple.jpg";
import rainbow from "../assets/sleeves/RAINBOW.png";

import cardBack from "../assets/cardBack.jpg";

export const sleeves: Picture[] = [
    { name: "Rainbow", imagePath: rainbow, artist: "StargazerVinny" },
    { name: "Default Black", imagePath: defaultBlack, artist: "" },
    { name: "Default White", imagePath: defaultWhite, artist: "" },
    { name: "Default Red", imagePath: defaultRed, artist: "" },
    { name: "Default Blue", imagePath: defaultBlue, artist: "" },
    { name: "Default Green", imagePath: defaultGreen, artist: "" },
    { name: "Default Yellow", imagePath: defaultYellow, artist: "" },
    { name: "Default Purple", imagePath: defaultPurple, artist: "" },
    { name: "Koromon", imagePath: koromon, artist: "Drak" },
    { name: "Tsunomon", imagePath: tsunomon, artist: "Drak" },
    { name: "Agumon", imagePath: agumon, artist: "Drak" },
    { name: "Gabumon", imagePath: gabumon, artist: "Drak" },
    { name: "Tanemon", imagePath: tanemon, artist: "Drak" },
    { name: "Rosemon", imagePath: rosemon, artist: "Drak" },
    { name: "Gaomon", imagePath: gaomon, artist: "Drak" },
    { name: "Tapirmon", imagePath: tapirmon, artist: "Drak" },
    { name: "Seadramon", imagePath: seadramon, artist: "Drak" },
    { name: "Upamon", imagePath: upamon, artist: "Drak" },
    { name: "Boltmon", imagePath: boltmon, artist: "Drak" },
    { name: "Beelstarmon", imagePath: beelstarmon, artist: "Drak" },
    { name: "Grumblemon", imagePath: grumblemon, artist: "Drak" },
    { name: "Impmon", imagePath: impmon, artist: "Drak" },
    { name: "Vamdemon", imagePath: vamdemon, artist: "Drak" },
    { name: "Wizardmon", imagePath: wizardmon, artist: "Drak" },
    { name: "Tokomon", imagePath: tokomon, artist: "Drak" },
    { name: "Tsukaimon", imagePath: tsukaimon, artist: "Drak" },
    { name: "Tyrannomon", imagePath: tyrannomon, artist: "Drak" },
    { name: "Shinegreymon", imagePath: shinegreymon, artist: "Drak" },
    { name: "Yasyamon", imagePath: yasyamon, artist: "Drak" },
    { name: "Skullmammothmon", imagePath: skillmammothmon, artist: "Drak" },
    { name: "Coronamon", imagePath: coronamon, artist: "Drak" },
    { name: "Lunamon", imagePath: lunamon, artist: "Drak" },
    { name: "Gammamon", imagePath: gammamon, artist: "Drak" },
    { name: "Jellymon", imagePath: jellymon, artist: "Drak" },
    { name: "Bosamon", imagePath: bosamon, artist: "Drak" },
    { name: "Blacktailmonuver", imagePath: blacktailmonuver, artist: "Drak" },
    { name: "Lopmon", imagePath: lopmon, artist: "Drak" },
    { name: "Terriermon", imagePath: terriermon, artist: "Drak" },
    { name: "Angewomon", imagePath: angewomon, artist: "Drak" },
    { name: "Ladydevimon", imagePath: ladydevimon, artist: "Drak" },
    { name: "Astamon", imagePath: astamon, artist: "Drak" },
    { name: "Kokuwamon", imagePath: kokuwamon, artist: "Drak" },
    { name: "Penguinmon", imagePath: penguinmon, artist: "Drak" },
    { name: "Angoramon", imagePath: angoramon, artist: "Drak" },
    { name: "Spadamon", imagePath: spadamon, artist: "Drak" },
    { name: "Commandramon", imagePath: commandramon, artist: "Drak" },
    { name: "Veemon", imagePath: veemon, artist: "Drak" },
    { name: "Guilmon", imagePath: guilmon, artist: "Drak" },
    { name: "Renamon", imagePath: renamon, artist: "Drak" },
    { name: "Machinedramon", imagePath: machinedramon, artist: "Drak" },
    { name: "Monzaemon", imagePath: monzaemon, artist: "Drak" },
    { name: "Leviamon", imagePath: leviamon, artist: "Drak" },
    { name: "Numemon", imagePath: numemon, artist: "Drak" },
    { name: "Pulsemon", imagePath: pulsemon, artist: "Drak" },
    { name: "Loogamon", imagePath: loogamon, artist: "Drak" },
    { name: "Dorumon", imagePath: dorumon, artist: "Drak" },
    { name: "Ryudamon", imagePath: ryudamon, artist: "Drak" },
    { name: "Kurisarimon", imagePath: kurisarimon, artist: "Drak" },
    { name: "Wormmon", imagePath: wormmon, artist: "Drak" },
    { name: "Hawkmon", imagePath: hawkmon, artist: "Drak" },
    { name: "Armadillomon", imagePath: armadillomon, artist: "Drak" },
    { name: "Plesiomon", imagePath: plesiomon, artist: "Drak" },
    { name: "Tsukaimon 2", imagePath: tsukaimon2, artist: "Drak" },
    { name: "Sukamon", imagePath: sukamon, artist: "Drak" },
    { name: "Pteromon", imagePath: pteromon, artist: "Drak" },
    { name: "Muchomon", imagePath: muchomon, artist: "Drak" },
    { name: "MaloMyotismon", imagePath: malomyotismon, artist: "Drak" },
    { name: "Shoemon", imagePath: shoemon, artist: "Drak" },
    { name: "Meramon", imagePath: meramon, artist: "Drak" },
    { name: "Labramon", imagePath: labramon, artist: "Drak" },
    { name: "Mervamon", imagePath: mervamon, artist: "Drak" },
    { name: "Funbeemon", imagePath: funbeemonSrc, artist: "Drak" },
    { name: "MedievalGallantmon", imagePath: medievalGallantmonSrc, artist: "Drak" },
    { name: "Otamamon", imagePath: otamamonSrc, artist: "Drak" },
    { name: "Lilithmon", imagePath: lilithmonSrc, artist: "Drak" },
    { name: "Gracenovamon", imagePath: gracenovamonSrc, artist: "Drak" },
    { name: "Dobermon", imagePath: dobemonSrc, artist: "Drak" },
];

export function getSleeve(sleeveName: string): string {
    return sleeves.find((s) => s.name === sleeveName)?.imagePath ?? cardBack;
}
