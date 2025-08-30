package com.github.wekaito.backend.websocket.game.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@RequiredArgsConstructor
public class GameRoom {
    private final Set<WebSocketSession> sessions = new HashSet<>();
    private final String roomId;
    private final Player player1;
    private final Player player2;
    private BoardState boardState;
    private String[] chat;
    int bootStage = 0; // 0 = CLEAR, 1 = SHOW_STARTING_PLAYER, 2 = MULLIGAN, 3 = MULLIGAN, 4 = GAME_START


    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }
    
    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }
    
    public boolean hasFullConnection() {
        return sessions.size() >= 2;
    }
    
    public boolean isEmpty() {
        return sessions.isEmpty();
    }
}
