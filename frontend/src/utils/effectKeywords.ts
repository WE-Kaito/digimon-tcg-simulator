const standaloneKeywordLine = /^\s*(?:＜[^＞\r\n]+＞[\s.,;:]*)+$/;
const keywordTag = /＜([^＞\r\n]+)＞/g;

export function supportsAutoDetectedEffectKeywords(cardType: string): boolean {
    return cardType.split("/", 1)[0].trim() === "Digimon";
}

function getFieldKeywordLabel(keyword: string): string {
    if (/^Decode(?:\s|\(|$)/i.test(keyword)) return "Decode";
    if (/^Succession(?:\s|\(|$)/i.test(keyword)) return "Succession";
    if (/^Partition(?:\s|\(|$)/i.test(keyword)) return "Partition";
    if (/^Decoy(?:\s|\(|$)/i.test(keyword)) return "Decoy";
    return keyword;
}

function getSecurityAttackModifier(keyword: string): number | null {
    const match = keyword.match(/^Security(?:\s*Attack|\s*A\.)?\s*([+-])\s*(\d+)/i);
    if (!match) return null;

    const value = Number(match[2]);
    return match[1] === "-" ? -value : value;
}

/**
 * Extracts persistent keyword labels that are presented as standalone effects.
 *
 * Keywords mentioned inside timed effect text are intentionally ignored. For
 * example, `[All Turns] This Digimon gains ＜Blocker＞.` is effect prose rather
 * than a standalone keyword line and must not add a field badge.
 */
export function extractStandaloneEffectKeywords(effect?: string | null): string[] {
    if (!effect) return [];

    const keywords = effect.split(/\r?\n/).flatMap((line) => {
        if (!standaloneKeywordLine.test(line)) return [];
        return Array.from(line.matchAll(keywordTag), (match) => match[1].trim())
            .filter(Boolean)
            .filter((keyword) => getSecurityAttackModifier(keyword) === null)
            .map(getFieldKeywordLabel);
    });

    return [...new Set(keywords)];
}

/** Returns the total modifier from standalone Security Attack keyword tags. */
export function extractStandaloneSecurityAttackModifier(effect?: string | null): number {
    if (!effect) return 0;

    return effect.split(/\r?\n/).reduce((total, line) => {
        if (!standaloneKeywordLine.test(line)) return total;

        return (
            total +
            Array.from(line.matchAll(keywordTag), (match) => getSecurityAttackModifier(match[1].trim()) ?? 0).reduce(
                (sum, modifier) => sum + modifier,
                0
            )
        );
    }, 0);
}
