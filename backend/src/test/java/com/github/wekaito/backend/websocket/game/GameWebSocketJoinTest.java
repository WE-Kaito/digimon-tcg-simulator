package com.github.wekaito.backend.websocket.game;

import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameWebSocketJoinTest {

    @Test
    void joiningMissingGameIsRejectedWithoutCreatingRoom() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);
        List<String> messages = new ArrayList<>();
        WebSocketSession session = createSession("player", messages);

        gameWebSocket.handleTextMessage(session, new TextMessage("/joinGame:player‗opponent"));

        assertTrue(gameWebSocket.getGameRooms().isEmpty());
        assertEquals(List.of("[GAME_JOIN_REJECTED]"), messages);
    }

    @Test
    void returningFromMissingGameStillAcknowledgesLobbyNavigation() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null);
        List<String> messages = new ArrayList<>();
        WebSocketSession session = createSession("player", messages);

        gameWebSocket.handleTextMessage(session, new TextMessage("expired-game:/returnToLobby"));

        assertEquals(List.of("[RETURN_TO_LOBBY]"), messages);
    }

    private WebSocketSession createSession(String username, List<String> messages) {
        Principal principal = () -> username;
        return (WebSocketSession) Proxy.newProxyInstance(
                WebSocketSession.class.getClassLoader(),
                new Class<?>[]{WebSocketSession.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "getPrincipal" -> principal;
                    case "isOpen" -> true;
                    case "sendMessage" -> {
                        WebSocketMessage<?> message = (WebSocketMessage<?>) args[0];
                        messages.add(message.getPayload().toString());
                        yield null;
                    }
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> null;
                }
        );
    }
}
