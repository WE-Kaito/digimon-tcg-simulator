package com.github.wekaito.backend.websocket.lobby;

import java.util.List;

public record RoomDTO(
        String id,

        String name,

        String hostName,

        boolean restrictionsApplied,

        boolean hasPassword,

        List<LobbyPlayerDTO> players
) {
}
