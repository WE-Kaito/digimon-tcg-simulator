package com.github.wekaito.backend.websocket.lobby;

import jakarta.validation.constraints.NotBlank;
import org.springframework.web.socket.WebSocketSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;

final class Room {
    enum State { LOBBY, STARTING, GAME, RETURNING }

    private final String id;
    @NotBlank private final String name;
    private String hostName;
    private final boolean restrictionsApplied;
    private final String password;
    private final List<LobbyPlayer> players = new ArrayList<>();
    private final Map<String, Long> connectionGenerations = new HashMap<>();
    private State state = State.LOBBY;
    private long version;

    Room(String id, String name, String hostName, boolean restrictionsApplied, String password,
         List<LobbyPlayer> initialPlayers) {
        this.id = id;
        this.name = name;
        this.hostName = hostName;
        this.restrictionsApplied = restrictionsApplied;
        this.password = password;
        Map<String, LobbyPlayer> uniquePlayers = new java.util.LinkedHashMap<>();
        initialPlayers.forEach(player -> uniquePlayers.put(player.getName(), player));
        uniquePlayers.values().forEach(player -> {
            long generation = connectionGenerations.merge(player.getName(), 1L, Long::sum);
            players.add(new LobbyPlayer(player.getSession(), player.getName(), player.isReady(), generation));
        });
        version++;
    }

    String getId() { return id; }
    String getName() { return name; }
    synchronized String getHostName() { return hostName; }
    synchronized void setHostName(String hostName) { this.hostName = hostName; version++; }
    boolean isRestrictionsApplied() { return restrictionsApplied; }
    String getPassword() { return password; }
    synchronized State getState() { return state; }
    synchronized long getVersion() { return version; }

    synchronized List<LobbyPlayer> getPlayers() {
        return players.stream()
                .map(player -> new LobbyPlayer(
                        player.getSession(), player.getName(), player.isReady(), player.getGeneration()))
                .toList();
    }
    synchronized int playerCount() { return players.size(); }
    synchronized boolean hasPlayers() { return !players.isEmpty(); }

    synchronized LobbyPlayer replacePlayer(WebSocketSession session, String username, boolean ready) {
        players.removeIf(player -> Objects.equals(player.getName(), username));
        long generation = connectionGenerations.merge(username, 1L, Long::sum);
        LobbyPlayer replacement = new LobbyPlayer(session, username, ready, generation);
        players.add(replacement);
        version++;
        return replacement;
    }

    synchronized boolean removePlayers(Predicate<LobbyPlayer> predicate) {
        boolean changed = players.removeIf(predicate);
        if (changed) version++;
        return changed;
    }

    synchronized LobbyPlayer toggleReady(WebSocketSession session) {
        LobbyPlayer player = players.stream()
                .filter(candidate -> candidate.getSession().equals(session))
                .findFirst().orElse(null);
        if (player == null) return null;
        player.ready = !player.isReady();
        version++;
        return new LobbyPlayer(player.getSession(), player.getName(), player.isReady(), player.getGeneration());
    }

    synchronized void replacePlayers(List<LobbyPlayer> replacements) {
        players.clear();
        replacements.forEach(player -> {
            long generation = connectionGenerations.merge(player.getName(), 1L, Long::sum);
            players.add(new LobbyPlayer(player.getSession(), player.getName(), player.isReady(), generation));
        });
        version++;
    }

    synchronized List<LobbyPlayer> clearPlayers() {
        List<LobbyPlayer> snapshot = List.copyOf(players);
        if (!players.isEmpty()) { players.clear(); version++; }
        return snapshot;
    }

    synchronized boolean transition(State expected, State next) {
        if (state != expected) return false;
        state = next;
        version++;
        return true;
    }

    synchronized void returnToLobby() {
        if (state == State.LOBBY) return;
        state = State.RETURNING;
        version++;
        state = State.LOBBY;
        version++;
    }
}
