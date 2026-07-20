package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.websocket.game.models.GameRoom;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
