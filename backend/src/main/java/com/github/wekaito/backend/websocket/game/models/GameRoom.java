package com.github.wekaito.backend.websocket.game.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Setter
@Getter
@RequiredArgsConstructor
public class GameRoom {
    private final Set<WebSocketSession> sessions = new HashSet<>();
    private final String roomId;
    private final Player player1;
    private final Player player2;

    private BoardState boardState = null;
    private String[] chat;
    int bootStage = 0; // 0 = CLEAR, 1 = SHOW_STARTING_PLAYER, 2 = MULLIGAN, 3 = MULLIGAN, 4 = GAME_START
    private Phase phase = Phase.BREEDING;
    private String usernameTurn;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }
    
    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }
    
    public boolean hasFullConnection() {
        return getOpenSessionCount() >= 2;
    }
    
    public boolean isEmpty() {
        return getOpenSessionCount() == 0;
    }
    
    private long getOpenSessionCount() {
        return sessions.stream().filter(WebSocketSession::isOpen).count();
    }

    public void progressPhase() {
        if (phase == Phase.UNSUSPEND) phase = Phase.DRAW;
        else if (phase == Phase.DRAW) phase = Phase.BREEDING;
        else if (phase == Phase.BREEDING) phase = Phase.MAIN;
        else if (phase == Phase.MAIN) {
            phase = Phase.UNSUSPEND;
            usernameTurn = usernameTurn.equals(player1.username()) ? player2.username() : player1.username();
        }
    }

    public void shutdownScheduler() {
        scheduler.shutdownNow(); // important to stop any scheduled tasks when the room is closed
    }

    public void sendMessagesToAll(String message) {
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                try {
                    s.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Session is broken, will be cleaned up by the cleanup scheduler
                }
            }
        }
    }

    public void sendMessageToOtherSessions(WebSocketSession sender, String message) {
        for (WebSocketSession s : sessions) {
            if (s.isOpen() && !s.getId().equals(sender.getId())) {
                try {
                    s.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Session is broken, will be cleaned up by the cleanup scheduler
                }
            }
        }
    }

    @Scheduled(fixedRate = 5000)
    private void sendHeartbeat() {
        sendMessagesToAll("[HEARTBEAT]");
    }
}

enum Phase {
    UNSUSPEND,
    DRAW,
    BREEDING,
    MAIN,
}
