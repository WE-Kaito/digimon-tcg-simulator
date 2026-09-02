import { describe, expect, it } from "vitest";
import { isAttackIntent } from "./attackIntent.ts";
import { AttackDragSnapshot, Phase } from "./types.ts";

const suspendedDigimon: AttackDragSnapshot = {
    sourceCardId: "attacker-1",
    sourceLocation: "myDigi1",
    isMyTurn: true,
    phase: Phase.MAIN,
    cardType: "Digimon",
    isSuspended: true,
    digimonNumber: "BT1-001",
};

describe("isAttackIntent", () => {
    it("accepts a suspended Digimon during its player's main phase", () => {
        expect(isAttackIntent(suspendedDigimon)).toBe(true);
    });

    it("accepts dual-type Digimon", () => {
        expect(isAttackIntent({ ...suspendedDigimon, cardType: "Digimon/Option" })).toBe(true);
    });

    it.each([
        { isMyTurn: false },
        { phase: Phase.BREEDING },
        { cardType: "Tamer" },
        { isSuspended: false },
        { sourceLocation: "myBreedingArea" },
    ])("rejects invalid attack snapshot %o", (override) => {
        expect(isAttackIntent({ ...suspendedDigimon, ...override })).toBe(false);
    });

    it("allows BT12-083 to attack without the normal suspended-state gate", () => {
        expect(isAttackIntent({ ...suspendedDigimon, isSuspended: false, digimonNumber: "BT12-083" })).toBe(true);
    });
});
