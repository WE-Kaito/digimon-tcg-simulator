package com.github.wekaito.backend.websocket.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.websocket.game.models.BoardState;
import com.github.wekaito.backend.websocket.game.models.EffectTargetPayload;
import com.github.wekaito.backend.websocket.game.models.GameCard;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import com.github.wekaito.backend.websocket.game.models.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GameWebSocketEffectTargetTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String ROOM_ID = "player1‗player2";

    private GameWebSocket gameWebSocket;
    private GameRoom gameRoom;
    private WebSocketSession player1Session;
    private WebSocketSession player2Session;
    private List<String> player1Messages;
    private List<String> player2Messages;
    private GameCard sourceCard;
    private GameCard effectSourceCard;
    private GameCard targetCard;

    @BeforeEach
    void setUp() {
        gameWebSocket = new GameWebSocket(null, null, null, event -> { });
        gameRoom = new GameRoom(
                ROOM_ID,
                new Player("player1", "", "", ""),
                List.of(),
                List.of(),
                new Player("player2", "", "", ""),
                List.of(),
                List.of()
        );

        sourceCard = gameCard("Source Digimon");
        effectSourceCard = gameCard("Inherited Digimon");
        targetCard = gameCard("Target Digimon");
        BoardState boardState = new BoardState();
        boardState.setPlayer1Digi1(List.of(effectSourceCard, sourceCard));
        boardState.setPlayer2Digi2(List.of(targetCard));
        gameRoom.setBoardState(boardState);

        TestSession player1 = session("player1", "session-1");
        TestSession player2 = session("player2", "session-2");
        player1Session = player1.session();
        player2Session = player2.session();
        player1Messages = player1.messages();
        player2Messages = player2.messages();
        gameRoom.addSession(player1Session);
        gameRoom.addSession(player2Session);
        gameWebSocket.getGameRooms().put(ROOM_ID, gameRoom);
    }

    @Test
    void broadcastsValidatedEffectTargetAndStoresStructuredHistory() throws Exception {
        EffectTargetPayload payload = new EffectTargetPayload(
                sourceCard.getId().toString(),
                null,
                targetCard.getId().toString(),
                "myDigi1",
                "opponentDigi2",
                "On Play",
                "Delete 1 of your opponent's Digimon."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).singleElement().satisfies(message -> assertThat(message)
                .startsWith("[EFFECT_TARGET]:")
                .contains("\"sourceOwner\":\"player1\"")
                .contains("\"targetOwner\":\"player2\"")
                .contains("\"sourceName\":\"Source Digimon\"")
                .contains("\"targetName\":\"Target Digimon\""));
        assertThat(player2Messages).hasSize(1);
        assertThat(player2Messages.get(0)).startsWith("[EFFECT_TARGET]:");
        assertThat(gameRoom.getChat()).hasSize(1);
        assertThat(gameRoom.getChat()[0]).startsWith("player1﹕[EFFECT_TARGET]≔");
    }

    @Test
    void derivesTheEffectSourceNameFromTheValidatedSourceStack() throws Exception {
        EffectTargetPayload payload = new EffectTargetPayload(
                sourceCard.getId().toString(),
                effectSourceCard.getId().toString(),
                targetCard.getId().toString(),
                "myDigi1",
                "opponentDigi2",
                "Your Turn",
                "When this Digimon attacks, you may unsuspend it."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).singleElement().satisfies(message -> assertThat(message)
                .contains("\"effectSourceCardId\":\"" + effectSourceCard.getId() + "\"")
                .contains("\"effectSourceName\":\"Inherited Digimon\""));
    }

    @Test
    void rejectsAnEffectSourceCardThatIsNotInTheClaimedSourceStack() throws Exception {
        EffectTargetPayload payload = new EffectTargetPayload(
                sourceCard.getId().toString(),
                UUID.randomUUID().toString(),
                targetCard.getId().toString(),
                "myDigi1",
                "opponentDigi2",
                "Your Turn",
                "When this Digimon attacks, you may unsuspend it."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).containsExactly("[COMMAND_REJECTED]:effectTarget");
        assertThat(player2Messages).isEmpty();
    }

    @Test
    void rejectsTargetIdThatDoesNotExistAtClaimedLocation() throws Exception {
        EffectTargetPayload payload = new EffectTargetPayload(
                sourceCard.getId().toString(),
                null,
                UUID.randomUUID().toString(),
                "myDigi1",
                "opponentDigi2",
                "On Play",
                "Delete 1 of your opponent's Digimon."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).containsExactly("[COMMAND_REJECTED]:effectTarget");
        assertThat(player2Messages).noneMatch(message -> message.startsWith("[EFFECT_TARGET]:"));
        assertThat(gameRoom.getChat()).isNull();
    }

    @Test
    void rejectsSourceCardClaimedAtTheWrongLocation() throws Exception {
        EffectTargetPayload payload = new EffectTargetPayload(
                sourceCard.getId().toString(),
                null,
                targetCard.getId().toString(),
                "myDigi2",
                "opponentDigi2",
                "On Play",
                "Delete 1 of your opponent's Digimon."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).containsExactly("[COMMAND_REJECTED]:effectTarget");
        assertThat(player2Messages).noneMatch(message -> message.startsWith("[EFFECT_TARGET]:"));
    }

    @Test
    void acceptsARevealedEffectSourceFromThePlayersHand() throws Exception {
        GameCard handCard = gameCard("Gaia Force");
        gameRoom.getBoardState().setPlayer1Hand(List.of(handCard));
        EffectTargetPayload payload = new EffectTargetPayload(
                handCard.getId().toString(),
                null,
                targetCard.getId().toString(),
                "myHand",
                "opponentDigi2",
                "On Play",
                "Delete 1 of your opponent's Digimon."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).singleElement().satisfies(message -> assertThat(message)
                .startsWith("[EFFECT_TARGET]:")
                .contains("\"sourceLocation\":\"myHand\"")
                .contains("\"sourceName\":\"Gaia Force\""));
        assertThat(player2Messages).hasSize(1);
    }

    @Test
    void rejectsAConcealedEffectSourceFromThePlayersHand() throws Exception {
        GameCard handCard = gameCard("Gaia Force");
        handCard.setIsFaceUp(false);
        gameRoom.getBoardState().setPlayer1Hand(List.of(handCard));
        EffectTargetPayload payload = new EffectTargetPayload(
                handCard.getId().toString(),
                null,
                targetCard.getId().toString(),
                "myHand",
                "opponentDigi2",
                "On Play",
                "Delete 1 of your opponent's Digimon."
        );

        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:" + OBJECT_MAPPER.writeValueAsString(payload))
        );

        assertThat(player1Messages).containsExactly("[COMMAND_REJECTED]:effectTarget");
        assertThat(player2Messages).isEmpty();
    }

    @Test
    void rejectsMalformedPayload() throws Exception {
        gameWebSocket.handleTextMessage(
                player1Session,
                new TextMessage(ROOM_ID + ":/effectTarget:{not-json}")
        );

        assertThat(player1Messages).containsExactly("[COMMAND_REJECTED]:effectTarget");
        assertThat(player2Messages).noneMatch(message -> message.startsWith("[EFFECT_TARGET]:"));
    }

    private GameCard gameCard(String name) {
        return GameCard.builder()
                .id(UUID.randomUUID())
                .name(name)
                .isFaceUp(true)
                .build();
    }

    private TestSession session(String username, String id) {
        Principal principal = () -> username;
        List<String> messages = new ArrayList<>();
        WebSocketSession session = (WebSocketSession) Proxy.newProxyInstance(
                WebSocketSession.class.getClassLoader(),
                new Class<?>[]{WebSocketSession.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "getPrincipal" -> principal;
                    case "getId" -> id;
                    case "isOpen" -> true;
                    case "sendMessage" -> {
                        messages.add(String.valueOf(((WebSocketMessage<?>) args[0]).getPayload()));
                        yield null;
                    }
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "getAttributes" -> java.util.Map.of();
                    case "toString" -> "TestWebSocketSession[" + id + "]";
                    default -> defaultValue(method.getReturnType());
                }
        );
        return new TestSession(session, messages);
    }

    private static Object defaultValue(Class<?> type) {
        if (!type.isPrimitive() || type == void.class) {
            return null;
        }
        if (type == boolean.class) {
            return false;
        }
        if (type == char.class) {
            return '\0';
        }
        return 0;
    }

    private record TestSession(WebSocketSession session, List<String> messages) {}
}
