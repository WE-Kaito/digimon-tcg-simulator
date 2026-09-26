package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.websocket.OnlinePlayerCountChangedEvent;
import com.github.wekaito.backend.websocket.TestWebSocketSession;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.Player;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GameWebSocketOnlineCountEventTest {

    @Test
    void joiningGamePublishesPlayerCountChange() throws Exception {
        RecordingEventPublisher eventPublisher = new RecordingEventPublisher();
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, eventPublisher);
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

        gameWebSocket.handleTextMessage(
                new TestWebSocketSession("game-1", "Aaron"),
                new TextMessage("/joinGame:" + gameRoom.getRoomId())
        );

        assertThat(eventPublisher.events)
                .singleElement()
                .isInstanceOf(OnlinePlayerCountChangedEvent.class);
    }

    @Test
    void closingGameConnectionPublishesPlayerCountChange() {
        RecordingEventPublisher eventPublisher = new RecordingEventPublisher();
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, eventPublisher);

        gameWebSocket.afterConnectionClosed(
                new TestWebSocketSession("game-1", "Aaron"),
                CloseStatus.NORMAL
        );

        assertThat(eventPublisher.events)
                .singleElement()
                .isInstanceOf(OnlinePlayerCountChangedEvent.class);
    }

    private static class RecordingEventPublisher implements ApplicationEventPublisher {
        private final List<Object> events = new ArrayList<>();

        @Override
        public void publishEvent(Object event) {
            events.add(event);
        }
    }
}
