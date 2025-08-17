package com.github.wekaito.backend.websocket.lobby;

import java.util.ArrayList;
import java.util.List;

import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.function.Supplier;

public class QuickPlayQueue {
    private final List<WebSocketSession> queue = new ArrayList<>();
    @Setter
    private Supplier<List<String>> filteredUsernamesSupplier;

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
     * Filtered users are excluded from matching but remain in the queue.
     */
    public synchronized List<WebSocketSession> drawRandomPair() {
        if (queue.size() < 2) return null;

        List<String> filteredUsernames = filteredUsernamesSupplier != null ? 
            filteredUsernamesSupplier.get() : Collections.emptyList();

        // Create a list of non-filtered players
        List<WebSocketSession> eligiblePlayers = new ArrayList<>();
        for (WebSocketSession session : queue) {
            String username = Objects.requireNonNull(session.getPrincipal()).getName();
            if (!filteredUsernames.contains(username)) {
                eligiblePlayers.add(session);
            }
        }

        if (eligiblePlayers.size() < 2) return null;

        // Shuffle the eligible players to ensure randomness
        Collections.shuffle(eligiblePlayers);

        WebSocketSession player1 = eligiblePlayers.get(0);
        WebSocketSession player2 = eligiblePlayers.get(1);

        // Remove the selected players from the queue
        queue.remove(player1);
        queue.remove(player2);

        return Arrays.asList(player1, player2);
    }
}

