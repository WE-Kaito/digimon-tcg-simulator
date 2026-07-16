import { CardTypeGame } from "../../utils/types.ts";

export const assemblyFieldLocations = Array.from({ length: 16 }, (_, index) => `myDigi${index + 1}`);

export function isAssemblyCard(card?: CardTypeGame) {
    return card?.cardType.includes("Digimon") ?? false;
}

export function findEmptyAssemblyField(getCards: (location: string) => CardTypeGame[]) {
    return assemblyFieldLocations.find((location) => !getCards(location).length);
}

export function createAssemblyMoves(handCard: CardTypeGame, selectedTrashCards: CardTypeGame[], to: string) {
    return [
        ...selectedTrashCards
            .slice()
            .reverse()
            .map((card) => ({ card, from: "myTrash", to })),
        { card: handCard, from: "myHand", to },
    ];
}
