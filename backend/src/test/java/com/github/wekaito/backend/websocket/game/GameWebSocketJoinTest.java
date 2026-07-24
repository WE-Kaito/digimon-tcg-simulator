package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.Player;
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
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        List<String> messages = new ArrayList<>();
        WebSocketSession session = createSession("player", messages);

        gameWebSocket.handleTextMessage(session, new TextMessage("/joinGame:player‗opponent"));

        assertTrue(gameWebSocket.getGameRooms().isEmpty());
        assertEquals(List.of("[GAME_JOIN_REJECTED]"), messages);
    }

    @Test
    void returningFromMissingGameStillAcknowledgesLobbyNavigation() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        List<String> messages = new ArrayList<>();
        WebSocketSession session = createSession("player", messages);

        gameWebSocket.handleTextMessage(session, new TextMessage("expired-game:/returnToLobby"));

        assertEquals(List.of("[RETURN_TO_LOBBY]"), messages);
    }

    @Test
    void surrenderDestroysGameAndNotifiesOpponent() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        List<String> surrenderingPlayerMessages = new ArrayList<>();
        List<String> opponentMessages = new ArrayList<>();
        WebSocketSession surrenderingPlayer = createSession("player", surrenderingPlayerMessages);
        WebSocketSession opponent = createSession("opponent", opponentMessages);
        GameRoom room = new GameRoom(
                "game",
                new Player("player", "", "", ""),
                List.of(),
                List.of(),
                new Player("opponent", "", "", ""),
                List.of(),
                List.of()
        );
        room.addSession(surrenderingPlayer);
        room.addSession(opponent);
        gameWebSocket.getGameRooms().put("game", room);

        gameWebSocket.handleTextMessage(surrenderingPlayer, new TextMessage("game:/surrender"));

        assertTrue(gameWebSocket.getGameRooms().isEmpty());
        assertEquals(List.of("[SURRENDER]"), opponentMessages);
    }

    private WebSocketSession createSession(String username, List<String> messages) {
        Principal principal = () -> username;
        return (WebSocketSession) Proxy.newProxyInstance(
                WebSocketSession.class.getClassLoader(),
                new Class<?>[]{WebSocketSession.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "getPrincipal" -> principal;
                    case "getId" -> username + "-session";
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
