package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.CardService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;

@Getter
@Service
@RequiredArgsConstructor
public class ChatService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> activeSessions = new HashSet<>();
    private final Set<String> connectedUsernames = new HashSet<>();

    private int totalSessionCount = 0;

    @Autowired
    private GameService gameService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.equals("") || deckService.getDeckById(activeDeck) == null) {
            session.sendMessage(new TextMessage("[NO_ACTIVE_DECK]"));
            return;
        }

        List<Card> deckCards = deckService.getDeckCardsById(activeDeck);
        if (deckCards.stream().anyMatch(c -> "1110101".equals(c.cardNumber()))) {
            session.sendMessage(new TextMessage("[BROKEN_DECK]"));
            return;
        }

        if (activeSessions.stream().anyMatch(s -> Objects.equals(Objects.requireNonNull(s.getPrincipal()).getName(), username))) {
            session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: You are already connected!"));
            return;
        }
        activeSessions.add(session);
        connectedUsernames.add(username);
        broadcastConnectedUsernames();
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: Join our Discord!"));
        session.sendMessage(new TextMessage("[USER_COUNT]:" + getTotalSessionCount()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        activeSessions.remove(session);
        connectedUsernames.remove(username);
        broadcastConnectedUsernames();
    }

    @Scheduled(fixedRate = 10000)
    private synchronized void sendHeartbeat() throws IOException {
        broadcastUserCount();
    }

    @Scheduled(fixedRate = 2000)
    private synchronized void sendReconnectInfo() throws IOException {
        checkForRejoinableRoom();
    }

    private void broadcastConnectedUsernames() throws IOException {
        String userListMessage = String.join(", ", connectedUsernames);
        for (WebSocketSession session : activeSessions) {
            session.sendMessage(new TextMessage(userListMessage));
        }
    }

    private void broadcastUserCount() throws IOException {
        for (WebSocketSession session : activeSessions) {
            session.sendMessage(new TextMessage("[USER_COUNT]:" + (getTotalSessionCount())));
        }
    }

    private void checkForRejoinableRoom() throws IOException {
        for (WebSocketSession session : activeSessions) {
            String matchingRoomId = gameService.gameRooms.keySet().stream()
                    .filter(roomId -> roomId.contains(Objects.requireNonNull(session.getPrincipal()).getName()))
                    .findFirst().orElse(null);
            if (matchingRoomId != null) session.sendMessage(new TextMessage("[RECONNECT_ENABLED]:" + matchingRoomId));
            else session.sendMessage(new TextMessage("[RECONNECT_DISABLED]"));
        }
    }

    private WebSocketSession getSessionByUsername(String username) {
        return activeSessions.stream()
                .filter(s -> username.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);
    }

    private int getTotalSessionCount() {
        totalSessionCount = activeSessions.size() + gameService.gameRooms.values().stream().mapToInt(Set::size).sum();
        return totalSessionCount;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String payload = message.getPayload();

        if (payload.equals("/heartbeat/")) return;

        if (payload.startsWith("/invite:")) {

            String invitedUsername = payload.substring(payload.indexOf(":") + 1).trim();

            if (connectedUsernames.contains(invitedUsername)) {
                WebSocketSession invitedSession = getSessionByUsername(invitedUsername);
                if (invitedSession != null) {
                    invitedSession.sendMessage(new TextMessage("[INVITATION]:" + username));
                }

                connectedUsernames.remove(username);
                connectedUsernames.remove(invitedUsername);
                broadcastConnectedUsernames();
            }
            return;
        }

        if (payload.startsWith("/abortInvite:")) {

            String invitedUsername = payload.substring(payload.indexOf(":") + 1).trim();
            WebSocketSession invitedSession = getSessionByUsername(invitedUsername);

            if (invitedSession != null) {
                invitedSession.sendMessage(new TextMessage("[INVITATION_ABORTED]"));
            }

            connectedUsernames.add(username);
            connectedUsernames.add(invitedUsername);
            broadcastConnectedUsernames();
            return;
        }

        if (payload.startsWith("/acceptInvite:")) {
            String invitingUsername = payload.substring(payload.indexOf(":") + 1).trim();
            WebSocketSession invitingSession = getSessionByUsername(invitingUsername);

            if (invitingSession != null) {
                invitingSession.sendMessage(new TextMessage("[INVITATION_ACCEPTED]:" + username));
            }

            connectedUsernames.add(username);
            connectedUsernames.add(invitingUsername);
            broadcastConnectedUsernames();
            return;
        }

        TextMessage textMessage = new TextMessage("[CHAT_MESSAGE]:" + username + ": " + payload);

        for (WebSocketSession webSocketSession : activeSessions) {
            webSocketSession.sendMessage(textMessage);
        }
    }
}
