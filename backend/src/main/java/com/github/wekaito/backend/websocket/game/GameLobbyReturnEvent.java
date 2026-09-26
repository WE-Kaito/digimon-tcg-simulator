package com.github.wekaito.backend.websocket.game;

import java.util.Set;

public record GameLobbyReturnEvent(
        String returningUsername,
        Set<String> disconnectedUsernames
) {
}
