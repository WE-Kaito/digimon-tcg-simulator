package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.StarterDeckService;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.Deck;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.TestWebSocketSession;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LobbyWebSocketTest {
    private LobbyWebSocket lobbyWebSocket;
    private GameWebSocket gameWebSocket;

    @BeforeEach
    void setUp() throws Exception {
        lobbyWebSocket = new LobbyWebSocket(new TestUserDetailsService(), new TestDeckService(), null);
        gameWebSocket = new GameWebSocket(null, null, null, event -> { });

        Field gameWebSocketField = LobbyWebSocket.class.getDeclaredField("gameWebSocket");
        gameWebSocketField.setAccessible(true);
        gameWebSocketField.set(lobbyWebSocket, gameWebSocket);
    }

    @Test
    void enteringLobbyImmediatelyBroadcastsTheUpdatedCount() throws Exception {
        TestWebSocketSession session = new TestWebSocketSession("lobby-1", "Aaron");

        lobbyWebSocket.afterConnectionEstablished(session);

        assertThat(session.getMessages())
                .contains("[USER_COUNT]:1", "[LOBBY_PLAYERS]:[\"Aaron\"]");
    }

    @Test
    void countRequestBroadcastsDistinctLobbyAndGamePlayers() throws Exception {
        TestWebSocketSession lobbySession = new TestWebSocketSession("lobby-1", "Aaron");
        lobbyWebSocket.getGlobalActiveSessions().add(lobbySession);

        GameRoom gameRoom = gameRoom("Aaron", "Beatrice");
        gameRoom.addSession(new TestWebSocketSession("game-1", "Aaron"));
        gameRoom.addSession(new TestWebSocketSession("game-2", "Beatrice"));
        gameWebSocket.getGameRooms().put(gameRoom.getRoomId(), gameRoom);

        lobbyWebSocket.handleTextMessage(lobbySession, new TextMessage("/requestUserCount"));

        assertThat(lobbySession.getMessages()).contains("[USER_COUNT]:2");
    }

    @Test
    void leavingLobbyImmediatelyBroadcastsTheUpdatedCount() throws Exception {
        TestWebSocketSession leavingSession = new TestWebSocketSession("lobby-1", "Aaron");
        TestWebSocketSession remainingSession = new TestWebSocketSession("lobby-2", "Beatrice");
        lobbyWebSocket.getGlobalActiveSessions().add(leavingSession);
        lobbyWebSocket.getGlobalActiveSessions().add(remainingSession);

        lobbyWebSocket.afterConnectionClosed(leavingSession, CloseStatus.NORMAL);

        assertThat(remainingSession.getMessages())
                .contains("[USER_COUNT]:1", "[LOBBY_PLAYERS]:[\"Beatrice\"]");
    }

    private GameRoom gameRoom(String playerOne, String playerTwo) {
        return new GameRoom(
                playerOne + "‗" + playerTwo,
                new Player(playerOne, "", "", ""),
                List.of(),
                List.of(),
                new Player(playerTwo, "", "", ""),
                List.of(),
                List.of()
        );
    }

    private static class TestUserDetailsService extends MongoUserDetailsService {
        TestUserDetailsService() {
            super(null, (StarterDeckService) null);
        }

        @Override
        public String getActiveDeck(String username) {
            return "deck-id";
        }

        @Override
        public List<String> getBlockedAccounts(String username) {
            return List.of();
        }
    }

    private static class TestDeckService extends DeckService {
        TestDeckService() {
            super(null, null, null);
        }

        @Override
        public Deck getDeckById(String id) {
            return new Deck(id, "Test", List.of(), List.of(), "", "", "", "Aaron");
        }

        @Override
        public List<Card> getMainDeckCardsById(String id) {
            return List.of();
        }
    }
}
