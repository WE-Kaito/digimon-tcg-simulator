import dataImage from '../assets/attribute_icons/data.png';
import virusImage from '../assets/attribute_icons/virus.png';
import vaccineImage from '../assets/attribute_icons/vaccine.png';
import freeImage from '../assets/attribute_icons/free.png';
import unknownImage from '../assets/attribute_icons/unknown.png';
import variableImage from '../assets/attribute_icons/variable.png';
import {CardType} from "./types.ts";
import takatoImage from "../assets/profile_pictures/takato.jpg";
import aibaImage from "../assets/profile_pictures/aiba.jpg";
import arataImage from "../assets/profile_pictures/arata.jpg";
import eriImage from "../assets/profile_pictures/eri.jpg";
import haruImage from "../assets/profile_pictures/haru.jpg";
import hiroImage from "../assets/profile_pictures/hiro.jpg";
import mattImage from "../assets/profile_pictures/matt.jpg";
import minoruImage from "../assets/profile_pictures/minoru.jpg";
import rinaImage from "../assets/profile_pictures/rina.jpg";
import sakiImage from "../assets/profile_pictures/saki.jpg";
import taiImage from "../assets/profile_pictures/tai.jpg";
import takumiImage from "../assets/profile_pictures/takumi.jpg";

export function getBackgroundColor(color: string) {
    switch (color) {
        case 'Red':
            return "#b02626";
        case 'Yellow':
            return "#b0a325";
        case 'Green':
            return "#095E1C";
        case 'Blue':
            return "#085e8c";
        case 'Purple':
            return "#46136D";
        case 'Black':
            return "#070707";
        case 'White':
            return "#DBDBDB";
        case "default":
            return "rgba(0, 0, 0, 0)";
    }
}

export function getAttributeImage(attribute: string) {
    switch (attribute) {
        case 'Virus':
            return virusImage;
        case 'Data':
            return dataImage;
        case 'Vaccine':
            return vaccineImage;
        case 'Free':
            return freeImage;
        case 'Variable':
            return variableImage;
        case 'Unknown':
            return unknownImage;
        case 'default':
            return;
    }
}

export function getStrokeColor(hoverCard: CardType | null, selectedCard: CardType | null) {
    if (hoverCard) {
        switch(hoverCard.color) {
            case 'White':
                return "#070707";
            case 'Yellow':
                return "#070707";
            default:
                return "#C5C5C5";
        }
    }
    if (selectedCard) {
        switch(selectedCard.color) {
            case 'White':
                return "#070707";
            case 'Yellow':
                return "#070707";
            default:
                return "#C5C5C5";
        }
    }
    return "#C5C5C5";
}

export function profilePicture(avatarName : string) {
    switch (avatarName) {
        case "takato":
            return takatoImage;
        case "aiba":
            return aibaImage;
        case "arata":
            return arataImage;
        case "eri":
            return eriImage;
        case "haru":
            return haruImage;
        case "hiro":
            return hiroImage;
        case "matt":
            return mattImage;
        case "minoru":
            return minoruImage;
        case "rina":
            return rinaImage;
        case "saki":
            return sakiImage;
        case "tai":
            return taiImage;
        case "takumi":
            return takumiImage;
        default:
            return takatoImage;
    }
}
