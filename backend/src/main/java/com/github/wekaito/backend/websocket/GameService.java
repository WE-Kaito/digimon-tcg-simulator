package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.IdService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
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

    private final DeckService deckService;

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
        map.put("myDigi6", "opponentDigi6");
        map.put("myDigi7", "opponentDigi7");
        map.put("myDigi8", "opponentDigi8");
        map.put("myDigi9", "opponentDigi9");
        map.put("myDigi10", "opponentDigi10");
        map.put("mySecurity", "opponentSecurity");
        map.put("myHand", "opponentHand");
        map.put("myDeckField", "opponentDeckField");
        map.put("myEggDeck", "opponentEggDeck");
        map.put("myBreedingArea", "opponentBreedingArea");
        map.put("myTrash", "opponentTrash");
        map.put("myTamer", "opponentTamer");
        map.put("myDelay", "opponentDelay");
        map.put("myReveal", "opponentReveal");
        map.put("opponentDigi1", "myDigi1");
        map.put("opponentDigi2", "myDigi2");
        map.put("opponentDigi3", "myDigi3");
        map.put("opponentDigi4", "myDigi4");
        map.put("opponentDigi5", "myDigi5");
        map.put("opponentDigi6", "myDigi6");
        map.put("opponentDigi7", "myDigi7");
        map.put("opponentDigi8", "myDigi8");
        map.put("opponentDigi9", "myDigi9");
        map.put("opponentDigi10", "myDigi10");
        map.put("opponentSecurity", "mySecurity");
        map.put("opponentHand", "myHand");
        map.put("opponentDeckField", "myDeckField");
        map.put("opponentEggDeck", "myEggDeck");
        map.put("opponentBreedingArea", "myBreedingArea");
        map.put("opponentTrash", "myTrash");
        map.put("opponentTamer", "myTamer");
        map.put("opponentDelay", "myDelay");
        map.put("opponentReveal", "myReveal");
        return map;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session)  {
        // do nothing
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, CloseStatus status) throws IOException, InterruptedException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        Set<WebSocketSession> gameRoom = gameRooms.values().stream()
                .filter(s -> s.stream().anyMatch(s1 -> username.equals(Objects.requireNonNull(s1.getPrincipal()).getName())))
                .findFirst().orElse(null);

        if (gameRoom == null) return;
        gameRoom.remove(session);
        Thread.sleep(3000);

        for (WebSocketSession webSocketSession : gameRoom) {
            if (webSocketSession != null && gameRoom.size() < 2)
                webSocketSession.sendMessage(new TextMessage("[PLAYER_LEFT]"));
        }
        gameRoom.remove(session);
        gameRooms.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }

    @Scheduled(fixedRate = 5000)
    public synchronized void sendHeartbeat() {
        for (Set<WebSocketSession> gameRoom : gameRooms.values()) {
            for (WebSocketSession webSocketSession : gameRoom) {
                try {
                    webSocketSession.sendMessage(new TextMessage("[HEARTBEAT]"));
                    if (Objects.requireNonNull(webSocketSession.getPrincipal()).getName().equals("Kaito")) {
                        webSocketSession.sendMessage(new TextMessage("[USER_COUNT]:" + gameRooms.size() * 2));
                    }
                } catch (IOException e) {
                    e.getCause();
                }
            }
        }
    }

    @Override
    protected void handleTextMessage(@NotNull WebSocketSession session, TextMessage message) throws IOException, InterruptedException {
        String userName = Objects.requireNonNull(session.getPrincipal()).getName();
        String payload = message.getPayload();
        if (payload.equals("/heartbeat/")) return;
        String[] parts = payload.split(":", 2);

        if (payload.startsWith("/startGame:") && parts.length >= 2) {
            String gameId = parts[1].trim();
            setUpGame(session, gameId);
            String user1 = gameId.split("‗")[0];
            String user2 = gameId.split("‗")[1];
            List<Card> deck1 = deckService.getDeckCardsById(mongoUserDetailsService.getActiveDeck(user1));
            List<Card> deck2 = deckService.getDeckCardsById(mongoUserDetailsService.getActiveDeck(user2));
            Thread.sleep(600);
            distributeCards(gameId, deck1, deck2);
            return;
        }

        String gameId = parts[0];
        String roomMessage = parts[1];
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);

        if (gameRoom == null) return;

        if (roomMessage.startsWith("/updateGame:")) processGameChunks(gameId, session, roomMessage, gameRoom);

        if (roomMessage.startsWith("/attack:")) handleAttack(gameRoom, roomMessage);

        if (roomMessage.startsWith("/moveCard:")) handleSingleUpdate(gameRoom, roomMessage);

        if (roomMessage.startsWith("/updateMemory:")) handleMemoryUpdate(gameRoom, roomMessage);

        if (roomMessage.startsWith("/chatMessage:")) sendChatMessage(gameRoom, userName, roomMessage);

        else {
            String[] roomMessageParts = roomMessage.split(":", 2);
            String command = roomMessageParts[0];
            String opponentName = roomMessageParts[1];
            sendMessageToOpponent(gameRoom, opponentName, convertCommand(command));
        }
    }

    void sendChatMessage(Set<WebSocketSession> gameRoom, String userName, String roomMessage) throws IOException {
        String[] roomMessageParts = roomMessage.split(":");
        if (roomMessageParts.length < 3) return;
        String opponentName = roomMessageParts[1];
        String chatMessage = roomMessageParts[2];
        sendMessageToOpponent(gameRoom, opponentName, "[CHAT_MESSAGE]:" + userName + ":" + chatMessage);
    }

    String convertCommand(String command) {
        return switch (command) {
            case "/surrender" -> "[SURRENDER]";
            case "/restartRequest" -> "[RESTART]";
            case "/acceptRestart" -> "[ACCEPT_RESTART]";
            case "/openedSecurity" -> "[SECURITY_VIEWED]";
            case "/playRevealSfx" -> "[REVEAL_SFX]";
            case "/playSecurityRevealSfx" -> "[SECURITY_REVEAL_SFX]";
            case "/playPlaceCardSfx" -> "[PLACE_CARD_SFX]";
            case "/playDrawCardSfx" -> "[DRAW_CARD_SFX]";
            case "/playSuspendCardSfx" -> "[SUSPEND_CARD_SFX]";
            case "/playUnsuspendCardSfx" -> "[UNSUSPEND_CARD_SFX]";
            case "/playButtonClickSfx" -> "[BUTTON_CLICK_SFX]";
            case "/playTrashCardSfx" -> "[TRASH_CARD_SFX]";
            case "/playShuffleDeckSfx" -> "[SHUFFLE_DECK_SFX]";
            case "/playerReady" -> "[PLAYER_READY]";
            default -> "";
        };
    }

    void sendMessageToOpponent(Set<WebSocketSession> gameRoom, String opponentName, String message) throws IOException {
        WebSocketSession opponentSession = gameRoom.stream()
                .filter(s -> opponentName.equals(Objects.requireNonNull(s.getPrincipal()).getName()))
                .findFirst().orElse(null);
        sendTextMessage(opponentSession, message);
    }

    synchronized void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if(session == null) return;
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    void setUpGame(WebSocketSession session, String gameId) throws IOException, InterruptedException {
        Set<WebSocketSession> gameRoom = gameRooms.computeIfAbsent(gameId, key -> new HashSet<>());
        gameRoom.add(session);
        String username1 = gameId.split("‗")[0];
        String username2 = gameId.split("‗")[1];

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

    void distributeCards(String gameId, List<Card> deck1, List<Card> deck2) throws IOException {
        Set<WebSocketSession> gameRoom = gameRooms.get(gameId);

        List<GameCard> newDeck1 = createGameDeck(deck1);
        List<GameCard> newDeck2 = createGameDeck(deck2);

        List<GameCard> player1EggDeck = newDeck1.stream()
                .filter(card -> card.type().equals("Digi-Egg")).toList();
        newDeck1.removeAll(player1EggDeck);

        List<GameCard> player1Hand = newDeck1.stream()
                .limit(5).toList();
        newDeck1.removeAll(player1Hand);

        List<GameCard> player1Security = newDeck1.stream()
                .limit(5).toList();
        newDeck1.removeAll(player1Security);

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

        Game newGame = new Game(0, 0, empty, empty, player1Hand.toArray(new GameCard[0]), player1Deck, player1EggDeck.toArray(new GameCard[0]), empty, player1Security.toArray(new GameCard[0]), empty, empty, empty, empty, empty, empty, empty, player2Hand.toArray(new GameCard[0]), player2Deck, player2EggDeck.toArray(new GameCard[0]), empty, player2Security.toArray(new GameCard[0]), empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty, empty);
        String newGameJson = objectMapper.writeValueAsString(newGame);

        for (WebSocketSession s : gameRoom) {
            sendTextMessage(s, "[DISTRIBUTE_CARDS]:" + newGameJson);
        }
    }

    List<GameCard> createGameDeck(List<Card> deck) {
        List<GameCard> gameDeck = new ArrayList<>();

        for (int i = deck.size() - 1; i > 0; i--) {
            int j = secureRand.nextInt(i + 1);
            Card temp = deck.get(i);
            deck.set(i, deck.get(j));
            deck.set(j, temp);
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
        if (roomMessage.split(":").length < 4) return;
        String[] parts = roomMessage.split(":", 4);
        String opponentName = parts[1];
        String from = parts[2];
        String to = parts[3];
        sendMessageToOpponent(gameRoom, opponentName, "[ATTACK]:" + getPosition(from) + ":" + getPosition(to));
    }

    private String getPosition(String fromTo) {
        return positionMap.getOrDefault(fromTo, "");
    }

    void handleSingleUpdate(Set<WebSocketSession> gameRoom, String roomMessage) throws IOException {
        if (roomMessage.split(":").length < 5) return;
        String[] parts = roomMessage.split(":", 5);
        String opponentName = parts[1];
        String cardId = parts[2];
        String from = parts[3];
        String to = parts[4];
        sendMessageToOpponent(gameRoom, opponentName, "[MOVE_CARD]:" + cardId + ":" + getPosition(from) + ":" + getPosition(to));
    }

    void handleMemoryUpdate(Set<WebSocketSession> gameRoom, String roomMessage) throws IOException {
        if (roomMessage.split(":").length < 3) return;
        String[] parts = roomMessage.split(":", 3);
        String opponentName = parts[1];
        int memory = Integer.parseInt(parts[2]) * -1;
        sendMessageToOpponent(gameRoom, opponentName, "[UPDATE_MEMORY]:" + memory);
    }
}
