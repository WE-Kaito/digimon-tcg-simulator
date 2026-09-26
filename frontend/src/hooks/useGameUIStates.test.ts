import { beforeEach, describe, expect, it } from "vitest";
import { EffectTargeting, useGameUIStates } from "./useGameUIStates.ts";

const targeting: EffectTargeting = {
    sourceCardId: "source-1",
    sourceLocation: "myDigi1",
    sourceName: "Test Digimon",
    timing: "On Play",
    effectText: "Delete 1 of your opponent's Digimon.",
};

describe("effect targeting state", () => {
    beforeEach(() => useGameUIStates.setState({ effectTargeting: null }));

    it("starts targeting with a frozen effect snapshot", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        expect(useGameUIStates.getState().effectTargeting).toEqual(targeting);
    });

    it("replaces an active effect when another timing is selected", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().startEffectTargeting({ ...targeting, timing: "When Digivolving" });
        expect(useGameUIStates.getState().effectTargeting?.timing).toBe("When Digivolving");
    });

    it("cancels targeting", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().cancelEffectTargeting();
        expect(useGameUIStates.getState().effectTargeting).toBeNull();
    });
});
