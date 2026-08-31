package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.TestWebSocketSession;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LobbyAbandonedRoomCleanupTest {

    private LobbyWebSocket lobbyWebSocket;

    @BeforeEach
    void setUp() {
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public List<String> getBlockedAccounts(String username) {
                return List.of();
            }
        };
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
    }

    @Test
    void removesAnAbandonedHostOnlyRoomAfterTheReconnectGracePeriod() {
        TestWebSocketSession staleHost = new TestWebSocketSession("stale-session", "host");
        Room room = roomWithHost(staleHost);
        room.getPlayers().clear();
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGameLobbyRoomByUsername().put("host", room.getId());

        lobbyWebSocket.reconcileAbandonedRooms(1_000L);

        assertThat(lobbyWebSocket.getRooms()).contains(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).containsEntry(room.getId(), 1_000L);

        lobbyWebSocket.reconcileAbandonedRooms(121_001L);

        assertThat(lobbyWebSocket.getRooms()).doesNotContain(room);
        assertThat(lobbyWebSocket.getGameLobbyRoomByUsername()).doesNotContainKey("host");
    }

    @Test
    void keepsAHostOnlyRoomWhenTheHostHasAnActiveLobbySession() {
        TestWebSocketSession host = new TestWebSocketSession("active-session", "host");
        Room room = roomWithHost(host);
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().add(host);

        lobbyWebSocket.reconcileAbandonedRooms(1_000L);
        lobbyWebSocket.reconcileAbandonedRooms(60_000L);

        assertThat(lobbyWebSocket.getRooms()).contains(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
    }

    @Test
    void neverSweepsARoomWhileItsMatchIsActive() {
        TestWebSocketSession staleHost = new TestWebSocketSession("stale-session", "host");
        Room room = roomWithHost(staleHost);
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getRoomsWithActiveGames().add(room.getId());

        lobbyWebSocket.reconcileAbandonedRooms(1_000L);
        lobbyWebSocket.reconcileAbandonedRooms(60_000L);

        assertThat(lobbyWebSocket.getRooms()).contains(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
    }

    @Test
    void cancelsPendingCleanupWhenTheHostReconnects() {
        TestWebSocketSession staleHost = new TestWebSocketSession("stale-session", "host");
        Room room = roomWithHost(staleHost);
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.reconcileAbandonedRooms(1_000L);

        TestWebSocketSession reconnectedHost = new TestWebSocketSession("new-session", "host");
        lobbyWebSocket.getGlobalActiveSessions().add(reconnectedHost);
        room.getPlayers().clear();
        room.getPlayers().add(new LobbyPlayer(reconnectedHost, "host", true));
        lobbyWebSocket.reconcileAbandonedRooms(20_000L);
        lobbyWebSocket.reconcileAbandonedRooms(60_000L);

        assertThat(lobbyWebSocket.getRooms()).contains(room);
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).doesNotContainKey(room.getId());
    }

    @Test
    void restoresPersistedRoomsAsEmptyRejoinableRooms() {
        RoomSnapshot snapshot = new RoomSnapshot(
                "persisted-room", "Saved Room", "original-host", false, "", null
        );
        List<RoomSnapshot> savedSnapshots = new ArrayList<>();
        RoomSnapshotRepository repository = repositoryStub(List.of(snapshot), savedSnapshots, new ArrayList<>());
        lobbyWebSocket.setRoomSnapshotRepositoryForTesting(repository);

        lobbyWebSocket.restorePersistedRooms();

        Room restoredRoom = lobbyWebSocket.getRooms().stream()
                .filter(room -> room.getId().equals("persisted-room"))
                .findFirst()
                .orElseThrow();
        assertThat(restoredRoom.getPlayers()).isEmpty();
        assertThat(lobbyWebSocket.getEmptyRoomTimestamps()).containsKey("persisted-room");
        assertThat(savedSnapshots).singleElement().satisfies(saved ->
                assertThat(saved.expiresAt()).isAfter(Instant.now()));
    }

    @Test
    void discardsPersistedRoomsWhoseExpiryHasPassed() {
        RoomSnapshot snapshot = new RoomSnapshot(
                "expired-room", "Expired Room", "host", false, "", Instant.EPOCH
        );
        List<String> deletedRoomIds = new ArrayList<>();
        RoomSnapshotRepository repository = repositoryStub(List.of(snapshot), new ArrayList<>(), deletedRoomIds);
        lobbyWebSocket.setRoomSnapshotRepositoryForTesting(repository);

        lobbyWebSocket.restorePersistedRooms();

        assertThat(lobbyWebSocket.getRooms()).noneMatch(room -> room.getId().equals("expired-room"));
        assertThat(deletedRoomIds).containsExactly("expired-room");
    }

    private RoomSnapshotRepository repositoryStub(
            List<RoomSnapshot> snapshots,
            List<RoomSnapshot> savedSnapshots,
            List<String> deletedRoomIds
    ) {
        return (RoomSnapshotRepository) Proxy.newProxyInstance(
                RoomSnapshotRepository.class.getClassLoader(),
                new Class<?>[]{RoomSnapshotRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findAll" -> snapshots;
                    case "save" -> {
                        RoomSnapshot snapshot = (RoomSnapshot) args[0];
                        savedSnapshots.add(snapshot);
                        yield snapshot;
                    }
                    case "deleteById" -> {
                        deletedRoomIds.add((String) args[0]);
                        yield null;
                    }
                    case "toString" -> "RoomSnapshotRepositoryStub";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private Room roomWithHost(TestWebSocketSession host) {
        return new Room(
                "room-id",
                "Custom Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(new LobbyPlayer(host, "host", true)))
        );
    }
}
