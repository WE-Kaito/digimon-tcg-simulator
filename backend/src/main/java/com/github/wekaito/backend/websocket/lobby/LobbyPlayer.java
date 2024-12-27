package com.github.wekaito.backend.websocket.lobby;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Getter
@Setter
public class LobbyPlayer {
    private WebSocketSession session;
    private String name;
    boolean ready;
}