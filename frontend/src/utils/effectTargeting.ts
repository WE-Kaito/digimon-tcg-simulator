export type EffectTargetPayload = {
    sourceCardId: string;
    effectSourceCardId?: string | null;
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
    effectSourceName?: string | null;
    targetName: string;
};

const MY_TAMER_OPTION_FIELDS = ["myDigi17", "myDigi18", "myDigi19", "myDigi20", "myDigi21"];

export function findOptionPlacementField(
    sourceCard: { cardNumber: string },
    getFieldCards: (field: string) => Array<{ cardType: string; cardNumber: string }>
): string | undefined {
    const matchingField = MY_TAMER_OPTION_FIELDS.find((field) =>
        getFieldCards(field).some(
            (fieldCard) => fieldCard.cardType.includes("Option") && fieldCard.cardNumber === sourceCard.cardNumber
        )
    );
    return matchingField ?? MY_TAMER_OPTION_FIELDS.find((field) => getFieldCards(field).length === 0);
}

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
    const target = isSelfEffectTarget(event)
        ? "itself"
        : `${event.targetOwner}'s ${event.targetName}`;
    const action = event.effectSourceName
        ? `is using ${event.effectSourceName} to target`
        : "is targeting";
    if (event.sourceLocation === "myHand") {
        return `${event.sourceOwner} is using ${event.sourceName} from hand to target ${target} with [${event.timing}]: ${event.effectText}`;
    }
    return `${event.sourceOwner}'s ${event.sourceName} ${action} ${target} with [${event.timing}]: ${event.effectText}`;
}
