//package com.github.wekaito.backend.websocket;
//
//import com.github.wekaito.backend.models.Deck;
//import com.github.wekaito.backend.DeckService;
//import com.github.wekaito.backend.security.MongoUserDetailsService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.springframework.test.annotation.DirtiesContext;
//import org.springframework.test.context.junit.jupiter.SpringExtension;
//import org.springframework.web.socket.CloseStatus;
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.WebSocketSession;
//
//import java.io.IOException;
//import java.util.ArrayList;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(SpringExtension.class)
//class LobbyServiceTest {
//
//    @Mock
//    private MongoUserDetailsService mongoUserDetailsService;
//    @Mock
//    private DeckService deckService;
//    @InjectMocks
//    private ChatService chatService;
//    private WebSocketSession session1;
//    private WebSocketSession session2;
//    private WebSocketSession session3;
//
//    Deck exampleDeck = new Deck("12345", "New Deck", "Red", new ArrayList<>(List.of("BT1-010", "BT1-010")), "authorId");
//
//    private WebSocketSession createMockSession(String username) {
//        WebSocketSession session = mock(WebSocketSession.class);
//        when(session.getPrincipal()).thenReturn(() -> username);
//        return session;
//    }
//
//    @BeforeEach
//    void setUp() {
//        chatService = new ChatService(mongoUserDetailsService, deckService);
//
//        session1 = createMockSession("testUser1");
//        session2 = createMockSession("testUser2");
//        session3 = createMockSession("testUser3");
//
//        when(mongoUserDetailsService.getActiveDeck(any())).thenReturn("12345");
//        when(deckService.getDeckById("12345")).thenReturn(exampleDeck);
//    }
//
//    @Test
//    @DirtiesContext
//    void testNoDeck_whenNoActiveDeck() throws IOException {
//        when(mongoUserDetailsService.getActiveDeck(any())).thenReturn("");
//        chatService.afterConnectionEstablished(session1);
//        verify(session1).sendMessage(new TextMessage("[NO_ACTIVE_DECK]"));
//    }
//
//    @Test
//    @DirtiesContext
//    void testNoDeck_whenDeckDoesNotExist() throws IOException {
//        when(deckService.getDeckById("12345")).thenReturn(null);
//        chatService.afterConnectionEstablished(session1);
//        verify(session1).sendMessage(new TextMessage("[NO_ACTIVE_DECK]"));
//    }
//
//    @Test
//    @DirtiesContext
//    void testConnection() throws IOException {
//        chatService.afterConnectionEstablished(session1);
//
//        Set<WebSocketSession> activeSessions = new HashSet<>();
//        activeSessions.add(session1);
//
//        assertThat(chatService.getActiveSessions()).isEqualTo(activeSessions);
//        assertThat(chatService.getConnectedUsernames()).contains("testUser1");
//
//        chatService.afterConnectionClosed(session1, CloseStatus.NORMAL);
//        assertThat(chatService.getActiveSessions()).isEmpty();
//        assertThat(chatService.getConnectedUsernames()).isEmpty();
//    }
//
//    @Test
//    @DirtiesContext
//    void testBroadcastConnectedUsernames() throws Exception {
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//        chatService.afterConnectionEstablished(session3);
//
//        Set<WebSocketSession> activeSessions = new HashSet<>();
//        activeSessions.add(session1);
//        activeSessions.add(session2);
//        activeSessions.add(session3);
//
//        String userListMessage = String.join(", ", chatService.getConnectedUsernames());
//        TextMessage message = new TextMessage(userListMessage);
//
//        for (WebSocketSession session : activeSessions) {
//            // broadcastConnectedUsernames() is called in afterConnectionEstablished()
//            verify(session, times(1)).sendMessage(message);
//        }
//    }
//
//    @Test
//    @DirtiesContext
//    void testHandleTextMessage_ChatMessage() throws Exception {
//        TextMessage incomingMessage1 = new TextMessage("Hello!");
//        TextMessage incomingMessage2 = new TextMessage("Test message.");
//        TextMessage heartbeatMessage = new TextMessage("/heartbeat/");
//
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//
//        chatService.handleTextMessage(session1, incomingMessage1);
//        chatService.handleTextMessage(session2, incomingMessage2);
//        chatService.handleTextMessage(session1, heartbeatMessage);
//
//        TextMessage outgoingMessage1 = new TextMessage("[CHAT_MESSAGE]:testUser1: Hello!");
//        TextMessage outgoingMessage2 = new TextMessage("[CHAT_MESSAGE]:testUser2: Test message.");
//
//        verify(session1, times(1)).sendMessage(outgoingMessage1);
//        verify(session2, times(1)).sendMessage(outgoingMessage2);
//        verify(session3, never()).sendMessage(any());
//    }
//
//    @Test
//    void testInviteUser() throws IOException {
//        // GIVEN
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//        TextMessage message = new TextMessage("/invite:testUser2");
//        TextMessage messageReceived = new TextMessage("[INVITATION]:testUser1");
//
//        // WHEN
//        chatService.handleTextMessage(session1, message);
//        chatService.handleTextMessage(session1, message);
//
//        // THEN
//        assertThat(chatService.getConnectedUsernames()).isEmpty();
//        verify(session2, times(1)).sendMessage(messageReceived);
//    }
//
//    @Test
//    void testAbortInvitation() throws IOException {
//        // GIVEN
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//        TextMessage message = new TextMessage("/abortInvite:testUser1");
//        TextMessage messageReceived = new TextMessage("[INVITATION_ABORTED]");
//
//        // WHEN
//        chatService.handleTextMessage(session2, message);
//
//        // THEN
//        assertThat(chatService.getConnectedUsernames()).contains("testUser1").contains("testUser2");
//        verify(session1, times(1)).sendMessage(messageReceived);
//    }
//
//    @Test
//    void testAcceptInvite() throws IOException {
//        // GIVEN
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//        TextMessage message = new TextMessage("/acceptInvite:testUser1");
//        TextMessage expectedMessage = new TextMessage("[INVITATION_ACCEPTED]:testUser2");
//
//        // WHEN
//        chatService.handleTextMessage(session2, message);
//
//        // THEN
//        verify(session1, times(1)).sendMessage(expectedMessage);
//    }
//
//    @Test
//    void testSendingHeartbeats() throws IOException {
//        // GIVEN
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session2);
//        // WHEN
//        chatService.sendHeartbeat();
//        // THEN
//        verify(session1, times(1)).sendMessage(new TextMessage("[HEARTBEAT]"));
//        verify(session2, times(1)).sendMessage(new TextMessage("[HEARTBEAT]"));
//    }
//
//    @Test
//    void testSendAlreadyConnected() throws IOException {
//        // GIVEN
//        TextMessage messageReceived = new TextMessage("[CHAT_MESSAGE]:【SERVER】: You are already connected!");
//        // WHEN
//        chatService.afterConnectionEstablished(session1);
//        chatService.afterConnectionEstablished(session1);
//        // THEN
//        verify(session1, times(1)).sendMessage(messageReceived);
//    }
//}
