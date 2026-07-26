package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.models.ChatMessage;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LobbyWebSocketTest {

    private MongoUserDetailsService userDetailsService;
    private LobbyWebSocket lobbyWebSocket;

    @BeforeEach
    void setUp() {
        userDetailsService = mock(MongoUserDetailsService.class);
        lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null);
    }

    @Test
    void blockedAuthorsAreMutedForTheBlockingUserOnly() throws Exception {
        TestSession author = new TestSession("blocked-user");
        TestSession blocker = new TestSession("blocking-user");
        TestSession otherUser = new TestSession("other-user");
        when(userDetailsService.getBlockedAccounts("blocking-user")).thenReturn(List.of("blocked-user"));
        when(userDetailsService.getBlockedAccounts("blocked-user")).thenReturn(List.of());
        when(userDetailsService.getBlockedAccounts("other-user")).thenReturn(List.of());
        lobbyWebSocket.getGlobalActiveSessions().addAll(
                List.of(author.session(), blocker.session(), otherUser.session())
        );

        lobbyWebSocket.handleTextMessage(author.session(), new TextMessage("/chatMessage:hidden message"));

        assertFalse(hasChatMessage(blocker, "hidden message"));
        assertTrue(hasChatMessage(author, "hidden message"));
        assertTrue(hasChatMessage(otherUser, "hidden message"));
    }

    @Test
    void blockedAuthorsAreRemovedFromChatHistoryButServerMessagesRemain() {
        TestSession blocker = new TestSession("blocking-user");
        when(userDetailsService.getBlockedAccounts("blocking-user")).thenReturn(List.of("blocked-user"));
        lobbyWebSocket.getGlobalChatMessages().clear();
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("hidden message", "blocked-user"));
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("visible message", "other-user"));
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("server message", "【SERVER】"));

        List<ChatMessage> visibleMessages = lobbyWebSocket.getVisibleGlobalChatMessages(blocker.session());

        assertEquals(2, visibleMessages.size());
        assertFalse(visibleMessages.stream().anyMatch(message -> message.author().equals("blocked-user")));
        assertTrue(visibleMessages.stream().anyMatch(message -> message.author().equals("other-user")));
        assertTrue(visibleMessages.stream().anyMatch(message -> message.author().equals("【SERVER】")));
    }

    private boolean hasChatMessage(TestSession session, String message) {
        return session.messages().stream()
                .anyMatch(payload -> payload.startsWith("[CHAT_MESSAGE]:") && payload.contains(message));
    }

    private record TestSession(WebSocketSession session, List<String> messages) {
        TestSession(String username) {
            this(createSession(username));
        }

        private TestSession(SessionFixture fixture) {
            this(fixture.session(), fixture.messages());
        }

        private static SessionFixture createSession(String username) {
            List<String> messages = new ArrayList<>();
            Principal principal = () -> username;
            WebSocketSession session = (WebSocketSession) Proxy.newProxyInstance(
                    WebSocketSession.class.getClassLoader(),
                    new Class<?>[]{WebSocketSession.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "getPrincipal" -> principal;
                        case "isOpen" -> true;
                        case "sendMessage" -> {
                            WebSocketMessage<?> message = (WebSocketMessage<?>) args[0];
                            messages.add(message.getPayload().toString());
                            yield null;
                        }
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> null;
                    }
            );
            return new SessionFixture(session, messages);
        }
    }

    private record SessionFixture(WebSocketSession session, List<String> messages) {}
}
