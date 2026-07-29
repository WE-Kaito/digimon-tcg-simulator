import { describe, expect, it } from "vitest";
import {
    EffectTargetEvent,
    flipEffectLocation,
    formatEffectTargetMessage,
    orientEffectLocation,
} from "./effectTargeting.ts";

const event: EffectTargetEvent = {
    sender: "Test",
    sourceCardId: "source-id",
    targetCardId: "target-id",
    sourceLocation: "myDigi1",
    targetLocation: "opponentDigi2",
    sourceOwner: "Test",
    targetOwner: "Test2",
    sourceName: "Titamon + SkullBaluchimon",
    targetName: "ClearAgumon",
    timing: "On Play",
    effectText: "Delete all of your opponent's Digimon with the lowest level.",
};

describe("effect target multiplayer helpers", () => {
    it("flips sender-relative locations for the opponent", () => {
        expect(flipEffectLocation("myDigi1")).toBe("opponentDigi1");
        expect(flipEffectLocation("opponentBreedingArea")).toBe("myBreedingArea");
    });

    it("keeps locations unchanged for the sender", () => {
        expect(orientEffectLocation("myDigi1", "Test", "Test")).toBe("myDigi1");
    });

    it("orients locations for the receiving player", () => {
        expect(orientEffectLocation("opponentDigi2", "Test", "Test2")).toBe("myDigi2");
    });

    it("formats the structured event consistently", () => {
        expect(formatEffectTargetMessage(event)).toBe(
            "Test's Titamon + SkullBaluchimon is targeting Test2's ClearAgumon with [On Play]: " +
                "Delete all of your opponent's Digimon with the lowest level."
        );
    });
});
