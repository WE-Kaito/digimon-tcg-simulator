package com.github.wekaito.backend.websocket.game.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.security.Principal;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GameRoomResolvingEffectsTest {

    private GameRoom gameRoom;
    private TestSession player1;
    private TestSession player2;

    @BeforeEach
    void setUp() {
        Player playerOne = new Player("player-one", "avatar-one", "sleeve-one", "egg-one");
        Player playerTwo = new Player("player-two", "avatar-two", "sleeve-two", "egg-two");
        gameRoom = new GameRoom("game", playerOne, List.of(), List.of(), playerTwo, List.of(), List.of());

        player1 = sessionFor("session-one", "player-one");
        player2 = sessionFor("session-two", "player-two");
        gameRoom.addSession(player1.session());
        gameRoom.addSession(player2.session());
    }

    @Test
    void storesEachPlayersResolvingStateIndependently() {
        gameRoom.setResolvingEffectsForSession(player1.session(), true);
        gameRoom.setResolvingEffectsForSession(player2.session(), true);

        assertThat(gameRoom.isPlayer1ResolvingEffects()).isTrue();
        assertThat(gameRoom.isPlayer2ResolvingEffects()).isTrue();

        gameRoom.setResolvingEffectsForSession(player1.session(), false);

        assertThat(gameRoom.isPlayer1ResolvingEffects()).isFalse();
        assertThat(gameRoom.isPlayer2ResolvingEffects()).isTrue();
    }

    @Test
    void sendsPersonalizedStateToBothPlayersWhenRestoringAConnection() throws Exception {
        gameRoom.setResolvingEffectsForSession(player1.session(), true);
        gameRoom.setResolvingEffectsForSession(player2.session(), false);

        gameRoom.broadcastResolvingEffectsState();

        assertThat(player1.messages()).containsExactly(
                "[MY_RESOLVING_EFFECTS]:true",
                "[RESOLVING_EFFECTS]:false"
        );
        assertThat(player2.messages()).containsExactly(
                "[MY_RESOLVING_EFFECTS]:false",
                "[RESOLVING_EFFECTS]:true"
        );
    }

    @Test
    void startingANewGameClearsBothPlayersResolvingState() throws Exception {
        gameRoom.setResolvingEffectsForSession(player1.session(), true);
        gameRoom.setResolvingEffectsForSession(player2.session(), true);
        player1.messages().clear();
        player2.messages().clear();

        gameRoom.initiateGame();

        assertThat(gameRoom.isPlayer1ResolvingEffects()).isFalse();
        assertThat(gameRoom.isPlayer2ResolvingEffects()).isFalse();
        assertThat(player1.messages()).isNotEmpty();
        assertThat(player2.messages()).isNotEmpty();
    }

    private TestSession sessionFor(String id, String username) {
        List<String> messages = new ArrayList<>();
        Principal principal = () -> username;
        WebSocketSession session = (WebSocketSession) Proxy.newProxyInstance(
                WebSocketSession.class.getClassLoader(),
                new Class<?>[]{WebSocketSession.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "getId" -> id;
                    case "getPrincipal" -> principal;
                    case "isOpen" -> true;
                    case "sendMessage" -> {
                        messages.add(((TextMessage) args[0]).getPayload());
                        yield null;
                    }
                    case "toString" -> id;
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> null;
                }
        );
        return new TestSession(session, messages);
    }

    private record TestSession(WebSocketSession session, List<String> messages) {}
}
