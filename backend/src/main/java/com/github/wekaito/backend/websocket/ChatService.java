package com.github.wekaito.backend.websocket;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Service
public class ChatService extends TextWebSocketHandler {

    private final Set<WebSocketSession> activeSessions = new HashSet<>();
    private final Set<String> connectedUsernames = new HashSet<>();

    public Set<WebSocketSession> getActiveSessions() {
        return activeSessions;
    }

    public Set<String> getConnectedUsernames() {
        return connectedUsernames;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        activeSessions.add(session);
        connectedUsernames.add(username);

        broadcastConnectedUsernames();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        activeSessions.remove(session);
        connectedUsernames.remove(username);

        broadcastConnectedUsernames();
    }

    void broadcastConnectedUsernames() {
        String userListMessage = String.join(", ", connectedUsernames);
        TextMessage message = new TextMessage(userListMessage);

        for (WebSocketSession session : activeSessions) {
            try {
                session.sendMessage(message);
            } catch (IOException e) {
                e.getCause();
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String payload = message.getPayload();

        TextMessage textMessage = new TextMessage("CHAT_MESSAGE:" + username + ": " + payload);

        for (WebSocketSession webSocketSession : activeSessions) {
                webSocketSession.sendMessage(textMessage);
        }
    }
}
