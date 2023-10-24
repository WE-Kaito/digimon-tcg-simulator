import koromon from "../assets/sleeves/ST1_01_KOROMON.png";
import tsunomon from "../assets/sleeves/BT6_006_TSUNOMON.png";
import agumon from "../assets/sleeves/BT1_010_AGUMON.png";
import gabumon from "../assets/sleeves/BT2_069_GABUMON.png";
import tanemon from "../assets/sleeves/BT11_004_TANEMON.png";
import togemon from "../assets/sleeves/BT1_074_TOGEMON.png";
import rosemon from "../assets/sleeves/BT1_082_ROSEMON.png";
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
import cardBack from "../assets/cardBack.jpg";
import {Picture} from "./types.ts";

export const sleeves: Picture[] = [
    {name: "Default", imagePath: cardBack},
    {name: "Koromon", imagePath: koromon},
    {name: "Tsunomon", imagePath: tsunomon},
    {name: "Agumon", imagePath: agumon},
    {name: "Gabumon", imagePath: gabumon},
    {name: "Tanemon", imagePath: tanemon},
    {name: "Togemon", imagePath: togemon},
    {name: "Rosemon", imagePath: rosemon},
    {name: "Seadramon", imagePath: seadramon},
    {name: "Upamon", imagePath: upamon},
    {name: "Tapirmon", imagePath: tapirmon},
    {name: "Boltmon", imagePath: boltmon},
    {name: "Beelstarmon", imagePath: beelstarmon},
    {name: "Grumblemon", imagePath: grumblemon},
    {name: "Impmon", imagePath: impmon},
    {name: "Vamdemon", imagePath: vamdemon},
    {name: "Wizardmon", imagePath: wizardmon},
    {name: "Tokomon", imagePath: tokomon},
    {name: "Tsukaimon", imagePath: tsukaimon},
    {name: "Tyrannomon", imagePath: tyrannomon},
    {name: "Shinegreymon", imagePath: shinegreymon},
    {name: "Yasyamon", imagePath: yasyamon},
    {name: "Skillmammothmon", imagePath: skillmammothmon},
    {name: "Coronamon", imagePath: coronamon},
    {name: "Lunamon", imagePath: lunamon},
    {name: "Gammamon", imagePath: gammamon},
    {name: "Jellymon", imagePath: jellymon},
    {name: "Bosamon", imagePath: bosamon},
    {name: "Blacktailmonuver", imagePath: blacktailmonuver},
    {name: "Lopmon", imagePath: lopmon},
    {name: "Terriermon", imagePath: terriermon},
    {name: "Angewomon", imagePath: angewomon},
    {name: "Ladydevimon", imagePath: ladydevimon},
];

export function getSleeve(sleeveName: string): string {
    return sleeves.find(s => s.name === sleeveName)?.imagePath ?? cardBack;
}
