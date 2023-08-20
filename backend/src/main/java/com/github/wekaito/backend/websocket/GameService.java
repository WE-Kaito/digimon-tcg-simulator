package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.IdService;
import com.github.wekaito.backend.ProfileService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;

@Service
@Getter
@RequiredArgsConstructor
public class GameService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;

    private final ProfileService profileService;

    private final IdService idService;

    private final Map<String, Set<WebSocketSession>> gameRooms = new HashMap<>();

    private final ObjectMapper objectMapper;

    private final SecureRandom secureRand = new SecureRandom();

    @Getter
    private final Map<String, String> positionMap = initializePositionMap();

    private Map<String, String> initializePositionMap() {
        Map<String, String> map = new HashMap<>();
        map.put("myDigi1", "opponentDigi1");
        map.put("myDigi2", "opponentDigi2");
        map.put("myDigi3", "opponentDigi3");
        map.put("myDigi4", "opponentDigi4");
        map.put("myDigi5", "opponentDigi5");
        map.put("opponentDigi1", "myDigi1");
        map.put("opponentDigi2", "myDigi2");
        map.put("opponentDigi3", "myDigi3");
        map.put("opponentDigi4", "myDigi4");
        map.put("opponentDigi5", "myDigi5");
        map.put("opponentSecurity", "mySecurity");
        return map;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // do nothing
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, CloseStatus status) {
        // do nothing
    }


    @Override
    protected void handleTextMessage(@NotNull WebSocketSession session, TextMessage message) throws IOException, InterruptedException {
        String payload = message.getPayload();
        String[] parts = payload.split(":", 2);

        if (payload.startsWith("/startGame:")) {
            String gameId = parts[1].trim();
            setUpGame(session, gameId);
            Thread.sleep(600);
            distributeCards(gameId);
            return;
        }

        String gameId = parts[0];
        String roomMessage = parts[1];
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);

        if (gameRoom == null) return;

        if (roomMessage.startsWith("/updateGame:")) processGameChunks(gameId, session, roomMessage, gameRoom);

        if (roomMessage.startsWith("/attack:")) handleAttack(gameRoom, roomMessage);

        else{
            String[] roomMessageParts = roomMessage.split(":", 2);
            String command = roomMessageParts[0];
            String opponentName = roomMessageParts[1];
            sendMessageToOpponent(gameRoom, opponentName, convertCommand(command));
            if (command.equals("/surrender")) {
                gameRooms.entrySet().removeIf(entry -> entry.getValue().equals(gameRoom));
            }
        }
    }

    String convertCommand(String command){
        switch(command){
            case "/surrender":
                return "[SURRENDER]";
            case "/restartRequest":
                return "[RESTART]";
            case "/openedSecurity":
                return "[SECURITY_VIEWED]";
            case "/playRevealSfx":
                return "[REVEAL_SFX]";
            case "/playSecurityRevealSfx":
                return "[SECURITY_REVEAL_SFX]";
            case "/playPlaceCardSfx":
                return "[PLACE_CARD_SFX]";
            case "/playDrawCardSfx":
                return "[DRAW_CARD_SFX]";
            case "/playSuspendCardSfx":
                return "[SUSPEND_CARD_SFX]";
            case "/playUnsuspendCardSfx":
                return "[UNSUSPEND_CARD_SFX]";
            case "/playButtonClickSfx":
                return "[BUTTON_CLICK_SFX]";
            case "/playTrashCardSfx":
                return "[TRASH_CARD_SFX]";
            case "/playShuffleDeckSfx":
                return "[SHUFFLE_DECK_SFX]";
            default:
                return "";
        }
    }

    void sendMessageToOpponent(Set<WebSocketSession> gameRoom,String opponentName, String message) throws IOException {
        WebSocketSession opponentSession = gameRoom.stream()
                .filter(s -> opponentName.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);
        if (opponentSession != null) sendTextMessage(opponentSession, message);
    }

    synchronized void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    void setUpGame(WebSocketSession session, String gameId) throws IOException, InterruptedException {
        Set<WebSocketSession> gameRoom = gameRooms.computeIfAbsent(gameId, key -> new HashSet<>());
        gameRoom.add(session);
        String username1 = gameId.split("_")[0];
        String username2 = gameId.split("_")[1];

        String avatar1 = mongoUserDetailsService.getAvatar(username1);
        String avatar2 = mongoUserDetailsService.getAvatar(username2);

        Player player1 = new Player(username1, avatar1);
        Player player2 = new Player(username2, avatar2);

        Player[] players = {player1, player2};
        String playersJson = new ObjectMapper().writeValueAsString(players);
        sendTextMessage(session, "[START_GAME]:" + playersJson);

        String[] names = {username1, username2};
        int index = secureRand.nextInt(names.length);
        for (WebSocketSession s : gameRoom) {
            sendTextMessage(s, "[STARTING_PLAYER]:" + names[index]);
        }
        Thread.sleep(3600);
    }

    void distributeCards(String gameId) throws IOException {
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);
        String user1 = gameId.split("_")[0];
        String user2 = gameId.split("_")[1];

        Card[] deck1 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user1)).cards();
        Card[] deck2 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user2)).cards();

        List<GameCard> newDeck1 = createGameDeck(deck1);
        List<GameCard> newDeck2 = createGameDeck(deck2);

        List<GameCard> player1EggDeck = newDeck1.stream()
                .filter(card -> card.type().equals("Digi-Egg")).toList();
        newDeck1.removeAll(player1EggDeck);

        List<GameCard> player1Security = newDeck1.stream()
                .limit(5).toList();
        newDeck1.removeAll(player1Security);

        List<GameCard> player1Hand = newDeck1.stream()
                .limit(5).toList();
        newDeck1.removeAll(player1Hand);

        List<GameCard> player2EggDeck = newDeck2.stream()
                .filter(card -> card.type().equals("Digi-Egg")).toList();
        newDeck2.removeAll(player2EggDeck);

        List<GameCard> player2Security = newDeck2.stream()
                .limit(5).toList();
        newDeck2.removeAll(player2Security);

        List<GameCard> player2Hand = newDeck2.stream()
                .limit(5).toList();
        newDeck2.removeAll(player2Hand);

        GameCard[] player1Deck = newDeck1.toArray(new GameCard[0]);
        GameCard[] player2Deck = newDeck2.toArray(new GameCard[0]);
        GameCard[] empty = new GameCard[0];

        Game newGame = new Game(0, 0, empty, empty, player1Hand.toArray(new GameCard[0]), player1Deck, player1EggDeck.toArray(new GameCard[0]), empty, player1Security.toArray(new GameCard[0]), empty, empty, empty, empty, empty, empty, empty, player2Hand.toArray(new GameCard[0]), player2Deck, player2EggDeck.toArray(new GameCard[0]), empty, player2Security.toArray(new GameCard[0]), empty, empty, empty, empty, empty, empty, empty, empty, empty);
        String newGameJson = objectMapper.writeValueAsString(newGame);

        for (WebSocketSession s : gameRoom) {
            sendTextMessage(s, "[DISTRIBUTE_CARDS]:" + newGameJson);
        }
    }

    List<GameCard> createGameDeck(Card[] deck) {
        List<GameCard> gameDeck = new ArrayList<>();

        for (int i = deck.length - 1; i > 0; i--) {
            int j = secureRand.nextInt(i + 1);
            Card temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }

        for (Card card : deck) {
            GameCard newCard = new GameCard(idService.createId(), false, card.name(), card.type(), card.color(), card.image_url(), card.cardnumber(), card.stage(), card.attribute(), card.digi_type(), card.dp(), card.play_cost(), card.evolution_cost(), card.level(), card.maineffect(), card.soureeffect());
            gameDeck.add(newCard);
        }

        return gameDeck;
    }

    private final Map<String, StringBuilder> gameChunks = new HashMap<>();

    void processGameChunks(String gameId, WebSocketSession session, String command, Set<WebSocketSession> gameRoom) throws IOException {
        String chunk = command.substring("/updateGame:".length());
        gameChunks.putIfAbsent(gameId, new StringBuilder());
        gameChunks.get(gameId).append(chunk);

        if (chunk.length() < 1000 && chunk.endsWith("}")) {
            String fullGameJson = gameChunks.get(gameId).toString();
            gameChunks.remove(gameId);
            synchronizeGame(session, gameRoom, fullGameJson);
        }
    }
    void synchronizeGame(WebSocketSession session, Set<WebSocketSession> gameRoom, String fullGameJson) throws IOException {
        if (gameRoom == null) return;
        for (WebSocketSession s : gameRoom) {
            if (s.isOpen() && !s.equals(session)) {
                sendTextMessage(s, "[DISTRIBUTE_CARDS]:" + fullGameJson);
            }
        }
    }

    void handleAttack(Set<WebSocketSession> gameRoom, String roomMessage) throws IOException {
        if (roomMessage.split(":", 4).length < 4) return;
        String[] parts = roomMessage.split(":", 4);
        String opponentName = parts[1];
        String from = parts[2];
        String to = parts[3];
        sendMessageToOpponent(gameRoom, opponentName, "[ATTACK]:" + getPosition(from) + ":" + getPosition(to));
    }

    private String getPosition(String fromTo) {
        return positionMap.getOrDefault(fromTo, "");
    }
}
