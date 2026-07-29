package com.github.wekaito.backend.websocket.game.models;

public record EffectTargetEvent(
        String sender,
        String sourceCardId,
        String targetCardId,
        String sourceLocation,
        String targetLocation,
        String sourceOwner,
        String targetOwner,
        String sourceName,
        String targetName,
        String timing,
        String effectText
) {
}
