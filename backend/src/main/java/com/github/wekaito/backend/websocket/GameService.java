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
    public void afterConnectionEstablished(WebSocketSession session){
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status){
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
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);
        if (gameRoom != null) {
            TextMessage textMessage = new TextMessage(payload);
            for (WebSocketSession webSocketSession : gameRoom) {
                webSocketSession.sendMessage(textMessage);
            }
        }
    }

    void setUpGame(WebSocketSession session, String gameId) throws IOException{
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

}
