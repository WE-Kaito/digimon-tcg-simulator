package com.github.wekaito.backend.websocket;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    private ChatService chatService;
    private WebSocketSession session1;
    private WebSocketSession session2;
    private WebSocketSession session3;

    @BeforeEach
    void setUp() {
        chatService = new ChatService();

        session1 = createMockSession("testUser1");
        session2 = createMockSession("testUser2");
        session3 = createMockSession("testUser3");
    }

    private WebSocketSession createMockSession(String username) {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getPrincipal()).thenReturn(() -> username);
        return session;
    }

    @AfterEach
    void tearDown() {
        chatService = null;
    }

    @Test
    @DirtiesContext
    void testConnection() {
        WebSocketSession session = createMockSession("testUser");
        chatService.afterConnectionEstablished(session);

        Set<WebSocketSession> activeSessions = new HashSet<>();
        activeSessions.add(session);

        assertThat(chatService.getActiveSessions()).isEqualTo(activeSessions);
        assertThat(chatService.getConnectedUsernames()).contains("testUser");

        chatService.afterConnectionClosed(session, CloseStatus.NORMAL);
        assertThat(chatService.getActiveSessions()).isEmpty();
        assertThat(chatService.getConnectedUsernames()).isEmpty();
    }

    @Test
    @DirtiesContext
    void testBroadcastConnectedUsernames() throws Exception {
        chatService.afterConnectionEstablished(session1);
        chatService.afterConnectionEstablished(session2);
        chatService.afterConnectionEstablished(session3);

        Set<WebSocketSession> activeSessions = new HashSet<>();
        activeSessions.add(session1);
        activeSessions.add(session2);
        activeSessions.add(session3);

        String userListMessage = String.join(", ", chatService.getConnectedUsernames());
        TextMessage message = new TextMessage(userListMessage);

        for (WebSocketSession session : activeSessions) {
            // broadcastConnectedUsernames() is called in afterConnectionEstablished()
            verify(session, times(1)).sendMessage(message);
        }
    }
}
