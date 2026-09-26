import { describe, expect, it } from "vitest";
import {
    EffectTargetEvent,
    findOptionPlacementField,
    flipEffectLocation,
    formatEffectTargetMessage,
    getSameSideDirection,
    isSameSideEffectTarget,
    isSelfEffectTarget,
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

    it("identifies an effect applied to its own source card", () => {
        expect(isSelfEffectTarget({ ...event, targetCardId: event.sourceCardId })).toBe(true);
        expect(isSelfEffectTarget(event)).toBe(false);
    });

    it("identifies effects targeting cards on the source player's side", () => {
        expect(isSameSideEffectTarget({ ...event, targetOwner: event.sourceOwner })).toBe(true);
        expect(isSameSideEffectTarget(event)).toBe(false);
    });

    it("selects horizontal arrow directions for same-side fields even with empty slots between them", () => {
        expect(getSameSideDirection("myDigi1", "myDigi4")).toBe("right");
        expect(getSameSideDirection("opponentDigi7", "opponentDigi3")).toBe("left");
        expect(getSameSideDirection("myDigi1", "opponentDigi2")).toBeNull();
        expect(getSameSideDirection("myDigi1", "myDigi1")).toBeNull();
    });

    it("formats the structured event consistently", () => {
        expect(formatEffectTargetMessage(event)).toBe(
            "Test's Titamon + SkullBaluchimon is targeting Test2's ClearAgumon with [On Play]: " +
                "Delete all of your opponent's Digimon with the lowest level."
        );
    });

    it("formats a self-targeted effect using itself", () => {
        expect(
            formatEffectTargetMessage({
                ...event,
                targetCardId: event.sourceCardId,
                targetOwner: event.sourceOwner,
                targetName: event.sourceName,
            })
        ).toBe(
            "Test's Titamon + SkullBaluchimon is targeting itself with [On Play]: " +
                "Delete all of your opponent's Digimon with the lowest level."
        );
    });

    it("names the evolution source card supplying an inherited effect", () => {
        expect(
            formatEffectTargetMessage({
                ...event,
                effectSourceCardId: "inherited-source-id",
                effectSourceName: "Koromon",
            })
        ).toBe(
            "Test's Titamon + SkullBaluchimon is using Koromon to target Test2's ClearAgumon with [On Play]: " +
                "Delete all of your opponent's Digimon with the lowest level."
        );
    });

    it("formats an effect activated from hand", () => {
        expect(formatEffectTargetMessage({ ...event, sourceLocation: "myHand", sourceName: "Gaia Force" })).toBe(
            "Test is using Gaia Force from hand to target Test2's ClearAgumon with [On Play]: " +
                "Delete all of your opponent's Digimon with the lowest level."
        );
    });

    it("stacks an activated option with the same card before using an empty field", () => {
        const fields: Record<string, Array<{ cardType: string; cardNumber: string }>> = {
            myDigi17: [],
            myDigi18: [{ cardType: "Option", cardNumber: "BT1-001" }],
        };

        expect(findOptionPlacementField({ cardNumber: "BT1-001" }, (field) => fields[field] ?? [])).toBe(
            "myDigi18"
        );
    });

    it("treats a matching Digimon/Option card as an option placement stack", () => {
        const fields: Record<string, Array<{ cardType: string; cardNumber: string }>> = {
            myDigi17: [],
            myDigi19: [{ cardType: "Digimon/Option", cardNumber: "EX9-001" }],
        };

        expect(findOptionPlacementField({ cardNumber: "EX9-001" }, (field) => fields[field] ?? [])).toBe(
            "myDigi19"
        );
    });

    it("uses the first empty option field when no matching card exists", () => {
        const fields: Record<string, Array<{ cardType: string; cardNumber: string }>> = {
            myDigi17: [{ cardType: "Tamer", cardNumber: "BT1-002" }],
            myDigi18: [],
        };

        expect(findOptionPlacementField({ cardNumber: "BT1-001" }, (field) => fields[field] ?? [])).toBe(
            "myDigi18"
        );
    });

    it("requires manual placement when every option field is occupied without a match", () => {
        expect(
            findOptionPlacementField({ cardNumber: "BT1-001" }, () => [
                { cardType: "Tamer", cardNumber: "BT1-002" },
            ])
        ).toBeUndefined();
    });
});
