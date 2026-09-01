package com.github.wekaito.backend.websocket.lobby;

import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.game.GameLobbyReturnEvent;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LobbyRoomReturnTest {

    @Test
    void roomCreatedMatchPreservesRoomAndMarksBothPlayersForReturn() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {}) {
            @Override
            public boolean createGameRoom(String gameId, String username1, String username2) {
                return true;
            }
        };
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
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
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(host.session(), guest.session()));

        lobbyWebSocket.handleTextMessage(
                host.session(),
                new TextMessage("/startGame:room-id:host‗guest")
        );

        assertTrue(lobbyWebSocket.getRooms().contains(room));
        assertTrue(lobbyWebSocket.getRoomsWithActiveGames().contains("room-id"));
        assertEquals("room-id", lobbyWebSocket.getGameLobbyRoomByUsername().get("host"));
        assertEquals("room-id", lobbyWebSocket.getGameLobbyRoomByUsername().get("guest"));
        assertTrue(host.messages().stream().anyMatch(message -> message.matches(
                "\\[COMPUTE_ROOM_GAME]:[0-9a-f-]{36}:room-id")));
        assertTrue(guest.messages().stream().anyMatch(message -> message.matches(
                "\\[COMPUTE_ROOM_GAME]:[0-9a-f-]{36}:room-id")));
    }

    @Test
    void startGameNormalizesDuplicateHostMembershipAndUsesNewestSession() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {}) {
            @Override
            public boolean createGameRoom(String gameId, String username1, String username2) {
                return true;
            }
        };
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
        TestSession oldHost = new TestSession("host");
        TestSession guest = new TestSession("guest");
        TestSession newestHost = new TestSession("host");
        Room room = new Room(
                "room-id",
                "Rematch Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(oldHost.session(), "host", true),
                        new LobbyPlayer(guest.session(), "guest", true),
                        new LobbyPlayer(newestHost.session(), "host", true)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().addAll(List.of(newestHost.session(), guest.session()));

        lobbyWebSocket.handleTextMessage(
                newestHost.session(),
                new TextMessage("/startGame:room-id:host‗guest")
        );

        assertEquals(List.of("host", "guest"), room.getPlayers().stream().map(LobbyPlayer::getName).toList());
        assertEquals(newestHost.session(), room.getPlayers().get(0).getSession());
        assertTrue(newestHost.messages().stream().anyMatch(message -> message.matches(
                "\\[COMPUTE_ROOM_GAME]:[0-9a-f-]{36}:room-id")));
        assertTrue(guest.messages().stream().anyMatch(message -> message.matches(
                "\\[COMPUTE_ROOM_GAME]:[0-9a-f-]{36}:room-id")));
    }

    @Test
    void rejectedStartGameReturnsReasonToHost() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
        TestSession host = new TestSession("host");
        Room room = new Room(
                "room-id",
                "Rematch Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(new LobbyPlayer(host.session(), "host", true)))
        );
        lobbyWebSocket.getRooms().add(room);

        lobbyWebSocket.handleTextMessage(host.session(), new TextMessage("/startGame:room-id:host‗guest"));

        assertTrue(host.messages().contains("[START_GAME_REJECTED]"));
        assertTrue(host.messages().contains(
                "[CHAT_MESSAGE_ROOM]:【SERVER】: The game requires exactly two distinct players."));
    }

    @Test
    void startGameWaitsUntilBothPlayersHaveActiveLobbySessions() throws Exception {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
        TestSession host = new TestSession("host");
        TestSession staleGuest = new TestSession("guest", false);
        Room room = new Room(
                "room-id",
                "Rematch Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(host.session(), "host", true),
                        new LobbyPlayer(staleGuest.session(), "guest", true)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getGlobalActiveSessions().add(host.session());

        lobbyWebSocket.handleTextMessage(host.session(), new TextMessage("/startGame:room-id:host‗guest"));

        assertTrue(host.messages().contains("[START_GAME_REJECTED]"));
        assertTrue(host.messages().contains(
                "[CHAT_MESSAGE_ROOM]:【SERVER】: Waiting for both players to reconnect."));
        assertTrue(gameWebSocket.getGameRooms().isEmpty());
    }

    @Test
    void hostReturnEventPreservesGuestDuringLobbyReconnectTransition() {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
        TestSession oldHost = new TestSession("host", false);
        TestSession disconnectedGuestWithStaleLobbySocket = new TestSession("guest", false);
        Room room = new Room(
                "room-id",
                "Rematch Room",
                "host",
                false,
                "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(oldHost.session(), "host", true),
                        new LobbyPlayer(disconnectedGuestWithStaleLobbySocket.session(), "guest", true)
                ))
        );
        lobbyWebSocket.getRooms().add(room);
        lobbyWebSocket.getRoomsWithActiveGames().add("room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("host", "room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("guest", "room-id");

        lobbyWebSocket.handleGameLobbyReturn(new GameLobbyReturnEvent("host", Set.of("guest")));

        assertEquals(List.of("host", "guest"), room.getPlayers().stream().map(LobbyPlayer::getName).toList());
        assertTrue(room.getPlayers().get(0).isReady());
        assertEquals("room-id", lobbyWebSocket.getGameLobbyRoomByUsername().get("guest"));
        assertTrue(lobbyWebSocket.getPlayerReconnectDeadlinesByRoomId()
                .get("room-id")
                .containsKey("guest"));
        assertTrue(!lobbyWebSocket.getRoomsWithActiveGames().contains("room-id"));
    }

    @Test
    void guestMembershipExpiresAfterLobbyReconnectTimeout() {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
        TestSession host = new TestSession("host");
        TestSession guest = new TestSession("guest", false);
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
        lobbyWebSocket.getRoomsWithActiveGames().add("room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("host", "room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("guest", "room-id");

        lobbyWebSocket.handleGameLobbyReturn(new GameLobbyReturnEvent("host", Set.of("guest")));
        long deadline = lobbyWebSocket.getPlayerReconnectDeadlinesByRoomId()
                .get("room-id")
                .get("guest");
        lobbyWebSocket.reconcileAbandonedRooms(deadline);

        assertEquals(List.of("host"), room.getPlayers().stream().map(LobbyPlayer::getName).toList());
        assertEquals(null, lobbyWebSocket.getGameLobbyRoomByUsername().get("guest"));
    }

    @Test
    void guestReturnEventAlsoReopensTheLobbyRoom() {
        GameWebSocket gameWebSocket = new GameWebSocket(null, null, null, event -> {});
        MongoUserDetailsService userDetailsService = new MongoUserDetailsService(null, null) {
            @Override
            public String getAvatar(String username) {
                return "avatar";
            }
        };
        LobbyWebSocket lobbyWebSocket = new LobbyWebSocket(userDetailsService, null, null, gameWebSocket);
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
        lobbyWebSocket.getRoomsWithActiveGames().add("room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("host", "room-id");
        lobbyWebSocket.getGameLobbyRoomByUsername().put("guest", "room-id");

        lobbyWebSocket.handleGameLobbyReturn(new GameLobbyReturnEvent("guest", Set.of()));

        assertTrue(!lobbyWebSocket.getRoomsWithActiveGames().contains("room-id"));
        assertEquals(List.of("host", "guest"), room.getPlayers().stream().map(LobbyPlayer::getName).toList());
    }

    private record TestSession(WebSocketSession session, List<String> messages) {
        TestSession(String username) {
            this(username, true);
        }

        TestSession(String username, boolean open) {
            this(createFixture(username, open));
        }

        private TestSession(SessionFixture fixture) {
            this(fixture.session(), fixture.messages());
        }

        private static SessionFixture createFixture(String username, boolean open) {
            List<String> messages = new ArrayList<>();
            Principal principal = () -> username;
            WebSocketSession session = (WebSocketSession) Proxy.newProxyInstance(
                    WebSocketSession.class.getClassLoader(),
                    new Class<?>[]{WebSocketSession.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "getPrincipal" -> principal;
                        case "isOpen" -> open;
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
