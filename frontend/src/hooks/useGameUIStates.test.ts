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
    beforeEach(() => {
        useGameUIStates.getState().clearEffectTargetingQueue();
        useGameUIStates.getState().clearAttackSource();
    });

    it("pins and clears the immutable attack source independently of hover state", () => {
        const card = {
            id: "attacker-1",
            name: "Attacker",
            cardType: "Digimon",
            isFaceUp: true,
        } as never;

        useGameUIStates.getState().pinAttackSource({ card, location: "myDigi1" });

        expect(useGameUIStates.getState().attackSource).toEqual({ card, location: "myDigi1" });

        useGameUIStates.getState().clearAttackSource();
        expect(useGameUIStates.getState().attackSource).toBeNull();
    });

    it("starts targeting with a frozen effect snapshot", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        expect(useGameUIStates.getState().effectTargeting).toEqual(targeting);
    });

    it("queues another timing without replacing the active effect", () => {
        const queued = { ...targeting, timing: "When Digivolving" };
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().startEffectTargeting(queued);

        expect(useGameUIStates.getState().effectTargeting).toEqual(targeting);
        expect(useGameUIStates.getState().effectTargetingQueue).toEqual([queued]);
    });

    it("advances queued effects in FIFO order as each effect resolves", () => {
        const second = { ...targeting, timing: "When Digivolving" };
        const third = { ...targeting, timing: "When Attacking" };
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().startEffectTargeting(second);
        useGameUIStates.getState().startEffectTargeting(third);

        useGameUIStates.getState().cancelEffectTargeting();
        expect(useGameUIStates.getState().effectTargeting).toEqual(second);
        expect(useGameUIStates.getState().effectTargetingQueue).toEqual([third]);

        useGameUIStates.getState().cancelEffectTargeting();
        expect(useGameUIStates.getState().effectTargeting).toEqual(third);

        useGameUIStates.getState().cancelEffectTargeting();
        expect(useGameUIStates.getState().effectTargeting).toBeNull();
        expect(useGameUIStates.getState().effectTargetingQueue).toEqual([]);
    });

    it("does not enqueue duplicate effects", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().startEffectTargeting({ ...targeting });

        expect(useGameUIStates.getState().effectTargetingQueue).toEqual([]);
    });

    it("clears active and queued effects together", () => {
        useGameUIStates.getState().startEffectTargeting(targeting);
        useGameUIStates.getState().startEffectTargeting({ ...targeting, timing: "When Attacking" });

        useGameUIStates.getState().clearEffectTargetingQueue();

        expect(useGameUIStates.getState().effectTargeting).toBeNull();
        expect(useGameUIStates.getState().effectTargetingQueue).toEqual([]);
    });
});
