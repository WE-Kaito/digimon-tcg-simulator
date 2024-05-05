import {Picture} from "./types.ts";
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
import dorumon from "../assets/profile_pictures/Dorumon.png";
import lunamon from "../assets/profile_pictures/Lunamon.png";
import pinochimon from "../assets/profile_pictures/Pinochimon.png";
import princeMamemon from "../assets/profile_pictures/PrinceMamemon.png";
import lilithmonX from "../assets/profile_pictures/Lilithmon_X.png";
import numemon from "../assets/profile_pictures/Numemon.png";
import placeholder from "../assets/profile_pictures/Placeholder.png";

export const avatars: Picture[] = [
    { name: "AncientIrismon", imagePath: ancientIrismon, artist: "Tortoiseshel" },
    { name: "Bearmon", imagePath: bearmon, artist: "Tortoiseshel" },
    { name: "Belphemon", imagePath: belphemon, artist: "Tortoiseshel" },
    { name: "BloomLordmon", imagePath: bloomLordmon, artist: "Tortoiseshel" },
    { name: "Commandramon", imagePath: commandramon, artist: "Tortoiseshel" },
    { name: "DarkKnightmon X", imagePath: darkKnightmonX, artist: "Tortoiseshel" },
    { name: "Diablomon", imagePath: diablomon, artist: "Tortoiseshel" },
    { name: "Guilmon", imagePath: guilmon, artist: "Tortoiseshel" },
    { name: "Hexeblaumon", imagePath: hexeblaumon, artist: "Tortoiseshel" },
    { name: "Impmon", imagePath: impmon, artist: "Tortoiseshel" },
    { name: "KaiserGreymon", imagePath: kaiserGreymon, artist: "Tortoiseshel" },
    { name: "Omegamon", imagePath: omegamon, artist: "Tortoiseshel" },
    { name: "Sakuyamon", imagePath: sakuyamon, artist: "Tortoiseshel" },
    { name: "Silphymon", imagePath: silphymon, artist: "Tortoiseshel" },
    { name: "Solarmon", imagePath: solarmon, artist: "Tortoiseshel" },
    { name: "Stingmon", imagePath: stingmon, artist: "Tortoiseshel" },
    { name: "Superstarmon", imagePath: superstarmon, artist: "Tortoiseshel" },
    { name: "Tyrannomon", imagePath: tyrannomon, artist: "Tortoiseshel" },
    { name: "V-Mon", imagePath: vMon, artist: "Tortoiseshel" },
    { name: "WereGarurumon", imagePath: wereGarurumon, artist: "Tortoiseshel" },
    { name: "Gammamon", imagePath: gammamon, artist: "Tortoiseshel" },
    { name: "Justimon", imagePath: justimon, artist: "Tortoiseshel" },
    { name: "Coronamon", imagePath: coronamon, artist: "Tortoiseshel" },
    { name: "Hackmon", imagePath: hackmon, artist: "Tortoiseshel" },
    { name: "ClearAgumon", imagePath: clearAgumon, artist: "Tortoiseshel" },
    { name: "Terriermon", imagePath: terriermon, artist: "Tortoiseshel" },
    { name: "Airdramon", imagePath: airdramon, artist: "Tortoiseshel" },
    { name: "Tailmon", imagePath: tailmon, artist: "Tortoiseshel" },
    { name: "Togemon X", imagePath: togemonX, artist: "Tortoiseshel" },
    { name: "Wizardmon X", imagePath: wizardmonX, artist: "Tortoiseshel" },
    { name: "Dorumon", imagePath: dorumon, artist: "Tortoiseshel" },
    { name: "Lunamon", imagePath: lunamon, artist: "Tortoiseshel" },
    { name: "Pinochimon", imagePath: pinochimon, artist: "Tortoiseshel" },
    { name: "PrinceMamemon", imagePath: princeMamemon, artist: "Tortoiseshel" },
    { name: "Lilithmon X", imagePath: lilithmonX, artist: "Tortoiseshel" },
    { name: "Numemon", imagePath: numemon, artist: "Tortoiseshel" },
    ];

export function profilePicture(avatarName: string) : string {
    return avatars.find((avatar) => avatar.name === avatarName)?.imagePath ?? placeholder;
}
