package com.github.wekaito.backend.websocket.lobby;

import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.function.Function;

public class QuickPlayQueue {
    private final List<WebSocketSession> queue = new ArrayList<>();

    @Setter
    private Function<String, List<String>> blockedAccountsSupplier;

    public synchronized void add(WebSocketSession session) {
        if (session != null && !queue.contains(session)) {
            queue.add(session);
        }
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
     * Returns a pair of randomly selected sessions (and removes them from the queue),
     * or null if fewer than 2 players exist or no valid pair is found.
     */
    public synchronized List<WebSocketSession> drawRandomPair() {
        if (queue.size() < 2) return null;

        // Shuffle to avoid bias and reduce O(n^2) scanning pressure
        List<WebSocketSession> shuffled = new ArrayList<>(queue);
        Collections.shuffle(shuffled);

        for (int i = 0; i < shuffled.size(); i++) {
            WebSocketSession player1 = shuffled.get(i);
            String player1Username = getSafeUsername(player1);
            if (player1Username == null) continue;

            for (int j = i + 1; j < shuffled.size(); j++) {
                WebSocketSession player2 = shuffled.get(j);
                String player2Username = getSafeUsername(player2);
                if (player2Username == null) continue;

                if (!areBlocked(player1Username, player2Username)) {
                    // Found a match → remove them from the real queue
                    queue.remove(player1);
                    queue.remove(player2);
                    return Arrays.asList(player1, player2);
                }
            }
        }

        // No valid pair found
        return null;
    }

    // --- Helper Methods ---

    private String getSafeUsername(WebSocketSession session) {
        try {
            return (session != null && session.getPrincipal() != null)
                    ? session.getPrincipal().getName()
                    : null;
        } catch (Exception e) {
            return null;
        }
    }

    private boolean areBlocked(String user1, String user2) {
        if (blockedAccountsSupplier == null) return false;

        List<String> user1Blocked = Optional.ofNullable(blockedAccountsSupplier.apply(user1))
                .orElse(Collections.emptyList());
        List<String> user2Blocked = Optional.ofNullable(blockedAccountsSupplier.apply(user2))
                .orElse(Collections.emptyList());

        return user1Blocked.contains(user2) || user2Blocked.contains(user1);
    }
}
