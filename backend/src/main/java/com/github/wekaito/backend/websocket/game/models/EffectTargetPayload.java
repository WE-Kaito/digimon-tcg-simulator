package com.github.wekaito.backend.websocket.game.models;

public record EffectTargetPayload(
        String sourceCardId,
        String effectSourceCardId,
        String targetCardId,
        String sourceLocation,
        String targetLocation,
        String timing,
        String effectText
) {
}
