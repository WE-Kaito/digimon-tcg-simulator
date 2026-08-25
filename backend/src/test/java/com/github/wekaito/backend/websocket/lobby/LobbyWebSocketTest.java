package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.StarterDeckService;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.ChatMessage;
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
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class LobbyWebSocketTest {
    private LobbyWebSocket lobbyWebSocket;
    private GameWebSocket gameWebSocket;
    private TestUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new TestUserDetailsService();
        TestDeckService deckService = new TestDeckService();
        gameWebSocket = new GameWebSocket(userDetailsService, deckService, null, event -> { });
        lobbyWebSocket = new LobbyWebSocket(userDetailsService, deckService, null, gameWebSocket);
    }

    @Test
    void enteringLobbyImmediatelyBroadcastsTheUpdatedCount() throws Exception {
        TestWebSocketSession session = new TestWebSocketSession("lobby-1", "Aaron");

        lobbyWebSocket.afterConnectionEstablished(session);

        assertThat(session.getMessages())
                .contains("[USER_COUNT]:1", "[LOBBY_PLAYERS]:[{\"name\":\"Aaron\",\"status\":\"In lobby\"}]");
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
                .contains("[USER_COUNT]:1", "[LOBBY_PLAYERS]:[{\"name\":\"Beatrice\",\"status\":\"In lobby\"}]");
    }

    @Test
    void blockedAuthorsAreMutedForTheBlockingUserOnly() throws Exception {
        TestWebSocketSession author = new TestWebSocketSession("lobby-1", "blocked-user");
        TestWebSocketSession blocker = new TestWebSocketSession("lobby-2", "blocking-user");
        TestWebSocketSession otherUser = new TestWebSocketSession("lobby-3", "other-user");
        userDetailsService.block("blocking-user", "blocked-user");
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(author, blocker, otherUser));

        lobbyWebSocket.handleTextMessage(author, new TextMessage("/chatMessage:hidden message"));

        assertThat(blocker.getMessages()).noneMatch(message -> message.contains("hidden message"));
        assertThat(author.getMessages()).anyMatch(message -> message.contains("hidden message"));
        assertThat(otherUser.getMessages()).anyMatch(message -> message.contains("hidden message"));
    }

    @Test
    void blockedAuthorsAreRemovedFromChatHistoryButServerMessagesRemain() {
        TestWebSocketSession blocker = new TestWebSocketSession("lobby-1", "blocking-user");
        userDetailsService.block("blocking-user", "blocked-user");
        lobbyWebSocket.getGlobalChatMessages().clear();
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("hidden message", "blocked-user"));
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("visible message", "other-user"));
        lobbyWebSocket.getGlobalChatMessages().add(new ChatMessage("server message", "【SERVER】"));

        List<ChatMessage> visibleMessages = lobbyWebSocket.getVisibleGlobalChatMessages(blocker);

        assertThat(visibleMessages).extracting(ChatMessage::author)
                .containsExactly("other-user", "【SERVER】");
        assertThat(userDetailsService.getBlockedAccountLookupCount()).isEqualTo(1);
    }

    @Test
    void matchesImmediatelyWhenSecondPlayerJoinsQuickPlay() throws Exception {
        TestWebSocketSession playerOne = new TestWebSocketSession("qp-1", "player-one");
        TestWebSocketSession playerTwo = new TestWebSocketSession("qp-2", "player-two");
        lobbyWebSocket.getGlobalActiveSessions().add(playerOne);
        lobbyWebSocket.getGlobalActiveSessions().add(playerTwo);

        lobbyWebSocket.handleTextMessage(playerOne, new TextMessage("/quickPlay"));

        assertThat(lobbyWebSocket.getQuickPlayQueue()).hasSize(1);
        assertThat(playerOne.getMessages()).contains("[QUICK_PLAY_QUEUED]", "[USER_COUNT_QUICK_PLAY]:1");

        lobbyWebSocket.handleTextMessage(playerTwo, new TextMessage("/quickPlay"));

        assertThat(lobbyWebSocket.getQuickPlayQueue()).isEmpty();
        assertThat(playerOne.getMessages()).anyMatch(message ->
                message.equals("[COMPUTE_GAME]:player-one‗player-two") ||
                        message.equals("[COMPUTE_GAME]:player-two‗player-one"));
        assertThat(playerTwo.getMessages()).anyMatch(message ->
                message.equals("[COMPUTE_GAME]:player-one‗player-two") ||
                        message.equals("[COMPUTE_GAME]:player-two‗player-one"));
    }

    @Test
    void cancelRemovesPlayerAndBroadcastsUpdatedCountImmediately() throws Exception {
        TestWebSocketSession player = new TestWebSocketSession("qp-1", "player-one");
        lobbyWebSocket.getGlobalActiveSessions().add(player);

        lobbyWebSocket.handleTextMessage(player, new TextMessage("/quickPlay"));
        lobbyWebSocket.handleTextMessage(player, new TextMessage("/cancelQuickPlay"));

        assertThat(lobbyWebSocket.getQuickPlayQueue()).isEmpty();
        assertThat(player.getMessages()).contains("[QUICK_PLAY_CANCELLED]", "[USER_COUNT_QUICK_PLAY]:0");
    }

    @Test
    void duplicateUsernameSessionsOnlyOccupyOneQueuePosition() throws Exception {
        TestWebSocketSession oldSession = new TestWebSocketSession("qp-1", "player-one");
        TestWebSocketSession newSession = new TestWebSocketSession("qp-2", "player-one");

        lobbyWebSocket.handleTextMessage(oldSession, new TextMessage("/quickPlay"));
        lobbyWebSocket.handleTextMessage(newSession, new TextMessage("/quickPlay"));

        assertThat(lobbyWebSocket.getQuickPlayQueue()).hasSize(1);
        assertThat(lobbyWebSocket.getQuickPlayQueue()).contains(newSession);
    }

    @Test
    void avoidsTheLastOpponentWhenMultiplePlayersAreWaiting() throws Exception {
        TestWebSocketSession returningPlayer = new TestWebSocketSession("qp-1", "returning-player");
        TestWebSocketSession previousOpponent = new TestWebSocketSession("qp-2", "previous-opponent");
        TestWebSocketSession differentOpponent = new TestWebSocketSession("qp-3", "different-opponent");

        lobbyWebSocket.getLastQuickPlayOpponents().put("returning-player", "previous-opponent");
        lobbyWebSocket.getLastQuickPlayOpponents().put("previous-opponent", "returning-player");
        lobbyWebSocket.getQuickPlayQueue().add(previousOpponent);
        lobbyWebSocket.getQuickPlayQueue().add(differentOpponent);

        lobbyWebSocket.handleTextMessage(returningPlayer, new TextMessage("/quickPlay"));

        assertThat(hasGameWith(returningPlayer, "different-opponent")).isTrue();
        assertThat(hasGameWith(differentOpponent, "returning-player")).isTrue();
        assertThat(hasGameWith(returningPlayer, "previous-opponent")).isFalse();
        assertThat(lobbyWebSocket.getQuickPlayQueue()).contains(previousOpponent);
    }

    @Test
    void rematchesTheLastOpponentImmediatelyWhenTheyAreTheOnlyPlayerWaiting() throws Exception {
        TestWebSocketSession returningPlayer = new TestWebSocketSession("qp-1", "returning-player");
        TestWebSocketSession previousOpponent = new TestWebSocketSession("qp-2", "previous-opponent");

        lobbyWebSocket.getLastQuickPlayOpponents().put("returning-player", "previous-opponent");
        lobbyWebSocket.getLastQuickPlayOpponents().put("previous-opponent", "returning-player");
        lobbyWebSocket.getQuickPlayQueue().add(previousOpponent);

        lobbyWebSocket.handleTextMessage(returningPlayer, new TextMessage("/quickPlay"));

        assertThat(hasGameWith(returningPlayer, "previous-opponent")).isTrue();
        assertThat(hasGameWith(previousOpponent, "returning-player")).isTrue();
        assertThat(lobbyWebSocket.getQuickPlayQueue()).isEmpty();
    }

    private boolean hasGameWith(TestWebSocketSession player, String opponent) {
        return player.getMessages().stream()
                .filter(message -> message.startsWith("[COMPUTE_GAME]:"))
                .anyMatch(message -> message.contains(opponent));
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
        private final Map<String, List<String>> blockedAccounts = new HashMap<>();
        private int blockedAccountLookupCount;

        TestUserDetailsService() {
            super(null, (StarterDeckService) null);
        }

        void block(String username, String blockedUsername) {
            blockedAccounts.put(username, List.of(blockedUsername));
        }

        int getBlockedAccountLookupCount() {
            return blockedAccountLookupCount;
        }

        @Override
        public String getActiveDeck(String username) {
            return "deck-id";
        }

        @Override
        public String getAvatar(String username) {
            return "avatar";
        }

        @Override
        public List<String> getBlockedAccounts(String username) {
            blockedAccountLookupCount++;
            return blockedAccounts.getOrDefault(username, List.of());
        }

        @Override
        public boolean checkBlockedByWebSocketSessions(WebSocketSession player1, WebSocketSession player2) {
            String username1 = (player1 != null && player1.getPrincipal() != null)
                    ? player1.getPrincipal().getName()
                    : null;
            String username2 = (player2 != null && player2.getPrincipal() != null)
                    ? player2.getPrincipal().getName()
                    : null;
            if (username1 == null || username2 == null) return false;
            return getBlockedAccounts(username1).contains(username2)
                    || getBlockedAccounts(username2).contains(username1);
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

        @Override
        public List<Card> getEggDeckCardsById(String id) {
            return List.of();
        }

        @Override
        public String getDeckSleeveById(String id) {
            return "";
        }

        @Override
        public String getEggDeckSleeveById(String id) {
            return "";
        }
    }
}
