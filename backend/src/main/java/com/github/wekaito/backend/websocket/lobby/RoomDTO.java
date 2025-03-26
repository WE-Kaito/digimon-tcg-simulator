package com.github.wekaito.backend.websocket.lobby;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record RoomDTO(
        String id,

        @NotBlank
        String name,

        String hostName,

        @NotBlank
        Format format,

        boolean hasPassword,

        List<LobbyPlayerDTO> players
) {
}
