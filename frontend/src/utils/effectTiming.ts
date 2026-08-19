export const EFFECT_TIMINGS = [
    "On Play",
    "When Digivolving",
    "When Attacking",
    "When Linking",
    "End of Attack",
    "On Deletion",
    "Your Turn",
    "All Turns",
    "Opponent's Turn",
    "End of Opponent's Turn",
    "Start of Your Turn",
    "End of Your Turn",
    "Enf of Opponent's Turn",
    "Security",
    "Main",
    "Start of Your Main Phase",
    "Start of Opponent's Main Phase",
    "Once Per Turn",
    "Twice Per Turn",
    "Trash",
    "Hand",
    "Breeding",
    "Counter",
    "End of All Turns",
] as const;

const NON_ACTIONABLE_TIMINGS = new Set(["Once Per Turn", "Twice Per Turn", "Trash", "Hand", "Breeding"]);
const EFFECT_TIMING_SET = new Set<string>(EFFECT_TIMINGS);

export type EffectTimingToken = {
    label: string;
    start: number;
    end: number;
    actionable: boolean;
};

export type EffectTimingGroup = {
    timings: string[];
    qualifiers: string[];
    effectText: string;
    rawEffectText: string;
    timingTokens: EffectTimingToken[];
};

export function isActionableEffectTiming(label: string): boolean {
    return EFFECT_TIMING_SET.has(label) && !NON_ACTIONABLE_TIMINGS.has(label);
}

export function cleanEffectText(text: string): string {
    return text
        .replace(/\[([^\]]+)]/g, "$1")
        .replace(/＜([^＞]+)＞/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

export function parseEffectTimingGroups(text: string): EffectTimingGroup[] {
    const timingTokens: EffectTimingToken[] = [];
    const bracketPattern = /\[([^\]]+)]/g;
    let match: RegExpExecArray | null;

    while ((match = bracketPattern.exec(text)) !== null) {
        const label = match[1];
        if (!EFFECT_TIMING_SET.has(label)) continue;
        timingTokens.push({
            label,
            start: match.index,
            end: bracketPattern.lastIndex,
            actionable: isActionableEffectTiming(label),
        });
    }

    const runs: EffectTimingToken[][] = [];
    for (const token of timingTokens) {
        const currentRun = runs.at(-1);
        const previousToken = currentRun?.at(-1);
        if (currentRun && previousToken && text.slice(previousToken.end, token.start).trim() === "") {
            currentRun.push(token);
        } else {
            runs.push([token]);
        }
    }

    const actionableRuns = runs.filter((run) => run.some((token) => token.actionable));

    return actionableRuns.map((run, index) => {
        const nextRun = actionableRuns[index + 1];
        const rawEffectText = text.slice(run.at(-1)!.end, nextRun?.[0].start ?? text.length).trim();

        return {
            timings: run.filter((token) => token.actionable).map((token) => token.label),
            qualifiers: run.filter((token) => !token.actionable).map((token) => token.label),
            effectText: cleanEffectText(rawEffectText),
            rawEffectText,
            timingTokens: run,
        };
    });
}
