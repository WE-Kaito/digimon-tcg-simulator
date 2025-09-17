package com.github.wekaito.backend.websocket.game.models;

import java.util.List;

public record Modifiers(
        Integer plusDp,
        Integer plusSecurityAttacks,
        List<String> keywords,
        List<String> colors
) {
}
