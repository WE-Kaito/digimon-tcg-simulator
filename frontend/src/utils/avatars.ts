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
import placeholder from "../assets/profile_pictures/Placeholder.png";

type Avatar = {
    name: string,
    imagePath: string,
}

export const avatars: Avatar[] = [
    { name: "AncientIrismon", imagePath: ancientIrismon },
    { name: "Bearmon", imagePath: bearmon },
    { name: "Belphemon", imagePath: belphemon },
    { name: "BloomLordmon", imagePath: bloomLordmon },
    { name: "Commandramon", imagePath: commandramon },
    { name: "DarkKnightmon X", imagePath: darkKnightmonX },
    { name: "Diablomon", imagePath: diablomon },
    { name: "Guilmon", imagePath: guilmon },
    { name: "Hexeblaumon", imagePath: hexeblaumon },
    { name: "Impmon", imagePath: impmon },
    { name: "KaiserGreymon", imagePath: kaiserGreymon },
    { name: "Omegamon", imagePath: omegamon },
    { name: "Sakuyamon", imagePath: sakuyamon },
    { name: "Silphymon", imagePath: silphymon },
    { name: "Solarmon", imagePath: solarmon },
    { name: "Stingmon", imagePath: stingmon },
    { name: "Superstarmon", imagePath: superstarmon },
    { name: "Tyrannomon", imagePath: tyrannomon },
    { name: "V-Mon", imagePath: vMon },
    { name: "WereGarurumon", imagePath: wereGarurumon },
    { name: "Gammamon", imagePath: gammamon },
    { name: "Justimon", imagePath: justimon },
    { name: "Coronamon", imagePath: coronamon },
    { name: "Hackmon", imagePath: hackmon },
    { name: "ClearAgumon", imagePath: clearAgumon },
    { name: "Terriermon", imagePath: terriermon },
    { name: "Airdramon", imagePath: airdramon },
    { name: "Tailmon", imagePath: tailmon },
    { name: "Togemon X", imagePath: togemonX },
    { name: "Wizardmon X", imagePath: wizardmonX },
]

export function profilePicture(avatarName: string) : string {
    return avatars.find((avatar) => avatar.name === avatarName)?.imagePath ?? placeholder;
}
