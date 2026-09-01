package com.github.wekaito.backend.websocket.lobby;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

@Getter
@Setter
public class LobbyPlayer {
    private WebSocketSession session;
    private String name;
    boolean ready;
    private final long generation;

    public LobbyPlayer(WebSocketSession session, String name, boolean ready) {
        this(session, name, ready, 0);
    }

    public LobbyPlayer(WebSocketSession session, String name, boolean ready, long generation) {
        this.session = session;
        this.name = name;
        this.ready = ready;
        this.generation = generation;
    }
}
