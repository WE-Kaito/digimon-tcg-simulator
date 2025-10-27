package com.github.wekaito.backend.websocket.game.models;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.Card;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.security.Principal;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ScheduledFuture;

@Setter
@Getter
@RequiredArgsConstructor
public class GameRoom {
    private final String roomId;
    private final Player player1;
    private final List<Card> player1Deck;
    private final Player player2;
    private final List<Card> player2Deck;

    private static final SecureRandom secureRand = new SecureRandom();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final Set<WebSocketSession> sessions = new HashSet<>();
    private final List<ScheduledFuture<?>> scheduledTasks = new ArrayList<>();

    private Boolean player1Mulligan;
    private Boolean player2Mulligan;

    private volatile long lastHeartBeatReceivedPlayer1 = System.currentTimeMillis();
    private volatile long lastHeartBeatReceivedPlayer2 = System.currentTimeMillis();

    private BoardState boardState = null;
    private String[] chat;
    private Phase phase = Phase.BREEDING;
    private String usernameTurn;
    int bootStage = 0; // 0 = CLEAR, 1 = SHOW_STARTING_PLAYER, 2 = MULLIGAN, 3 = MULLIGAN, 4 = GAME_START

    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }
    
    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }

    public void updateLastHearBeat(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal == null) return;
        if (session.getPrincipal().getName().equals(player1.username())) {
            lastHeartBeatReceivedPlayer1 = System.currentTimeMillis();
        } else if (session.getPrincipal().getName().equals(player2.username())) {
            lastHeartBeatReceivedPlayer2 = System.currentTimeMillis();
        }
    }

    private static final long HEARTBEAT_TIMEOUT_MS = 10500; // 10 seconds of client heartbeat + 0.5s buffer

    public boolean hasFullConnection() {
        long now = System.currentTimeMillis();
        return (now - lastHeartBeatReceivedPlayer1 < HEARTBEAT_TIMEOUT_MS) &&
                (now - lastHeartBeatReceivedPlayer2 < HEARTBEAT_TIMEOUT_MS);
    }

    public boolean isEmpty() {
        long now = System.currentTimeMillis();
        return (now - lastHeartBeatReceivedPlayer1 >= HEARTBEAT_TIMEOUT_MS) &&
                (now - lastHeartBeatReceivedPlayer2 >= HEARTBEAT_TIMEOUT_MS);
    }

    public void sendMessagesToAll(String message) {
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                try {
                    s.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Session is broken, will be cleaned up by the cleanup scheduler
                }
            }
        }
    }

    public void sendMessageToOtherSessions(WebSocketSession sender, String message) {
        for (WebSocketSession s : sessions) {
            if (s.isOpen() && !s.getId().equals(sender.getId())) {
                try {
                    s.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Session is broken, will be cleaned up by the cleanup scheduler
                }
            }
        }
    }

    public void progressPhase() {
        if (phase == Phase.UNSUSPEND) phase = Phase.DRAW;
        else if (phase == Phase.DRAW) phase = Phase.BREEDING;
        else if (phase == Phase.BREEDING) phase = Phase.MAIN;
        else if (phase == Phase.MAIN) {
            phase = Phase.UNSUSPEND;
            usernameTurn = usernameTurn.equals(player1.username()) ? player2.username() : player1.username();
        }
    }

    private List<GameCard> createGameDeck(List<Card> deck) {
        List<GameCard> gameDeck = new ArrayList<>();

        for (Card card : deck) {
            GameCard newCard = new GameCard(
                    card.uniqueCardNumber(),
                    card.name(),
                    card.imgUrl(),
                    card.cardType(),
                    card.color(),
                    card.attribute(),
                    card.cardNumber(),
                    card.digivolveConditions(),
                    card.specialDigivolve(),
                    card.stage(),
                    card.digiType(),
                    card.dp(),
                    card.playCost(),
                    card.level(),
                    card.mainEffect(),
                    card.inheritedEffect(),
                    card.aceEffect(),
                    card.burstDigivolve(),
                    card.digiXros(),
                    card.dnaDigivolve(),
                    card.securityEffect(),
                    card.linkDP(),
                    card.linkEffect(),
                    card.linkRequirement(),
                    card.assemblyEffect(),
                    card.restrictions(),
                    card.illustrator(),
                    UUID.randomUUID(),
                    new Modifiers(0,0, new ArrayList<>(), card.color()),
                    false, // isTilted
                    false); // isFaceUp (cards start face down by default)
            gameDeck.add(newCard);
        }

        Collections.shuffle(gameDeck, secureRand);

        return gameDeck;
    }

    private static List<GameCard> getEggDeck(List<GameCard> deck) {
        List<GameCard> eggDeck = new ArrayList<>();
        deck.removeIf(card -> {
            if ("Digi-Egg".equals(card.cardType())) {
                eggDeck.add(card);
                return true;
            }
            return false;
        });
        return eggDeck;
    }

    private static List<GameCard> drawCards(List<GameCard> deck) {
        List<GameCard> drawn = new ArrayList<>(deck.subList(0, 5));
        deck.subList(0, 5).clear();
        return drawn;
    }

    private void distributeCards(GameStart newGame) throws JsonProcessingException {
        String newGameJson = objectMapper.writeValueAsString(newGame);
        sendMessagesToAll("[DISTRIBUTE_CARDS]:" + newGameJson);
    }

    public Player getRandomPlayer() {
        String[] names = {this.player1.username(), this.player2.username()};
        int index = secureRand.nextInt(names.length);
        return names[index].equals(this.player1.username()) ? this.player1 : this.player2;
    }

    public void setStartingPlayer(String startingPlayer) {
        this.usernameTurn = startingPlayer;
        sendMessagesToAll("[STARTING_PLAYER]≔" + startingPlayer);
        storeChatMessage("[STARTING_PLAYER]≔" + startingPlayer);
    }

    public void initiateGame(){
        this.boardState = null;
        this.player1Mulligan = null;
        this.player2Mulligan = null;
        this.bootStage = 1;
        this.phase = Phase.BREEDING;
        this.usernameTurn = null;
        sendMessagesToAll("[START_GAME]");
        try {
            broadcastPlayerInfo();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public GameStart initiallyDistributeCards() {
        List<GameCard> deck1 = createGameDeck(this.player1Deck);
        List<GameCard> deck2 = createGameDeck(this.player2Deck);

        List<GameCard> player1EggDeck = getEggDeck(deck1);
        List<GameCard> player1Hand = drawCards(deck1);

        List<GameCard> player2EggDeck = getEggDeck(deck2);
        List<GameCard> player2Hand = drawCards(deck2);

        // Initialize BoardState with original distribution for mulligan
        BoardState boardState = new BoardState();
        boardState.setPlayer1OriginalHand(player1Hand.toArray(new GameCard[0]));
        boardState.setPlayer1OriginalDeck(deck1.toArray(new GameCard[0]));
        boardState.setPlayer2OriginalHand(player2Hand.toArray(new GameCard[0]));
        boardState.setPlayer2OriginalDeck(deck2.toArray(new GameCard[0]));

        // Set current state including Security cards
        boardState.setPlayer1Hand(player1Hand.toArray(new GameCard[0]));
        boardState.setPlayer1Deck(deck1.toArray(new GameCard[0]));
        boardState.setPlayer1EggDeck(player1EggDeck.toArray(new GameCard[0]));
        boardState.setPlayer2Hand(player2Hand.toArray(new GameCard[0]));
        boardState.setPlayer2Deck(deck2.toArray(new GameCard[0]));
        boardState.setPlayer2EggDeck(player2EggDeck.toArray(new GameCard[0]));

        this.boardState = boardState;

        return new GameStart(
                player1Hand, deck1, player1EggDeck, new ArrayList<>(),
                player2Hand, deck2, player2EggDeck, new ArrayList<>()
        );
    }
    
    public void distributeCardsAndSetStage(GameStart newGame) {
        try {
            distributeCards(newGame);
            this.bootStage = 2;
            sendMessagesToAll("[SET_BOOT_STAGE]:" + 2);
        } catch (JsonProcessingException e) {
            System.err.println("JsonProcessingException in distributeCardsAndSetStage for room " + roomId + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error in distributeCardsAndSetStage for room " + roomId + ": " + e.getMessage());
        }
    }

    private void redistributeCardsAfterMulligan() throws JsonProcessingException {
        List<GameCard> player1Hand, player1DeckField;
        if (this.player1Mulligan) {
            List<GameCard> allCards = new ArrayList<>();
            allCards.addAll(Arrays.asList(boardState.getPlayer1OriginalHand()));
            allCards.addAll(Arrays.asList(boardState.getPlayer1OriginalDeck()));

            Collections.shuffle(allCards, secureRand);

            player1Hand = allCards.stream().limit(5).toList();
            allCards.removeAll(player1Hand);
            player1DeckField = new ArrayList<>(allCards);
        } else {
            player1Hand = new ArrayList<>(Arrays.asList(boardState.getPlayer1OriginalHand()));
            player1DeckField = new ArrayList<>(Arrays.asList(boardState.getPlayer1OriginalDeck()));
        }

        List<GameCard> player2Hand, player2DeckField;
        if (this.player2Mulligan) {
            List<GameCard> allCards = new ArrayList<>();
            allCards.addAll(Arrays.asList(boardState.getPlayer2OriginalHand()));
            allCards.addAll(Arrays.asList(boardState.getPlayer2OriginalDeck()));

            Collections.shuffle(allCards, secureRand);

            player2Hand = allCards.stream().limit(5).toList();
            allCards.removeAll(player2Hand);
            player2DeckField = new ArrayList<>(allCards);
        } else {
            player2Hand = new ArrayList<>(Arrays.asList(boardState.getPlayer2OriginalHand()));
            player2DeckField = new ArrayList<>(Arrays.asList(boardState.getPlayer2OriginalDeck()));
        }

        // After mulligan decisions, draw security cards from final deck state
        List<GameCard> player1Security = drawCards(player1DeckField);
        List<GameCard> player2Security = drawCards(player2DeckField);

        // Update BoardState with final distribution
        boardState.setPlayer1Hand(player1Hand.toArray(new GameCard[0]));
        boardState.setPlayer1Deck(player1DeckField.toArray(new GameCard[0]));
        boardState.setPlayer1Security(player1Security.toArray(new GameCard[0]));
        boardState.setPlayer2Hand(player2Hand.toArray(new GameCard[0]));
        boardState.setPlayer2Deck(player2DeckField.toArray(new GameCard[0]));
        boardState.setPlayer2Security(player2Security.toArray(new GameCard[0]));

        GameStart redistributedGame = new GameStart(
                player1Hand, player1DeckField, Arrays.asList(boardState.getPlayer1EggDeck()), player1Security,
                player2Hand, player2DeckField, Arrays.asList(boardState.getPlayer2EggDeck()), player2Security
        );

        distributeCards(redistributedGame);

        this.bootStage = 3;
        sendMessagesToAll("[SET_BOOT_STAGE]:" + 3);
    }

    public synchronized void setMulliganDecisionForSession(WebSocketSession session, boolean decision) throws JsonProcessingException {
        if (Objects.requireNonNull(session.getPrincipal()).getName().equals(player1.username())) {
            this.player1Mulligan = decision;
        } else if (Objects.requireNonNull(session.getPrincipal()).getName().equals(player2.username())) {
            this.player2Mulligan = decision;
        }
        if (this.player1Mulligan != null && this.player2Mulligan != null) {
            redistributeCardsAfterMulligan();
        }
    }

    public void storeChatMessage(String message) {
        if (this.chat == null) {
            this.chat = new String[]{message};
        } else {
            String[] newChat = new String[this.chat.length + 1];
            System.arraycopy(this.chat, 0, newChat, 0, this.chat.length);
            newChat[this.chat.length] = message;
            this.chat = newChat;
        }
    }

    public void broadcastPlayerInfo() throws JsonProcessingException {
        List<Player> players = new ArrayList<>(List.of(player1, player2));
        sendMessagesToAll("[PLAYER_INFO]:" + objectMapper.writeValueAsString(players));
    }

    public void cancelAllScheduledTasks() {
        scheduledTasks.forEach(task -> {
            if (!task.isCancelled()) {
                task.cancel(false);
            }
        });
        scheduledTasks.clear();
    }

}

enum Phase {
    UNSUSPEND,
    DRAW,
    BREEDING,
    MAIN,
}
