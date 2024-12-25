package com.github.wekaito.backend.websocket.lobby;

public record LobbyPlayerDTO(
        String name,
        String avatarName,
        boolean ready
) {
}
