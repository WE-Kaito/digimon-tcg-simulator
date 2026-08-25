import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import type { CardTypeGame } from "../../utils/types.ts";
import HighlightedKeyWords from "./HighlightedKeyWords.tsx";

const sourceCard = {
    id: "source-card",
    name: "Source Digimon",
    cardType: "Digimon",
    isFaceUp: true,
    inheritedEffect: "",
} as CardTypeGame;

function renderTiming(timing: string, route: "/game" | "/test") {
    render(
        <MemoryRouter initialEntries={[route]}>
            <HighlightedKeyWords text={`[${timing}] Choose 1 of your opponent's Digimon.`} />
        </MemoryRouter>
    );
}

describe("HighlightedKeyWords effect targeting", () => {
    beforeEach(() => {
        useGeneralStates.setState({ selectedCard: sourceCard, hoverCard: null });
        useGameBoardStates.setState({ myDigi1: [sourceCard] } as never);
        useGameUIStates.setState({ effectTargeting: null });
    });

    it.each(["On Deletion", "Your Turn", "Opponent's Turn"])(
        "starts targeting from the %s timing on the game board",
        (timing) => {
            renderTiming(timing, "/game");

            fireEvent.click(screen.getByRole("button", { name: timing }));

            expect(useGameUIStates.getState().effectTargeting).toMatchObject({
                sourceCardId: sourceCard.id,
                sourceLocation: "myDigi1",
                timing,
                effectText: "Choose 1 of your opponent's Digimon.",
            });
        }
    );

    it.each(["On Deletion", "Your Turn", "Opponent's Turn"])(
        "starts targeting from the %s timing on the local test board",
        (timing) => {
            renderTiming(timing, "/test");

            fireEvent.click(screen.getByRole("button", { name: timing }));

            expect(useGameUIStates.getState().effectTargeting).toMatchObject({
                sourceCardId: sourceCard.id,
                sourceLocation: "myDigi1",
                timing,
            });
        }
    );
});
