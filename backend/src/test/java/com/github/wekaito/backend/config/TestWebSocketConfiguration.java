package com.github.wekaito.backend.config;

import com.github.wekaito.backend.websocket.game.GameService;
import com.github.wekaito.backend.websocket.lobby.LobbyService;
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
    public LobbyService lobbyService() {
        return mock(LobbyService.class);
    }

    @Bean
    @Primary
    public GameService gameService() {
        return mock(GameService.class);
    }
}