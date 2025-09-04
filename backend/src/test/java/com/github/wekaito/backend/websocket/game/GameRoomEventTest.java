package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.GameRoomEmptyEvent;
import com.github.wekaito.backend.websocket.game.models.Player;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.util.ArrayList;

import static org.mockito.Mockito.*;

/**
 * Simple test to verify that GameRoom emits events when empty
 */
class GameRoomEventTest {

    @Test
    void testGameRoomEmitsEventWhenEmpty() {
        // Given
        ApplicationEventPublisher eventPublisher = Mockito.mock(ApplicationEventPublisher.class);
        Player player1 = new Player("user1", "avatar1", "sleeve1");
        Player player2 = new Player("user2", "avatar2", "sleeve2");
        GameRoom gameRoom = new GameRoom("testRoom", player1, new ArrayList<>(), player2, new ArrayList<>(), eventPublisher);

        // When - simulate empty check (would normally be called by scheduler)
        gameRoom.checkAndEmitIfEmpty();

        // Then - verify event is published when room is empty
        verify(eventPublisher, times(1)).publishEvent(any(GameRoomEmptyEvent.class));
    }
}