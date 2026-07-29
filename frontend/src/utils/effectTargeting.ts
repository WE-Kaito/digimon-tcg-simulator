export type EffectTargetPayload = {
    sourceCardId: string;
    targetCardId: string;
    sourceLocation: string;
    targetLocation: string;
    timing: string;
    effectText: string;
};

export type EffectTargetEvent = EffectTargetPayload & {
    sender: string;
    sourceOwner: string;
    targetOwner: string;
    sourceName: string;
    targetName: string;
};

export function flipEffectLocation(location: string): string {
    if (location.startsWith("my")) return location.replace(/^my/, "opponent");
    if (location.startsWith("opponent")) return location.replace(/^opponent/, "my");
    return location;
}

export function orientEffectLocation(location: string, sender: string, currentUser: string): string {
    return sender === currentUser ? location : flipEffectLocation(location);
}

export function isSelfEffectTarget(event: EffectTargetPayload): boolean {
    return event.sourceCardId === event.targetCardId;
}

export function isSameSideEffectTarget(event: EffectTargetEvent): boolean {
    return event.sourceOwner === event.targetOwner;
}

export function getSameSideDirection(
    sourceLocation: string,
    targetLocation: string
): "left" | "right" | null {
    const sourceMatch = sourceLocation.match(/^(my|opponent)Digi(\d+)$/);
    const targetMatch = targetLocation.match(/^(my|opponent)Digi(\d+)$/);
    if (!sourceMatch || !targetMatch || sourceMatch[1] !== targetMatch[1]) return null;

    const sourceField = Number(sourceMatch[2]);
    const targetField = Number(targetMatch[2]);
    if (sourceField === targetField) return null;

    return targetField > sourceField ? "right" : "left";
}

export function formatEffectTargetMessage(event: EffectTargetEvent): string {
    return `${event.sourceOwner}'s ${event.sourceName} is targeting ${event.targetOwner}'s ${event.targetName} with [${event.timing}]: ${event.effectText}`;
}
