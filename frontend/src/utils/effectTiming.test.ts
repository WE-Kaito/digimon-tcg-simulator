import { describe, expect, it } from "vitest";
import { cleanEffectText, parseEffectTimingGroups } from "./effectTiming.ts";

describe("parseEffectTimingGroups", () => {
    it("groups consecutive activation timings under the same effect", () => {
        const groups = parseEffectTimingGroups(
            "[On Play] [When Digivolving] If you have 1 or fewer Tamers, play 1 Tamer.\n" +
                "[All Turns] This Digimon may digivolve."
        );

        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({
            timings: ["On Play", "When Digivolving"],
            qualifiers: [],
            effectText: "If you have 1 or fewer Tamers, play 1 Tamer.",
        });
        expect(groups[1]).toMatchObject({
            timings: ["All Turns"],
            effectText: "This Digimon may digivolve.",
        });
    });

    it("keeps frequency labels as qualifiers instead of separate effects", () => {
        const [group] = parseEffectTimingGroups(
            "[When Attacking] [Once Per Turn] By placing 1 card, ＜Draw 1＞."
        );

        expect(group.timings).toEqual(["When Attacking"]);
        expect(group.qualifiers).toEqual(["Once Per Turn"]);
        expect(group.effectText).toBe("By placing 1 card, Draw 1.");
    });

    it.each(["When Attacking", "On Play", "When Digivolving"])(
        "treats [%s] as an actionable targeting timing",
        (timing) => {
            const [group] = parseEffectTimingGroups(`[${timing}] Select 1 of your opponent's Digimon.`);

            expect(group.timings).toEqual([timing]);
            expect(group.timingTokens[0].actionable).toBe(true);
        }
    );

    it("does not create a group from a standalone frequency label", () => {
        expect(parseEffectTimingGroups("[Once Per Turn] Do something.")).toEqual([]);
    });

    it("returns an empty list for effects without a timing", () => {
        expect(parseEffectTimingGroups("Delete 1 of your opponent's Digimon.")).toEqual([]);
    });
});

describe("cleanEffectText", () => {
    it("removes card-data delimiters and normalizes whitespace", () => {
        expect(cleanEffectText("  [Rule]  Use ＜Blocker＞.\nThen draw. ")).toBe("Rule Use Blocker. Then draw.");
    });
});
