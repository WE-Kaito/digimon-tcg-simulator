package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GameWebSocketTest {

    private GameWebSocket gameWebSocket;

    @BeforeEach
    void setUp() {
        gameWebSocket = new GameWebSocket(
                mock(MongoUserDetailsService.class),
                mock(DeckService.class),
                mock(CardJsonConverter.class),
                event -> { }
        );
    }

    @Test
    void surrenderDestroysRoomAndBlocksReconnectUsingTheOldGameId() throws Exception {
        String gameId = "player-one‗player-two";
        WebSocketSession surrenderingSession = mock(WebSocketSession.class);
        GameRoom gameRoom = mock(GameRoom.class);

        when(gameRoom.getRoomId()).thenReturn(gameId);
        when(gameRoom.getSessions()).thenReturn(Set.of(surrenderingSession));
        gameWebSocket.gameRooms.put(gameId, gameRoom);

        gameWebSocket.handleTextMessage(surrenderingSession, new TextMessage(gameId + ":/surrender"));

        assertFalse(gameWebSocket.gameRooms.containsKey(gameId));
        verify(gameRoom).sendMessageToOtherSessions(surrenderingSession, "[SURRENDER]");
        verify(gameRoom).cancelAllScheduledTasks();

        gameWebSocket.handleTextMessage(surrenderingSession, new TextMessage("/joinGame:" + gameId));

        assertFalse(gameWebSocket.gameRooms.containsKey(gameId));
    }
}
