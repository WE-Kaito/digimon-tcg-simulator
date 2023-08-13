package com.github.wekaito.backend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfiguration implements WebSocketConfigurer {

    private final ChatService chatService;
    private final GameService gameService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatService, "/api/ws/chat")
                .setAllowedOrigins("*");
        registry.addHandler(gameService, "/api/ws/game")
                .setAllowedOrigins("*");
    }
}
