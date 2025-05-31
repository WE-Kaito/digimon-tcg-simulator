package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.websocket.game.GameService;
import com.github.wekaito.backend.websocket.lobby.LobbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
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
}
