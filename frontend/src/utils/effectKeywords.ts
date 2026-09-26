const standaloneKeywordLine = /^\s*(?:＜[^＞\r\n]+＞[\s.,;:]*)+$/;
const keywordTag = /＜([^＞\r\n]+)＞/g;

export function supportsAutoDetectedEffectKeywords(cardType: string): boolean {
    return cardType.split("/", 1)[0].trim() === "Digimon";
}

function getFieldKeywordLabel(keyword: string): string {
    if (/^Decode(?:\s|\(|$)/i.test(keyword)) return "Decode";
    if (/^Succession(?:\s|\(|$)/i.test(keyword)) return "Succession";
    return keyword;
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
            .map(getFieldKeywordLabel);
    });

    return [...new Set(keywords)];
}
