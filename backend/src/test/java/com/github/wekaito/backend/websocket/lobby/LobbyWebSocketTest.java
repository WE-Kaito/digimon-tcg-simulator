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

import java.lang.reflect.Proxy;
import java.util.ArrayList;
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
    void leavingAnAlreadyRemovedRoomStillAcknowledgesTheClient() throws Exception {
        TestWebSocketSession player = new TestWebSocketSession("lobby-1", "test");
        lobbyWebSocket.getGlobalActiveSessions().add(player);

        lobbyWebSocket.handleTextMessage(player, new TextMessage("/leave:missing-room:test:true"));

        assertThat(player.getMessages()).contains("[LEAVE_ROOM]");
    }

    @Test
    void passwordAttemptForRemovedRoomClosesWithAnInformativeMessage() throws Exception {
        TestWebSocketSession player = new TestWebSocketSession("lobby-1", "test");
        lobbyWebSocket.getGlobalActiveSessions().add(player);

        lobbyWebSocket.handleTextMessage(player, new TextMessage("/password:missing-room:secret"));

        assertThat(player.getMessages()).contains(
                "[ROOM_NOT_FOUND]",
                "[CHAT_MESSAGE]:【SERVER】: The room you are attempting to join no longer exists."
        );
    }

    @Test
    void explicitlyLeavingDestroysTheRoomAndNotifiesAllPlayers() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host, guest));

        lobbyWebSocket.handleTextMessage(host, new TextMessage("/leave:room-id:Beatrice:true"));

        assertThat(host.getMessages()).contains("[LEAVE_ROOM]");
        assertThat(guest.getMessages()).contains("[LEAVE_ROOM]");
        assertThat(room.getPlayers()).isEmpty();
        assertThat(lobbyWebSocket.getRooms()).doesNotContain(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
    }

    @Test
    void guestLeavingKeepsTheRoomAndOnlyRemovesTheGuest() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host, guest));

        lobbyWebSocket.handleTextMessage(guest, new TextMessage("/leave:room-id:Test2:true"));

        assertThat(guest.getMessages()).contains("[LEAVE_ROOM]");
        assertThat(host.getMessages()).doesNotContain("[LEAVE_ROOM]");
        assertThat(host.getMessages()).anyMatch(message -> message.startsWith("[ROOM_UPDATE]:"));
        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test");
        assertThat(lobbyWebSocket.getRooms()).contains(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
    }

    @Test
    void hostDisconnectStartsReconnectDeadlineWithoutPromotingGuest() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host, guest));

        lobbyWebSocket.afterConnectionClosed(host, CloseStatus.NORMAL);

        assertThat(room.getHostName()).isEqualTo("Test");
        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test2");
        assertThat(lobbyWebSocket.getHostReconnectDeadlines()).containsKey(room.getId());
        assertThat(guest.getMessages()).anyMatch(message ->
                message.startsWith("[ROOM_UPDATE]:") && message.contains("\"hostReconnectDeadline\":"));

        long deadline = lobbyWebSocket.getHostReconnectDeadlines().get(room.getId());
        lobbyWebSocket.reconcileAbandonedRooms(deadline);

        assertThat(lobbyWebSocket.getRooms()).doesNotContain(room);
        assertThat(guest.getMessages()).contains("[LEAVE_ROOM]");
        assertThat(lobbyWebSocket.getHostReconnectDeadlines()).doesNotContainKey(room.getId());
        assertThat(lobbyWebSocket.getGameLobbyRoomByUsername()).doesNotContainValue(room.getId());
        assertThat(lobbyWebSocket.getLastPlayerRooms()).doesNotContainValue(room.getId());
        assertThat(lobbyWebSocket.getKickedPlayersByRoomId()).doesNotContainKey(room.getId());
    }

    @Test
    void newestHostSessionReplacesOldSessionBeforeOldConnectionCloses() throws Exception {
        TestWebSocketSession oldHostSession = new TestWebSocketSession("lobby-old", "Test");
        TestWebSocketSession newHostSession = new TestWebSocketSession("lobby-new", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-guest", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(oldHostSession, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(oldHostSession, newHostSession, guest));

        // The replacement connection arrives before afterConnectionClosed for
        // the old browser session, matching the refresh race seen in production.
        lobbyWebSocket.handleTextMessage(newHostSession, new TextMessage("/joinRoom:room-id"));
        lobbyWebSocket.afterConnectionClosed(oldHostSession, CloseStatus.NORMAL);

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactlyInAnyOrder("Test", "Test2");
        assertThat(room.getPlayers()).filteredOn(player -> player.getName().equals("Test")).hasSize(1);
        assertThat(room.getPlayers().stream()
                .filter(player -> player.getName().equals("Test"))
                .findFirst()
                .orElseThrow()
                .getSession()).isSameAs(newHostSession);
        assertThat(room.getHostName()).isEqualTo("Test");
        assertThat(lobbyWebSocket.getHostReconnectDeadlines()).doesNotContainKey(room.getId());
    }

    @Test
    void kickedGuestCannotRejoinTheRoom() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host, guest));

        lobbyWebSocket.handleTextMessage(host, new TextMessage("/kick:room-id:Test2"));

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test");
        assertThat(guest.getMessages()).contains(
                "[KICKED]",
                "[CHAT_MESSAGE]:【SERVER】: You have been removed from the Game Room. " +
                        "You will not be able to rejoin the Game Room at this time."
        );

        lobbyWebSocket.handleTextMessage(guest, new TextMessage("/joinRoom:room-id"));

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test");
        assertThat(guest.getMessages()).contains("[ROOM_JOIN_REJECTED]");
        assertThat(guest.getMessages()).noneMatch(message -> message.startsWith("[JOIN_ROOM]:"));
    }

    @Test
    void thirdUserCannotJoinFullRoomByLink() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        TestWebSocketSession thirdUser = new TestWebSocketSession("lobby-3", "Test3");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);

        lobbyWebSocket.handleTextMessage(thirdUser, new TextMessage("/joinRoom:room-id"));

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test", "Test2");
        assertThat(thirdUser.getMessages()).contains(
                "[ROOM_JOIN_REJECTED]",
                "[CHAT_MESSAGE]:【SERVER】: Room is full."
        );
        assertThat(thirdUser.getMessages()).noneMatch(message -> message.startsWith("[JOIN_ROOM]:"));
    }

    @Test
    void guestReconnectCanReplaceOwnSessionInFullRoom() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession oldGuest = new TestWebSocketSession("lobby-old", "Test2");
        TestWebSocketSession newGuest = new TestWebSocketSession("lobby-new", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(oldGuest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);

        lobbyWebSocket.handleTextMessage(newGuest, new TextMessage("/joinRoom:room-id"));

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactlyInAnyOrder("Test", "Test2");
        assertThat(room.getPlayers()).filteredOn(player -> player.getName().equals("Test2"))
                .singleElement()
                .extracting(LobbyPlayer::getSession)
                .isSameAs(newGuest);
        assertThat(newGuest.getMessages()).anyMatch(message -> message.startsWith("[JOIN_ROOM]:"));
    }

    @Test
    void nonHostCannotKickAnotherPlayer() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(room);

        lobbyWebSocket.handleTextMessage(guest, new TextMessage("/kick:room-id:Test"));

        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test", "Test2");
        assertThat(host.getMessages()).doesNotContain("[KICKED]");
    }

    @Test
    void creatingANewRoomDestroysTheHostsPreviousRoom() throws Exception {
        TestWebSocketSession host = new TestWebSocketSession("lobby-1", "Test");
        TestWebSocketSession guest = new TestWebSocketSession("lobby-2", "Test2");
        Room oldRoom = new Room(
                "old-room-id",
                "Old Room",
                "Test",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Test", true),
                        new LobbyPlayer(guest, "Test2", false)
                ))
        );
        lobbyWebSocket.getRooms().add(oldRoom);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host, guest));
        lobbyWebSocket.getEmptyRoomTimestamps().put(oldRoom.getId(), 1L);
        lobbyWebSocket.getRoomsWithActiveGames().add(oldRoom.getId());
        lobbyWebSocket.getKickedPlayersByRoomId().put(oldRoom.getId(), java.util.Set.of("kicked-user"));
        lobbyWebSocket.getLastPlayerRooms().put("Test2", oldRoom.getId());
        lobbyWebSocket.getGameLobbyRoomByUsername().put("Test2", oldRoom.getId());
        List<String> deletedRoomIds = new ArrayList<>();
        RoomSnapshotRepository repository = (RoomSnapshotRepository) Proxy.newProxyInstance(
                RoomSnapshotRepository.class.getClassLoader(),
                new Class<?>[]{RoomSnapshotRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> args[0];
                    case "deleteById" -> {
                        deletedRoomIds.add((String) args[0]);
                        yield null;
                    }
                    case "toString" -> "RoomSnapshotRepositoryStub";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
        lobbyWebSocket.setRoomSnapshotRepositoryForTesting(repository);

        lobbyWebSocket.handleTextMessage(host, new TextMessage("/createRoom:New Room::false"));

        assertThat(guest.getMessages()).contains("[LEAVE_ROOM]");
        assertThat(lobbyWebSocket.getRooms()).hasSize(1);
        Room replacement = lobbyWebSocket.getRooms().iterator().next();
        assertThat(replacement.getId()).isNotEqualTo(oldRoom.getId());
        assertThat(replacement.getHostName()).isEqualTo("Test");
        assertThat(replacement.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Test");
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(oldRoom.getId());
        assertThat(lobbyWebSocket.getRoomsWithActiveGames()).doesNotContain(oldRoom.getId());
        assertThat(lobbyWebSocket.getKickedPlayersByRoomId()).doesNotContainKey(oldRoom.getId());
        assertThat(lobbyWebSocket.getLastPlayerRooms()).doesNotContainValue(oldRoom.getId());
        assertThat(lobbyWebSocket.getGameLobbyRoomByUsername()).doesNotContainValue(oldRoom.getId());
        assertThat(deletedRoomIds).containsExactly(oldRoom.getId());
    }

    @Test
    void roomLinkCanReviveAnEmptyRoomDuringTheGracePeriod() throws Exception {
        TestWebSocketSession oldHostSession = new TestWebSocketSession("lobby-old", "Aaron");
        Room room = new Room(
                "room-id",
                "Custom Room",
                "Aaron",
                false,
                "",
                new ArrayList<>(List.of(new LobbyPlayer(oldHostSession, "Aaron", true)))
        );
        lobbyWebSocket.getRooms().add(room);
        TestWebSocketSession linkVisitor = new TestWebSocketSession("lobby-new", "Beatrice");
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(oldHostSession, linkVisitor));

        lobbyWebSocket.afterConnectionClosed(oldHostSession, CloseStatus.NORMAL);
        assertThat(room.getPlayers()).isEmpty();
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).containsKey(room.getId());
        assertThat(linkVisitor.getMessages()).anyMatch(message ->
                message.startsWith("[ROOMS]:") && message.contains("\"id\":\"room-id\""));

        lobbyWebSocket.handleTextMessage(linkVisitor, new TextMessage("/joinRoom:room-id"));

        assertThat(linkVisitor.getMessages()).anyMatch(message -> message.startsWith("[JOIN_ROOM]:"));
        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName).containsExactly("Beatrice");
        assertThat(room.getHostName()).isEqualTo("Aaron");
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
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
                message.matches("\\[COMPUTE_GAME]:[0-9a-f-]{36}"));
        assertThat(playerTwo.getMessages()).anyMatch(message ->
                message.matches("\\[COMPUTE_GAME]:[0-9a-f-]{36}"));
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
        String username = player.getPrincipal().getName();
        return gameWebSocket.getGameRooms().values().stream().anyMatch(room ->
                java.util.Set.of(room.getPlayer1().username(), room.getPlayer2().username())
                        .equals(java.util.Set.of(username, opponent)));
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
