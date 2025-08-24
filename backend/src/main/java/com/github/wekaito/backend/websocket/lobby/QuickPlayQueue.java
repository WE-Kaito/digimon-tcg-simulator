package com.github.wekaito.backend.websocket.lobby;

import java.util.ArrayList;
import java.util.List;

import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.function.Supplier;
import java.util.function.Function;

public class QuickPlayQueue {
    private final List<WebSocketSession> queue = new ArrayList<>();
    @Setter
    private Supplier<List<String>> filteredUsernamesSupplier;
    @Setter
    private Function<String, List<String>> blockedAccountsSupplier;

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

        // Try to find a pair that don't have each other blocked
        for (int i = 0; i < eligiblePlayers.size(); i++) {
            WebSocketSession player1 = eligiblePlayers.get(i);
            String player1Username = Objects.requireNonNull(player1.getPrincipal()).getName();
            
            for (int j = i + 1; j < eligiblePlayers.size(); j++) {
                WebSocketSession player2 = eligiblePlayers.get(j);
                String player2Username = Objects.requireNonNull(player2.getPrincipal()).getName();
                
                // Check if players have blocked each other
                boolean player1BlockedPlayer2 = false;
                boolean player2BlockedPlayer1 = false;
                
                if (blockedAccountsSupplier != null) {
                    List<String> player1BlockedAccounts = blockedAccountsSupplier.apply(player1Username);
                    List<String> player2BlockedAccounts = blockedAccountsSupplier.apply(player2Username);
                    
                    player1BlockedPlayer2 = player1BlockedAccounts.contains(player2Username);
                    player2BlockedPlayer1 = player2BlockedAccounts.contains(player1Username);
                }
                
                // If neither has blocked the other, we can match them
                if (!player1BlockedPlayer2 && !player2BlockedPlayer1) {
                    // Remove the selected players from the queue
                    queue.remove(player1);
                    queue.remove(player2);
                    
                    return Arrays.asList(player1, player2);
                }
            }
        }
        
        // If no valid pair found, return null
        return null;
    }
}

