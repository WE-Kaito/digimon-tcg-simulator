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

export function formatEffectTargetMessage(event: EffectTargetEvent): string {
    return `${event.sourceOwner}'s ${event.sourceName} is targeting ${event.targetOwner}'s ${event.targetName} with [${event.timing}]: ${event.effectText}`;
}
