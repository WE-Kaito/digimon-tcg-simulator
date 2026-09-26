import { describe, expect, it } from "vitest";
import { extractStandaloneEffectKeywords, supportsAutoDetectedEffectKeywords } from "./effectKeywords.ts";

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
        expect(extractStandaloneEffectKeywords("＜Blocker＞\n[On Play] Draw 1."))
            .toEqual(["Blocker"]);
    });

    it.each([
        ["＜Succession ([Jupitermon])＞", "Succession"],
        ["＜Succession＞", "Succession"],
        ["＜Decode ([Jupitermon])＞", "Decode"],
    ])("normalizes %s to the field label %s", (effect, expectedLabel) => {
        expect(extractStandaloneEffectKeywords(effect)).toEqual([expectedLabel]);
    });
});
