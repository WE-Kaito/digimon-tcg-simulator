// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import EffectTargetCursor from "./EffectTargetCursor.tsx";

const supportedTimings = ["When Attacking", "On Play", "When Digivolving"];

describe("EffectTargetCursor", () => {
    afterEach(() => {
        cleanup();
        useGameUIStates.getState().cancelEffectTargeting();
    });

    it.each(supportedTimings)("shows targeting instructions for [%s]", (timing) => {
        useGameUIStates.getState().startEffectTargeting({
            sourceCardId: "source-card",
            sourceLocation: "myDigi1",
            sourceName: "Agumon",
            timing,
            effectText: "Select another card.",
        });

        render(<EffectTargetCursor />);

        expect(screen.getByText(`Select a target for [${timing}]`)).toBeTruthy();
    });

    it("cancels targeting when Escape is pressed", () => {
        useGameUIStates.getState().startEffectTargeting({
            sourceCardId: "source-card",
            sourceLocation: "myDigi1",
            sourceName: "Agumon",
            timing: "When Attacking",
            effectText: "Select another card.",
        });
        render(<EffectTargetCursor />);

        act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

        expect(useGameUIStates.getState().effectTargeting).toBeNull();
    });

    it("conceals a revealed hand source when targeting is cancelled", () => {
        useGameBoardStates.setState({
            myHand: [{ id: "source-card", name: "Agumon", isFaceUp: true }],
        } as never);
        useGameUIStates.getState().startEffectTargeting({
            sourceCardId: "source-card",
            sourceLocation: "myHand",
            sourceName: "Agumon",
            timing: "On Play",
            effectText: "Select another card.",
        });
        const sendMessage = vi.fn();
        render(
            <EffectTargetCursor
                wsUtils={{ matchInfo: { gameId: "game", user: "test", opponentName: "Chrome" }, sendMessage } as never}
            />
        );

        act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

        expect(useGameBoardStates.getState().myHand[0].isFaceUp).toBe(false);
        expect(sendMessage).toHaveBeenCalledWith("game:/flipCard:source-card:myHand");
    });

});
