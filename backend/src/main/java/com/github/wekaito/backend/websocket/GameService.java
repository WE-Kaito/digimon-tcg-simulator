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
import java.util.*;

@Service
@RequiredArgsConstructor
public class GameService extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;

    private final ProfileService profileService;

    private final IdService idService;
    private final Map<String, Set<WebSocketSession>> gameRooms = new HashMap<>();

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

        WebSocketSession opponentSession = null;
        for (WebSocketSession webSocketSession : gameRoom) {
            if (webSocketSession != null && Objects.requireNonNull(webSocketSession.getPrincipal()).getName().equals(username)) {
                opponentSession = gameRoom.stream()
                        .filter(s -> !username.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                        .findFirst().orElse(null);

                if (opponentSession != null && opponentSession.isOpen()) {
                    opponentSession.sendMessage(new TextMessage("[PLAYER_LEFT]"));
                }
                break;
            }
        }

        gameRoom.remove(session);
        if (opponentSession != null) {
            gameRoom.remove(opponentSession);
        }

        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        String[] parts = payload.split(":", 2);

        if (payload.startsWith("/startGame:")) {
            String gameId = parts[1].trim();
            setUpGame(session, gameId);
            distributeCards(gameId);
            return;
        }

        String gameId = parts[0];
        String command = parts[1];
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);
        if (gameRoom == null) return;
        if (command.startsWith("/surrender:")) {
            handleSurrender(session, gameRoom, command);
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

    void distributeCards(String gameId) throws IOException {
        String user1 = gameId.split("_")[0];
        String user2 = gameId.split("_")[1];

        Card[] deck1 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user1)).cards();
        Card[] deck2 = profileService.getDeckById(mongoUserDetailsService.getActiveDeck(user2)).cards();

        List<GameCard> newDeck1 = createGameDeck(deck1);
        List<GameCard> newDeck2 = createGameDeck(deck2);

        GameCard[] player1EggDeck = newDeck1.stream().filter(card -> card.type().equals("Digi-Egg")).toArray(GameCard[]::new);
        GameCard[] player1Security = newDeck1.stream().limit(5).toArray(GameCard[]::new);
        newDeck1.subList(0, Math.min(5, newDeck1.size())).clear();
        GameCard[] player1Hand = newDeck1.stream().limit(5).toArray(GameCard[]::new);
        newDeck1.subList(0, Math.min(5, newDeck1.size())).clear();

        GameCard[] player2EggDeck = newDeck2.stream().filter(card -> card.type().equals("Digi-Egg")).toArray(GameCard[]::new);
        GameCard[] player2Security = newDeck2.stream().limit(5).toArray(GameCard[]::new);
        newDeck2.subList(0, Math.min(5, newDeck2.size())).clear();
        GameCard[] player2Hand = newDeck2.stream().limit(5).toArray(GameCard[]::new);
        newDeck2.subList(0, Math.min(5, newDeck2.size())).clear();

        GameCard[] empty = new GameCard[0];
        Game newGame = new Game(0, player1Hand, newDeck1.toArray(GameCard[]::new), player1EggDeck, empty, player1Security, empty, empty, empty, empty, empty, empty, empty, player2Hand, newDeck2.toArray(GameCard[]::new), player2EggDeck, empty, player2Security, empty, empty, empty, empty, empty, empty, empty);
        ObjectMapper objectMapper = new ObjectMapper();
        String newGameJson = objectMapper.writeValueAsString(newGame);
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);

        if (gameRoom == null) return;
        for (WebSocketSession s : gameRoom) {
            s.sendMessage(new TextMessage("[DISTRIBUTE_CARDS]:" + newGameJson));
        }
    }

    List<GameCard> createGameDeck(Card[] deck) {
        Random rand = new Random();
        List<GameCard> gameDeck = new ArrayList<>();

        for (int i = deck.length - 1; i > 0; i--) {
            int j = rand.nextInt(i + 1);
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
            System.out.println("Surrender");
        }

        gameRoom.remove(session);
        gameRoom.remove(opponentSession);

        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }

}
