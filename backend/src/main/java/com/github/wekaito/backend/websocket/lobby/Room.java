package com.github.wekaito.backend.websocket.lobby;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
class Room {
        private String id;

        @NotBlank
        private String name;

        private String hostName;

        private Format format;

        private String password; // null if no password

        private List<LobbyPlayer> players;
}
