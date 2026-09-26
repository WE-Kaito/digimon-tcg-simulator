import { beforeEach, describe, expect, it } from "vitest";
import type { CardTypeGame } from "../utils/types.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";

function card(id: string, keywords: string[]): CardTypeGame {
    return {
        id,
        uniqueCardNumber: `TEST-${id}`,
        name: "Test Digimon",
        imgUrl: "",
        cardType: "Digimon",
        color: ["Red"],
        cardNumber: `TEST-${id}`,
        restrictions: { chinese: "", english: "", japanese: "", korean: "" },
        illustrator: "",
        dp: 3000,
        level: 3,
        isTilted: true,
        isFaceUp: true,
        modifiers: {
            plusDp: 2000,
            plusSecurityAttacks: 1,
            keywords,
            colors: ["Blue"],
        },
    };
}

describe("security modifier cleanup", () => {
    beforeEach(() => {
        useGameBoardStates.setState({
            myDigi1: [],
            mySecurity: [],
            opponentDigi1: [],
            opponentSecurity: [],
        });
    });

    it.each([
        ["myDigi1", "mySecurity"],
        ["opponentDigi1", "opponentSecurity"],
    ])("clears statuses when moveCard sends a card from %s to %s", (from, to) => {
        const movingCard = card("moving", ["SICK", "TAUNT", "IMMUNE"]);
        const existingSecurityCard = card("existing", ["SICK"]);
        useGameBoardStates.setState({ [from]: [movingCard], [to]: [existingSecurityCard] });

        useGameBoardStates.getState().moveCard(movingCard.id, from, to);

        const movedCard = (useGameBoardStates.getState()[to as "mySecurity"] as CardTypeGame[]).at(-1);
        expect(movedCard?.modifiers).toEqual({
            plusDp: 0,
            plusSecurityAttacks: 0,
            keywords: [],
            colors: ["Red"],
        });
    });

    it("clears statuses when moveCardToStack adds a card to security", () => {
        const movingCard = card("moving", ["SICK", "TAUNT", "IMMUNE"]);
        useGameBoardStates.setState({ myDigi1: [movingCard], mySecurity: [] });

        useGameBoardStates.getState().moveCardToStack("Top", movingCard.id, "myDigi1", "mySecurity", "down");

        expect(useGameBoardStates.getState().mySecurity[0].modifiers).toEqual({
            plusDp: 0,
            plusSecurityAttacks: 0,
            keywords: [],
            colors: ["Red"],
        });
    });
});
