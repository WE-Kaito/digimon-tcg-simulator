import { AttackDragSnapshot, Phase } from "./types.ts";

export function isAttackIntent(snapshot: AttackDragSnapshot): boolean {
    const isDigimon = snapshot.cardType
        .split("/")
        .map((type) => type.trim())
        .includes("Digimon");

    return (
        snapshot.sourceLocation.startsWith("myDigi") &&
        snapshot.isMyTurn &&
        snapshot.phase === Phase.MAIN &&
        isDigimon &&
        (snapshot.isSuspended || snapshot.digimonNumber === "BT12-083")
    );
}
