import {Picture} from "./types.ts";

const baseUrl = "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/profile_pictures/";

export const avatars: Picture[] = [
    { name: "AncientIrismon", imagePath: buildUrl("AncientIrismon"), artist: "Tortoiseshel" },
    { name: "Bearmon", imagePath: buildUrl("Bearmon"), artist: "Tortoiseshel" },
    { name: "Belphemon", imagePath: buildUrl("Belphemon"), artist: "Tortoiseshel" },
    { name: "BloomLordmon", imagePath: buildUrl("BloomLordmon"), artist: "Tortoiseshel" },
    { name: "Commandramon", imagePath: buildUrl("Commandramon"), artist: "Tortoiseshel" },
    { name: "DarkKnightmon X", imagePath: buildUrl("DarkKnightmonX"), artist: "Tortoiseshel" },
    { name: "Diablomon", imagePath: buildUrl("Diablomon"), artist: "Tortoiseshel" },
    { name: "Guilmon", imagePath: buildUrl("Guilmon"), artist: "Tortoiseshel" },
    { name: "Hexeblaumon", imagePath: buildUrl("Hexeblaumon"), artist: "Tortoiseshel" },
    { name: "Impmon", imagePath: buildUrl("Impmon"), artist: "Tortoiseshel" },
    { name: "KaiserGreymon", imagePath: buildUrl("KaiserGreymon"), artist: "Tortoiseshel" },
    { name: "Omegamon", imagePath: buildUrl("Omegamon"), artist: "Tortoiseshel" },
    { name: "Sakuyamon", imagePath: buildUrl("Sakuyamon"), artist: "Tortoiseshel" },
    { name: "Silphymon", imagePath: buildUrl("Silphymon"), artist: "Tortoiseshel" },
    { name: "Solarmon", imagePath: buildUrl("Solarmon"), artist: "Tortoiseshel" },
    { name: "Stingmon", imagePath: buildUrl("Stingmon"), artist: "Tortoiseshel" },
    { name: "Superstarmon", imagePath: buildUrl("Superstarmon"), artist: "Tortoiseshel" },
    { name: "Tyrannomon", imagePath: buildUrl("Tyrannomon"), artist: "Tortoiseshel" },
    { name: "V-Mon", imagePath: buildUrl("V-mon"), artist: "Tortoiseshel" },
    { name: "WereGarurumon", imagePath: buildUrl("WereGarurumon"), artist: "Tortoiseshel" },
    { name: "Gammamon", imagePath: buildUrl("Gammamon"), artist: "Tortoiseshel" },
    { name: "Justimon", imagePath: buildUrl("Justimon"), artist: "Tortoiseshel" },
    { name: "Coronamon", imagePath: buildUrl("Coronamon"), artist: "Tortoiseshel" },
    { name: "Hackmon", imagePath: buildUrl("Hackmon"), artist: "Tortoiseshel" },
    { name: "ClearAgumon", imagePath: buildUrl("ClearAgumon"), artist: "Tortoiseshel" },
    { name: "Terriermon", imagePath: buildUrl("Terriermon"), artist: "Tortoiseshel" },
    { name: "Airdramon", imagePath: buildUrl("Airdramon"), artist: "Tortoiseshel" },
    { name: "Tailmon", imagePath: buildUrl("Tailmon"), artist: "Tortoiseshel" },
    { name: "Togemon X", imagePath: buildUrl("TogemonX"), artist: "Tortoiseshel" },
    { name: "Wizardmon X", imagePath: buildUrl("WizardmonX"), artist: "Tortoiseshel" },
    { name: "Dorumon", imagePath: buildUrl("Dorumon"), artist: "Tortoiseshel" },
    { name: "Lunamon", imagePath: buildUrl("Lunamon"), artist: "Tortoiseshel" },
    { name: "Pinochimon", imagePath: buildUrl("Pinochimon"), artist: "Tortoiseshel" },
    { name: "PrinceMamemon", imagePath: buildUrl("PrinceMamemon"), artist: "Tortoiseshel" },
    { name: "Lilithmon X", imagePath: buildUrl("Lilithmon_X"), artist: "Tortoiseshel" },
    { name: "Numemon", imagePath: buildUrl("Numemon"), artist: "Tortoiseshel" },
    { name: "Leviamon X", imagePath: buildUrl("Leviamon_X"), artist: "Tortoiseshel" },
    { name: "Imperialdramon PM", imagePath: buildUrl("Imperialdramon_PM"), artist: "Tortoiseshel" },
    { name: "HolyAngemon", imagePath: buildUrl("HolyAngemon"), artist: "Tortoiseshel" },
    { name: "Pandamon", imagePath: buildUrl("Pandamon"), artist: "Tortoiseshel" },
]

function buildUrl(fileName: string) {
    return baseUrl + fileName + ".png";
}

export function profilePicture(avatarName: string) : string {
    return avatars.find((avatar) => avatar.name === avatarName)?.imagePath ?? buildUrl("Placeholder");
}
