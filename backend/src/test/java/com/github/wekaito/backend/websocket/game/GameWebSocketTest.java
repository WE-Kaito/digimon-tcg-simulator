package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.websocket.game.models.GameRoom;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameWebSocketTest {

    @Test
    void prepareNewGameRetiresPreviousRoomWithSameGameId() {
        String gameId = "player-one‗player-two";
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);
        TrackingGameRoom previousRoom = new TrackingGameRoom(gameId);
        gameWebSocket.gameRooms.put(gameId, previousRoom);

        gameWebSocket.prepareNewGame(gameId);

        assertFalse(gameWebSocket.gameRooms.containsKey(gameId));
        assertTrue(previousRoom.scheduledTasksCancelled);
    }

    @Test
    void prepareNewGameClearsOnlySessionMappingsForReplacedGame() throws Exception {
        String replacedGameId = "player-one‗player-two";
        String activeGameId = "player-three‗player-four";
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);
        Map<String, String> roomIdsBySession = getRoomIdsBySession(gameWebSocket);
        roomIdsBySession.put("old-player-one-session", replacedGameId);
        roomIdsBySession.put("old-player-two-session", replacedGameId);
        roomIdsBySession.put("active-player-session", activeGameId);

        gameWebSocket.prepareNewGame(replacedGameId);

        assertFalse(roomIdsBySession.containsKey("old-player-one-session"));
        assertFalse(roomIdsBySession.containsKey("old-player-two-session"));
        assertTrue(roomIdsBySession.containsKey("active-player-session"));
    }

    @Test
    void prepareNewGameLeavesOtherGameRoomsRunning() {
        String replacedGameId = "player-one‗player-two";
        String activeGameId = "player-three‗player-four";
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);
        TrackingGameRoom replacedRoom = new TrackingGameRoom(replacedGameId);
        TrackingGameRoom activeRoom = new TrackingGameRoom(activeGameId);
        gameWebSocket.gameRooms.put(replacedGameId, replacedRoom);
        gameWebSocket.gameRooms.put(activeGameId, activeRoom);

        gameWebSocket.prepareNewGame(replacedGameId);

        assertSame(activeRoom, gameWebSocket.gameRooms.get(activeGameId));
        assertFalse(activeRoom.scheduledTasksCancelled);
    }

    @Test
    void prepareNewGameIsSafeWhenNoPreviousRoomExists() {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);

        assertDoesNotThrow(() -> gameWebSocket.prepareNewGame("player-one‗player-two"));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> getRoomIdsBySession(GameWebSocket gameWebSocket) throws Exception {
        Field field = GameWebSocket.class.getDeclaredField("roomIdBySessionId");
        field.setAccessible(true);
        return (Map<String, String>) field.get(gameWebSocket);
    }

    private static class TrackingGameRoom extends GameRoom {
        private boolean scheduledTasksCancelled;

        TrackingGameRoom(String gameId) {
            super(gameId, null, List.of(), List.of(), null, List.of(), List.of());
        }

        @Override
        public void cancelAllScheduledTasks() {
            scheduledTasksCancelled = true;
        }
    }
}
