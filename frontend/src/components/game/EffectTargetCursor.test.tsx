// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
});
