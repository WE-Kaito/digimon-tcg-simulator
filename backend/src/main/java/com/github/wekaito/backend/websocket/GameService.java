package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.Deck;
import com.github.wekaito.backend.ProfileService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GameService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;

    private final ProfileService profileService;
    private final Map<String, Set<WebSocketSession>> gameRooms = new HashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        Set<WebSocketSession> gameRoom = gameRooms.values().stream()
                .filter(s -> s.stream().anyMatch(s1 -> username.equals(Objects.requireNonNull(s1.getPrincipal()).getName())))
                .findFirst().orElse(null);

        if (gameRoom == null) return;

        WebSocketSession opponentSession = null;
        Iterator<WebSocketSession> iterator = gameRoom.iterator();
        while (iterator.hasNext()) {
            WebSocketSession webSocketSession = iterator.next();
            if (webSocketSession != null) {
                if (webSocketSession.getPrincipal().getName().equals(username)) {
                    opponentSession = gameRoom.stream()
                            .filter(s -> !username.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                            .findFirst().orElse(null);

                    if (opponentSession != null && opponentSession.isOpen()) {
                        opponentSession.sendMessage(new TextMessage("[PLAYER_LEFT]"));
                    }
                    break;
                }
            }
        }

        gameRoom.remove(session);
        if (opponentSession != null) {
            gameRoom.remove(opponentSession);
        }

        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        String[] parts = payload.split(":", 2);

        if (payload.startsWith("/startGame:")) {
            String gameId = parts[1].trim();
            setUpGame(session, gameId);
            return;
        }

        String gameId = parts[0];
        String command = parts[1];
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);
        if (gameRoom == null) return;

        if (command.startsWith("/surrender:")) {
            handleSurrender(session, gameRoom, command);
            return;
        }

        TextMessage textMessage = new TextMessage(payload);
        for (WebSocketSession webSocketSession : gameRoom) {
            webSocketSession.sendMessage(textMessage);
        }
    }


    void setUpGame(WebSocketSession session, String gameId) throws IOException {
        Set<WebSocketSession> gameRoom = gameRooms.computeIfAbsent(gameId, key -> new HashSet<>());
        gameRoom.add(session);

        String user1 = gameId.split("_")[0];
        String user2 = gameId.split("_")[1];

        Card[] deck1 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user1)).cards();
        Card[] deck2 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user2)).cards();

        String avatar1 = mongoUserDetailsService.getAvatar(user1);
        String avatar2 = mongoUserDetailsService.getAvatar(user2);

        Player player1 = new Player(user1, avatar1, deck1);
        Player player2 = new Player(user2, avatar2, deck2);

        Player[] players = {player1, player2};
        String playersJson = new ObjectMapper().writeValueAsString(players);
        TextMessage textMessage = new TextMessage("[START_GAME]:" + playersJson);

        session.sendMessage(textMessage);
    }

    void handleSurrender(WebSocketSession session, Set<WebSocketSession> gameRoom, String command) throws IOException {
        String opponentName = command.split(":")[1].trim();
        WebSocketSession opponentSession = gameRoom.stream()
                .filter(s -> opponentName.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);

        if (opponentSession != null && opponentSession.isOpen()) {
            opponentSession.sendMessage(new TextMessage("[SURRENDER]"));
        }

        gameRoom.remove(session);
        gameRoom.remove(opponentSession);

        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }

}
