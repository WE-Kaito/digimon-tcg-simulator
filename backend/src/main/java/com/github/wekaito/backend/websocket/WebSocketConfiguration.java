package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.lobby.LobbyWebSocket;
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

    private final LobbyWebSocket lobbyWebSocket;
    private final GameWebSocket gameWebSocket;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(lobbyWebSocket, "/api/ws/lobby")
                .setAllowedOrigins("*");
        registry.addHandler(gameWebSocket, "/api/ws/game")
                .setAllowedOrigins("*");
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxSessionIdleTimeout(1800000L); // 30min
        container.setMaxTextMessageBufferSize(524288);   // 0.5MiB
        container.setMaxBinaryMessageBufferSize(524288); // 0.5MiB
        return container;
    }
}
