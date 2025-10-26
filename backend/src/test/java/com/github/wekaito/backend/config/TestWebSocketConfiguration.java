package com.github.wekaito.backend.config;

import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.lobby.LobbyWebSocket;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import static org.mockito.Mockito.mock;

@TestConfiguration
@Profile("test")
public class TestWebSocketConfiguration {

    @Bean
    @Primary
    public LobbyWebSocket lobbyWebSocket() {
        return mock(LobbyWebSocket.class);
    }

    @Bean
    @Primary
    public GameWebSocket gameWebSocket() {
        return mock(GameWebSocket.class);
    }
}