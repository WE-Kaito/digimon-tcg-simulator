import dataImage from '../assets/attribute_icons/data.png';
import virusImage from '../assets/attribute_icons/virus.png';
import vaccineImage from '../assets/attribute_icons/vaccine.png';
import freeImage from '../assets/attribute_icons/free.png';
import unknownImage from '../assets/attribute_icons/unknown.png';
import variableImage from '../assets/attribute_icons/variable.png';
import {CardType} from "./types.ts";


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