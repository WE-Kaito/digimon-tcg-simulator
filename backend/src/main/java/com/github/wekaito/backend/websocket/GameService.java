package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.IdService;
import com.github.wekaito.backend.ProfileService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
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
@RequiredArgsConstructor
public class GameService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;

    private final ProfileService profileService;

    private final IdService idService;
    private final Map<String, Set<WebSocketSession>> gameRooms = new HashMap<>();

    private final ObjectMapper objectMapper;

    private final SecureRandom secureRand = new SecureRandom();

    public Map<String, Set<WebSocketSession>> getGameRooms() {
        return gameRooms;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // do nothing
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        Set<WebSocketSession> gameRoom = gameRooms.values().stream()
                .filter(s -> s.stream().anyMatch(s1 -> username.equals(Objects.requireNonNull(s1.getPrincipal()).getName())))
                .findFirst().orElse(null);

        if (gameRoom == null) return;

        for (WebSocketSession webSocketSession : gameRoom) {
            if (webSocketSession != null && Objects.requireNonNull(webSocketSession.getPrincipal()).getName().equals(username)) {
                WebSocketSession opponentSession = gameRoom.stream()
                        .filter(s -> !username.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                        .findFirst().orElse(null);

                if (opponentSession != null && opponentSession.isOpen()) {
                    opponentSession.sendMessage(new TextMessage("[PLAYER_LEFT]"));
                }
                gameRoom.remove(opponentSession);
                break;
            }
        }

        gameRoom.remove(session);
        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException, InterruptedException {
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
        String command = parts[1];
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);

        if (gameRoom == null) return;

        if (command.startsWith("/updateGame:")) processGameChunks(gameId, session, command, gameRoom);

        if (command.startsWith("/surrender:")) handleSurrender(session, gameRoom, command);

        if (command.startsWith("/restartRequest:")) sendMessageToOpponent(gameRoom, command, "[RESTART]");

        if (command.startsWith("/openedSecurity:")) sendMessageToOpponent(gameRoom, command, "[SECURITY_VIEWED]");

        if (command.startsWith("/attack:")) handleAttack(gameRoom, command);
    }

    void sendMessageToOpponent(Set<WebSocketSession> gameRoom,String command, String message) throws IOException {
        String opponentName = command.split(":")[1].trim();
        WebSocketSession opponentSession = gameRoom.stream()
                .filter(s -> opponentName.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);
        if (opponentSession != null && opponentSession.isOpen()) {
            opponentSession.sendMessage(new TextMessage(message));
        }
    }

    void setUpGame(WebSocketSession session, String gameId) throws IOException {
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
        TextMessage textMessage = new TextMessage("[START_GAME]:" + playersJson);

        session.sendMessage(textMessage);
    }

    void distributeCards(String gameId) throws IOException, InterruptedException {
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);
        String user1 = gameId.split("_")[0];
        String user2 = gameId.split("_")[1];

        String[] names = {user1, user2};
        int index = secureRand.nextInt(names.length);
        for (WebSocketSession s : gameRoom) {
            s.sendMessage(new TextMessage("[STARTING_PLAYER]:" + names[index]));
        }
        Thread.sleep(3600);

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
            s.sendMessage(new TextMessage("[DISTRIBUTE_CARDS]:" + newGameJson));
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

    void handleSurrender(WebSocketSession session, Set<WebSocketSession> gameRoom, String command) throws IOException {
        String opponentName = command.split(":")[1].trim();
        WebSocketSession opponentSession = gameRoom.stream()
                .filter(s -> opponentName.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);

        if (opponentSession != null && opponentSession.isOpen()) {
            opponentSession.sendMessage(new TextMessage("[SURRENDER]"));
        }

        gameRoom.remove(session);
        gameRoom.remove(opponentSession);

        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
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
            if (s.isOpen() && !Objects.requireNonNull(s.getPrincipal()).getName().equals(Objects.requireNonNull(session.getPrincipal()).getName())) {
                s.sendMessage(new TextMessage("[DISTRIBUTE_CARDS]:" + fullGameJson));
            }
        }
    }

    void handleAttack(Set<WebSocketSession> gameRoom, String command) throws IOException {
        String[] parts = command.split(":", 4);
        String from = parts[2];
        String to = parts[3];
        sendMessageToOpponent(gameRoom, command, "[ATTACK]:" + getFrom(from) + ":" + getTo(to));
    }

    private String getFrom(String from) {
        String newFrom = "";
        switch (from) {
            case "myDigi1":
                newFrom += "opponentDigi1"; break;
            case "myDigi2":
                newFrom += "opponentDigi2"; break;
            case "myDigi3":
                newFrom += "opponentDigi3"; break;
            case "myDigi4":
                newFrom += "opponentDigi4"; break;
            case "myDigi5":
                newFrom += "opponentDigi5"; break;
        }
        return newFrom;
    }

    private String getTo(String to) {
        String newTo = "";
        switch (to) {
            case "opponentDigi1":
                newTo += "myDigi1"; break;
            case "opponentDigi2":
                newTo += "myDigi2"; break;
            case "opponentDigi3":
                newTo += "myDigi3"; break;
            case "opponentDigi4":
                newTo += "myDigi4"; break;
            case "opponentDigi5":
                newTo += "myDigi5"; break;
            case "opponentSecurity":
                newTo += "mySecurity"; break;
        }
        return newTo;
    }
}
