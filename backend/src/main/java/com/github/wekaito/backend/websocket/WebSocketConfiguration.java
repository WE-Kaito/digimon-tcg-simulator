package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.websocket.game.GameService;
import com.github.wekaito.backend.websocket.lobby.LobbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Profile("!test")
public class WebSocketConfiguration implements WebSocketConfigurer {

    private final LobbyService lobbyService;
    private final GameService gameService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(lobbyService, "/api/ws/lobby")
                .setAllowedOrigins("*");
        registry.addHandler(gameService, "/api/ws/game")
                .setAllowedOrigins("*");
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxSessionIdleTimeout(1800000L); // 30 Minuten
        container.setMaxTextMessageBufferSize(2 * 1024 * 1024);   // 2 MB
        container.setMaxBinaryMessageBufferSize(2 * 1024 * 1024); // 2 MB
        return container;
    }
}
