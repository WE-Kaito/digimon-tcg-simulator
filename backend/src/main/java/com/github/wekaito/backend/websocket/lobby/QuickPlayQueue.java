package com.github.wekaito.backend.websocket.lobby;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;

public class QuickPlayQueue {
    private final List<WebSocketSession> queue = new ArrayList<>();

    public synchronized void add(WebSocketSession session) {
        if (!queue.contains(session)) queue.add(session);
    }

    public synchronized void remove(WebSocketSession session) {
        queue.remove(session);
    }

    public synchronized boolean isEmpty() {
        return queue.isEmpty();
    }

    public synchronized int size() {
        return queue.size();
    }

    /**
     * Returns a pair of randomly selected sessions (and removes them from the queue), or null if fewer than 2 players exist.
     */
    public synchronized List<WebSocketSession> drawRandomPair() {
        if (queue.size() < 2) return null;

        // Shuffle the queue to ensure randomness
        Collections.shuffle(queue);

        WebSocketSession player1 = queue.remove(0);
        WebSocketSession player2 = queue.remove(0);

        return Arrays.asList(player1, player2);
    }
}

