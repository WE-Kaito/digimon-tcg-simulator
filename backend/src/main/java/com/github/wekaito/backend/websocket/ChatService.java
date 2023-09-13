package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Getter
@Service
@RequiredArgsConstructor
public class ChatService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;

    private Set<WebSocketSession> activeSessions = new HashSet<>();
    private Set<String> connectedUsernames = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.equals("") || deckService.getDeckById(activeDeck) == null){
            session.sendMessage(new TextMessage("[NO_ACTIVE_DECK]"));
            return;
        }
        activeSessions.add(session);
        connectedUsernames.add(username);
        broadcastConnectedUsernames();
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: Join our Discord!"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        activeSessions.remove(session);
        connectedUsernames.remove(username);

        broadcastConnectedUsernames();
    }

    @Scheduled(fixedRate = 10000)
    public synchronized void sendHeartbeat() {
        for (WebSocketSession session : activeSessions) {
            try {
                session.sendMessage(new TextMessage("[HEARTBEAT]"));
                broadcastConnectedUsernames();
            } catch (IOException e) {
                e.getCause();
            }
        }
    }

    void broadcastConnectedUsernames() throws IOException {
        String userListMessage = String.join(", ", connectedUsernames);
        TextMessage message = new TextMessage(userListMessage);

        for (WebSocketSession session : activeSessions) {
            session.sendMessage(message);
        }
    }

    WebSocketSession getSessionByUsername(String username){
        return activeSessions.stream()
                .filter(s -> username.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);
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
                invitingSession.sendMessage(new TextMessage("[INVITATION_ACCEPTED]:"+username));
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
