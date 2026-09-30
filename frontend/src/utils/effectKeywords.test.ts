import { describe, expect, it } from "vitest";
import {
    extractStandaloneEffectKeywords,
    extractStandaloneSecurityAttackModifier,
    supportsAutoDetectedEffectKeywords,
} from "./effectKeywords.ts";

describe("effect keyword detection", () => {
    it.each(["Option", "Tamer", "Tamer/Digimon", "Digi-Egg"])(
        "does not auto-detect keywords for %s cards",
        (cardType) => {
            expect(supportsAutoDetectedEffectKeywords(cardType)).toBe(false);
        }
    );

    it.each(["Digimon", "Digimon/Option"])("auto-detects keywords for %s cards", (cardType) => {
        expect(supportsAutoDetectedEffectKeywords(cardType)).toBe(true);
    });

    it("continues extracting standalone keywords from eligible effect text", () => {
        expect(extractStandaloneEffectKeywords("＜Blocker＞\n[On Play] Draw 1.")).toEqual(["Blocker"]);
    });

    it.each([
        ["＜Succession ([Jupitermon])＞", "Succession"],
        ["＜Succession＞", "Succession"],
        ["＜Decode ([Jupitermon])＞", "Decode"],
        ["＜Partition (Red Lv.6 & Black Lv.6)＞", "Partition"],
        ["＜Decoy (Red/Black)＞", "Decoy"],
    ])("normalizes %s to the field label %s", (effect, expectedLabel) => {
        expect(extractStandaloneEffectKeywords(effect)).toEqual([expectedLabel]);
    });

    it.each([
        ["＜Security A.+1＞", 1],
        ["＜Security Attack +2＞", 2],
        ["＜Security Attack -1＞", -1],
        ["＜Security +3＞", 3],
        ["＜Security A.+1＞ ＜Security Attack +2＞", 3],
    ])("extracts %s as a %i security attack modifier", (effect, expectedModifier) => {
        expect(extractStandaloneSecurityAttackModifier(effect)).toBe(expectedModifier);
        expect(extractStandaloneEffectKeywords(effect)).toEqual([]);
    });

    it("ignores Security Attack text embedded in timed effect prose", () => {
        const effect = "[When Attacking] This Digimon gains ＜Security Attack +1＞ for the turn.";
        expect(extractStandaloneSecurityAttackModifier(effect)).toBe(0);
    });
});
