package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.websocket.TestWebSocketSession;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;

import java.lang.reflect.Field;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LobbyPlayerStatusTest {
    private LobbyWebSocket lobbyWebSocket;
    private GameWebSocket gameWebSocket;

    @BeforeEach
    void setUp() throws Exception {
        lobbyWebSocket = new LobbyWebSocket(null, null, null);
        gameWebSocket = new GameWebSocket(null, null, null);

        Field gameWebSocketField = LobbyWebSocket.class.getDeclaredField("gameWebSocket");
        gameWebSocketField.setAccessible(true);
        gameWebSocketField.set(lobbyWebSocket, gameWebSocket);
    }

    @Test
    void deckPageConnectionReportsDeckBuildingStatus() throws Exception {
        TestWebSocketSession session = presenceSession("Aaron", "DECKBUILDING");

        lobbyWebSocket.afterConnectionEstablished(session);

        assertThat(playerListMessage(session)).contains(playerJson("Aaron", "Deck building"));
    }

    @Test
    void testPageConnectionReportsTestingStatus() throws Exception {
        TestWebSocketSession session = presenceSession("Aaron", "TESTING");

        lobbyWebSocket.afterConnectionEstablished(session);

        assertThat(playerListMessage(session)).contains(playerJson("Aaron", "Testing"));
    }

    @Test
    void twoPlayersInCreatedRoomBothReportGameRoomStatus() throws Exception {
        TestWebSocketSession host = lobbySession("Aaron", "lobby-1");
        TestWebSocketSession guest = lobbySession("Beatrice", "lobby-2");
        registerLobbySessions(host, guest);
        lobbyWebSocket.getRooms().add(new Room(
                "room-1",
                "Test room",
                "Aaron",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Aaron", true),
                        new LobbyPlayer(guest, "Beatrice", false)
                ))
        ));

        requestStatusBroadcast(host);

        assertThat(playerListMessage(host))
                .contains(playerJson("Aaron", "In Game Room"))
                .contains(playerJson("Beatrice", "In Game Room"));
    }

    @Test
    void playerWaitingAloneInCreatedRoomRemainsInLobby() throws Exception {
        TestWebSocketSession host = lobbySession("Aaron", "lobby-1");
        registerLobbySessions(host);
        lobbyWebSocket.getRooms().add(new Room(
                "room-1",
                "Test room",
                "Aaron",
                false,
                "",
                new ArrayList<>(List.of(new LobbyPlayer(host, "Aaron", true)))
        ));

        requestStatusBroadcast(host);

        assertThat(playerListMessage(host)).contains(playerJson("Aaron", "In lobby"));
    }

    @Test
    void activeMatchTakesPrecedenceOverGameRoomStatus() throws Exception {
        TestWebSocketSession host = lobbySession("Aaron", "lobby-1");
        TestWebSocketSession guest = lobbySession("Beatrice", "lobby-2");
        registerLobbySessions(host, guest);
        lobbyWebSocket.getRooms().add(new Room(
                "room-1",
                "Test room",
                "Aaron",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host, "Aaron", true),
                        new LobbyPlayer(guest, "Beatrice", false)
                ))
        ));
        GameRoom gameRoom = new GameRoom(
                "Aaron‗Beatrice",
                new Player("Aaron", "", "", ""),
                List.of(),
                List.of(),
                new Player("Beatrice", "", "", ""),
                List.of(),
                List.of()
        );
        gameWebSocket.getGameRooms().put(gameRoom.getRoomId(), gameRoom);

        requestStatusBroadcast(host);

        assertThat(playerListMessage(host))
                .contains(playerJson("Aaron", "In a match"))
                .contains(playerJson("Beatrice", "In a match"));
    }

    private TestWebSocketSession presenceSession(String username, String status) {
        return new TestWebSocketSession(
                "presence-" + username,
                username,
                URI.create("ws://localhost/api/ws/lobby?status=" + status)
        );
    }

    private TestWebSocketSession lobbySession(String username, String id) {
        return new TestWebSocketSession(id, username);
    }

    private void registerLobbySessions(TestWebSocketSession... sessions) throws Exception {
        for (TestWebSocketSession session : sessions) {
            lobbyWebSocket.getGlobalActiveSessions().add(session);
            lobbyWebSocket.handleTextMessage(session, new TextMessage("/setPlayerStatus:LOBBY"));
        }
    }

    private void requestStatusBroadcast(TestWebSocketSession session) throws Exception {
        lobbyWebSocket.handleTextMessage(session, new TextMessage("/setPlayerStatus:LOBBY"));
    }

    private String playerListMessage(TestWebSocketSession session) {
        return session.getMessages().stream()
                .filter(message -> message.startsWith("[LOBBY_PLAYERS]:"))
                .reduce((first, second) -> second)
                .orElseThrow();
    }

    private String playerJson(String name, String status) {
        return "{\"name\":\"" + name + "\",\"status\":\"" + status + "\"}";
    }
}
