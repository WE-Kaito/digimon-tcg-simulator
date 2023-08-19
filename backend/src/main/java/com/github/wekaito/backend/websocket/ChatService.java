package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.Deck;
import com.github.wekaito.backend.ProfileService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Getter
@Service
@RequiredArgsConstructor
public class ChatService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;
    private final ProfileService profileService;

    private Set<WebSocketSession> activeSessions = new HashSet<>();
    private Set<String> connectedUsernames = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        if (mongoUserDetailsService.getActiveDeck(username).equals("")){
            List<Deck> decks = profileService.getDecks();
            if (decks.isEmpty()){
                session.sendMessage(new TextMessage("[NO_DECK_FOUND]"));
                return;
            }
            mongoUserDetailsService.setActiveDeck(decks.get(0).id());
        }

        activeSessions.add(session);
        connectedUsernames.add(username);

        broadcastConnectedUsernames();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        activeSessions.remove(session);
        connectedUsernames.remove(username);

        broadcastConnectedUsernames();
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
