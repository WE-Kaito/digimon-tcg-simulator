package com.github.wekaito.backend.websocket.lobby;

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

class LobbyRoomReturnTest {

    @Test
    void roomCreatedMatchPreservesRoomAndMarksBothPlayersForReturn() throws Exception {
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(null, null, null);
        TestSession host = new TestSession("host");
        TestSession guest = new TestSession("guest");
        Room room = new Room(
                "room-id",
                "Rematch Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host.session(), "host", true),
                        new LobbyPlayer(guest.session(), "guest", true)
                ))
        );
        lobbyWebSocket.getRooms().add(room);

        lobbyWebSocket.handleTextMessage(
                host.session(),
                new TextMessage("/startGame:room-id:host‗guest")
        );

        assertTrue(lobbyWebSocket.getRooms().contains(room));
        assertTrue(lobbyWebSocket.getRoomsWithActiveGames().contains("room-id"));
        assertEquals("room-id", lobbyWebSocket.getGameLobbyRoomByUsername().get("host"));
        assertEquals("room-id", lobbyWebSocket.getGameLobbyRoomByUsername().get("guest"));
        assertTrue(host.messages().contains("[COMPUTE_ROOM_GAME]:host‗guest:room-id"));
        assertTrue(guest.messages().contains("[COMPUTE_ROOM_GAME]:host‗guest:room-id"));
    }

    private record TestSession(WebSocketSession session, List<String> messages) {
        TestSession(String username) {
            this(createFixture(username));
        }

        private TestSession(SessionFixture fixture) {
            this(fixture.session(), fixture.messages());
        }

        private static SessionFixture createFixture(String username) {
            List<String> messages = new ArrayList<>();
            Principal principal = () -> username;
            WebSocketSession session = (WebSocketSession) Proxy.newProxyInstance(
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
            return new SessionFixture(session, messages);
        }
    }

    private record SessionFixture(WebSocketSession session, List<String> messages) {}
}
