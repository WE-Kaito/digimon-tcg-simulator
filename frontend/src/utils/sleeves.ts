import {Picture} from "./types.ts";

const baseUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/sleeves/";
const cardBackUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/cardBack.jpg";

export const sleeves: Picture[] = [
    {name: "Default", imagePath: cardBackUrl, artist: "Bandai"},
    {name: "Koromon", imagePath: buildUrl("ST1_01_KOROMON"), artist: "Drak"},
    {name: "Tsunomon", imagePath: buildUrl("BT6_006_TSUNOMON"), artist: "Drak"},
    {name: "Agumon", imagePath: buildUrl("BT1_010_AGUMON"), artist: "Drak"},
    {name: "Gabumon", imagePath: buildUrl("BT2_069_GABUMON"), artist: "Drak"},
    {name: "Tanemon", imagePath: buildUrl("BT11_004_TANEMON"), artist: "Drak"},
    {name: "Rosemon", imagePath: buildUrl("BT1_082_ROSEMON"), artist: "Drak"},
    {name: "Seadramon", imagePath: buildUrl("BT4_021_GAOMON"), artist: "Drak"},
    {name: "Upamon", imagePath: buildUrl("BT2_070_TAPIRMON"), artist: "Drak"},
    {name: "Gaomon", imagePath: buildUrl("BT2_024_SEADRAMON"), artist: "Drak"},
    {name: "Tapirmon", imagePath: buildUrl("BT1_003_UPAMON"), artist: "Drak"},
    {name: "Boltmon", imagePath: buildUrl("BT3_089_BOLTMON"), artist: "Drak"},
    {name: "Beelstarmon", imagePath: buildUrl("BT6_112_BEELSTARMON"), artist: "Drak"},
    {name: "Grumblemon", imagePath: buildUrl("BT7_060_GRUMBLEMON"), artist: "Drak"},
    {name: "Impmon", imagePath: buildUrl("ST14_02_IMPMON"), artist: "Drak"},
    {name: "Vamdemon", imagePath: buildUrl("BT8_080_VAMDEMON"), artist: "Drak"},
    {name: "Wizardmon", imagePath: buildUrl("P_077_WIZARDMON"), artist: "Drak"},
    {name: "Tokomon", imagePath: buildUrl("BT11_003_TOKOMON"), artist: "Drak"},
    {name: "Tsukaimon", imagePath: buildUrl("BT1_045_TSUKAIMON"), artist: "Drak"},
    {name: "Tyrannomon", imagePath: buildUrl("BT11_052_TYRANNOMON"), artist: "Drak"},
    {name: "Shinegreymon", imagePath: buildUrl("BT12_043_SHINEGREYMON"), artist: "Drak"},
    {name: "Yasyamon", imagePath: buildUrl("BT12_051_YASYAMON"), artist: "Drak"},
    {name: "Skullmammothmon", imagePath: buildUrl("ST16_14_SKULLMAMMOTHMON"), artist: "Drak"},
    {name: "Coronamon", imagePath: buildUrl("EX5_007_CORONAMON"), artist: "Drak"},
    {name: "Lunamon", imagePath: buildUrl("EX5_016_LUNAMON"), artist: "Drak"},
    {name: "Gammamon", imagePath: buildUrl("P_058_GAMMAMON"), artist: "Drak"},
    {name: "Jellymon", imagePath: buildUrl("BT9_021_JELLYMON"), artist: "Drak"},
    {name: "Bosamon", imagePath: buildUrl("RB1_003_BOSAMON"), artist: "Drak"},
    {name: "Blacktailmonuver", imagePath: buildUrl("RB1_028_BLACKTAILMONUVER"), artist: "Drak"},
    {name: "Lopmon", imagePath: buildUrl("ST10_03_LOPMON"), artist: "Drak"},
    {name: "Terriermon", imagePath: buildUrl("BT8_046_TERRIERMON"), artist: "Drak"},
    {name: "Angewomon", imagePath: buildUrl("EX3_034_ANGEWOMON"), artist: "Drak"},
    {name: "Ladydevimon", imagePath: buildUrl("BT3_088_LADYDEVIMON"), artist: "Drak"},
    {name: "Astamon", imagePath: buildUrl("BT13_084_ASTAMON"), artist: "Drak"},
    {name: "Kokuwamon", imagePath: buildUrl("BT10_045_KOKUWAMON"), artist: "Drak"},
    {name: "Penguinmon", imagePath: buildUrl("BT11_024_PENGUINMON"), artist: "Drak"},
    {name: "Angoramon", imagePath: buildUrl("RB1_020_ANGORAMON"), artist: "Drak"},
    {name: "Spadamon", imagePath: buildUrl("BT10_059_SPADAMON"), artist: "Drak"},
    {name: "Commandramon", imagePath: buildUrl("BT4_063_COMMANDRAMON"), artist: "Drak"},
    {name: "Veemon", imagePath: buildUrl("BT2_021_VEEMON"), artist: "Drak"},
    {name: "Guilmon", imagePath: buildUrl("EX3_056_GUILMON"), artist: "Drak"},
    {name: "Renamon", imagePath: buildUrl("BT5_036_RENAMON"), artist: "Drak"},
    {name: "Machinedramon", imagePath: buildUrl("BT2_066_MACHINEDRAMON"), artist: "Drak"},
    {name: "Monzaemon", imagePath: buildUrl("BT1_038_MONZAEMON"), artist: "Drak"},
    {name: "Leviamon", imagePath: buildUrl("EX5_063_LEVIAMON"), artist: "Drak"},
    {name: "Numemon", imagePath: buildUrl("RB1_017_NUMEMON"), artist: "Drak"},
    {name: "Pulsemon", imagePath: buildUrl("P_028_PULSEMON"), artist: "Drak"},
    {name: "Loogamon", imagePath: buildUrl("BT14_071_LOOGAMON"), artist: "Drak"},
    {name: "Dorumon", imagePath: buildUrl("BT13_063_DORUMON"), artist: "Drak"},
    {name: "Ryudamon", imagePath: buildUrl("BT15_056_RYUDAMON"), artist: "Drak"},
    {name: "Kurisarimon", imagePath: buildUrl("EX6_039_KURISARIMON"), artist: "Drak"},
    {name: "Leviamon", imagePath: buildUrl("EX5_063_LEVIAMON"), artist: "Drak"},
    {name: "Wormmon", imagePath: buildUrl("BT12_047_WORMMON"), artist: "Drak"},
    {name: "Hawkmon", imagePath: buildUrl("BT3_009_HAWKMON"), artist: "Drak"},
    {name: "Armadillomon", imagePath: buildUrl("BT3_032_ARMADILLOMON"), artist: "Drak"},
];

function buildUrl(fileName: string) {
    return baseUrl + fileName + ".png";
}

export function getSleeve(sleeveName: string): string {
    return sleeves.find(s => s.name === sleeveName)?.imagePath ?? cardBackUrl;
}
