package com.github.wekaito.backend.websocket.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.game.models.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Getter
@RequiredArgsConstructor
public class GameWebSocket extends TextWebSocketHandler {

    private final MongoUserDetailsService mongoUserDetailsService;

    private final DeckService deckService;
    
    private final ApplicationEventPublisher eventPublisher;
    
    private final CardJsonConverter cardJsonConverter;

    public final ConcurrentHashMap<String, GameRoom> gameRooms = new ConcurrentHashMap<>();
    
    private static final ScheduledExecutorService SHARED_SCHEDULER = Executors.newScheduledThreadPool(10);

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static final String[] simpleIdCommands = {"/updateAttackPhase", "/activateEffect", "/activateTarget", "/emote"};
    
    private static final Set<String> DESTROY_TOKEN_LOCATIONS = Set.of(
        "player1Hand", "player1Deck", "player1EggDeck", "player1Trash", "player1Security", "player1BreedingArea",
        "player2Hand", "player2Deck", "player2EggDeck", "player2Trash", "player2Security", "player2BreedingArea"
    );

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        // do nothing
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        Principal principal = session.getPrincipal();
        if (principal == null) return;

        String username = principal.getName();

        Optional<GameRoom> gameRoomOpt = gameRooms.values().stream().filter(room ->
                room.getPlayer1().username().equals(username) || room.getPlayer2().username().equals(username)
        ).findFirst();

        if (gameRoomOpt.isPresent()) {
            GameRoom gameRoom = gameRoomOpt.get();
            // Notify remaining active sessions about disconnection
            gameRoom.sendMessageToOtherSessions(session, "[OPPONENT_DISCONNECTED]");
            gameRoom.removeSession(session);

            // Use isEmpty method that checks for actually open sessions
            if (gameRoom.isEmpty()) {
                gameRooms.remove(gameRoom.getRoomId());
            }
        }
    }

    @EventListener
    public void handleGameRoomEmptyEvent(GameRoomEmptyEvent event) {
        gameRooms.remove(event.getRoomId());
    }

    @Override
    protected void handleTextMessage(@NotNull WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        if (payload.equals("/heartbeat/")) return;
        String[] parts = payload.split(":", 2);

        if (parts[0].equals("/joinGame")) {
            computeGameRoom(session, parts[1]);
            return;
        }

        String gameId = parts[0];
        String roomMessage = parts[1];

        GameRoom gameRoom = findGameRoomById(gameId);

        if (gameRoom == null) return;

        if(roomMessage.startsWith("/mulligan:")) {
            boolean currentPlayerDecision = roomMessage.split(":")[1].equals("true");
            gameRoom.setMulliganDecisionForSession(session, currentPlayerDecision);
        }

        if (roomMessage.startsWith("/restartGame:")) {
            boolean isThisPlayerStarting = roomMessage.split(":")[1].equals("first");
            String startingPlayer = gameRoom.setUpGameRestart(session, isThisPlayerStarting);
            scheduleGameSetupRestart(gameRoom, startingPlayer);
            
            GameStart newGame = gameRoom.initiallyDistributeCards();
            scheduleCardDistribution(gameRoom, () -> gameRoom.distributeCardsAndSetStage(newGame));
        }

        if (roomMessage.startsWith("/attack:")) handleAttack(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/moveCard:")) handleSendMoveCard(gameRoom, session, roomMessage);

        if(roomMessage.startsWith("/setModifiers:")) handleSendSetModifiers(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/moveCardToStack:")) handleSendMoveToStack(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/tiltCard:")) handleTiltCard(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/flipCard:")) handleFlipCard(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/updateMemory:")) handleMemoryUpdate(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/chatMessage:")) sendChatMessage(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/createToken:")) handleCreateToken(gameRoom, session, roomMessage);

        if (roomMessage.startsWith("/unsuspendAll:")) handleUnsuspendAll(gameRoom, session);

        if(Arrays.stream(simpleIdCommands).anyMatch(roomMessage::startsWith)) handleCommandWithId(gameRoom, session, roomMessage);

        else {
            String[] roomMessageParts = roomMessage.split(":", 2);
            String command = roomMessageParts[0];
            if (command.equals("/updatePhase")) gameRoom.progressPhase();
            gameRoom.sendMessageToOtherSessions(session, convertCommand(command));
        }
    }

    private void sendChatMessage(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection()) return;
        String userName = Objects.requireNonNull(session.getPrincipal()).getName();

        String[] roomMessageParts = roomMessage.split(":", 3);
        if (roomMessageParts.length < 3) return;
        String chatMessage = roomMessageParts[2];
        
        // Store chat message in GameRoom
        String formattedMessage = userName + "﹕" + chatMessage;
        storeChatMessage(gameRoom, formattedMessage);

        gameRoom.sendMessageToOtherSessions(session, "[CHAT_MESSAGE]:" + formattedMessage);
    }
    
    private void storeChatMessage(GameRoom gameRoom, String message) {
        String[] currentChat = gameRoom.getChat();
        if (currentChat == null) {
            // Initialize chat array with first message
            gameRoom.setChat(new String[]{message});
        } else {
            // Append new message to existing chat array
            String[] newChat = new String[currentChat.length + 1];
            System.arraycopy(currentChat, 0, newChat, 0, currentChat.length);
            newChat[currentChat.length] = message;
            gameRoom.setChat(newChat);
        }
    }

    /* These actions do not alter the board state, therefore do not need a separate handler */
    private String convertCommand(String command) {
        return switch (command) {
            case "/surrender" -> "[SURRENDER]";
            case "/restartRequestAsFirst" -> "[RESTART_AS_FIRST]";
            case "/restartRequestAsSecond" -> "[RESTART_AS_SECOND]";
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
            case "/playNextPhaseSfx" -> "[NEXT_PHASE_SFX]";
            case "/playPassTurnSfx" -> "[PASS_TURN_SFX]";
            case "/updatePhase" -> "[UPDATE_PHASE]";
            case "/unsuspendAll" -> "[UNSUSPEND_ALL]";
            case "/resolveCounterBlock" -> "[RESOLVE_COUNTER_BLOCK]";
            case "/online" -> "[OPPONENT_ONLINE]";
            case "/activateTarget" -> "[ACTIVATE_TARGET]";
            case "/activateEffect" -> "[ACTIVATE_EFFECT]";
            case "/updateAttackPhase" -> "[OPPONENT_ATTACK_PHASE]";
            case "/emote" -> "[EMOTE]";
            default -> "";
        };
    }

    private String getPosition(String fromTo) {
        return switch (fromTo) {
            case "myDigi1" -> "opponentDigi1";
            case "myDigi2" -> "opponentDigi2";
            case "myDigi3" -> "opponentDigi3";
            case "myDigi4" -> "opponentDigi4";
            case "myDigi5" -> "opponentDigi5";
            case "myDigi6" -> "opponentDigi6";
            case "myDigi7" -> "opponentDigi7";
            case "myDigi8" -> "opponentDigi8";
            case "myDigi9" -> "opponentDigi9";
            case "myDigi10" -> "opponentDigi10";
            case "myDigi11" -> "opponentDigi11";
            case "myDigi12" -> "opponentDigi12";
            case "myDigi13" -> "opponentDigi13";
            case "myDigi14" -> "opponentDigi14";
            case "myDigi15" -> "opponentDigi15";
            case "myDigi16" -> "opponentDigi16";
            case "myDigi17" -> "opponentDigi17";
            case "myDigi18" -> "opponentDigi18";
            case "myDigi19" -> "opponentDigi19";
            case "myDigi20" -> "opponentDigi20";
            case "myDigi21" -> "opponentDigi21";
            case "myLink1" -> "opponentLink1";
            case "myLink2" -> "opponentLink2";
            case "myLink3" -> "opponentLink3";
            case "myLink4" -> "opponentLink4";
            case "myLink5" -> "opponentLink5";
            case "myLink6" -> "opponentLink6";
            case "myLink7" -> "opponentLink7";
            case "myLink8" -> "opponentLink8";
            case "myLink9" -> "opponentLink9";
            case "myLink10" -> "opponentLink10";
            case "myLink11" -> "opponentLink11";
            case "myLink12" -> "opponentLink12";
            case "myLink13" -> "opponentLink13";
            case "myLink14" -> "opponentLink14";
            case "myLink15" -> "opponentLink15";
            case "myLink16" -> "opponentLink16";
            case "mySecurity" -> "opponentSecurity";
            case "myHand" -> "opponentHand";
            case "myDeckField" -> "opponentDeckField";
            case "myEggDeck" -> "opponentEggDeck";
            case "myBreedingArea" -> "opponentBreedingArea";
            case "myTrash" -> "opponentTrash";
            case "myReveal" -> "opponentReveal";
            case "opponentDigi1" -> "myDigi1";
            case "opponentDigi2" -> "myDigi2";
            case "opponentDigi3" -> "myDigi3";
            case "opponentDigi4" -> "myDigi4";
            case "opponentDigi5" -> "myDigi5";
            case "opponentDigi6" -> "myDigi6";
            case "opponentDigi7" -> "myDigi7";
            case "opponentDigi8" -> "myDigi8";
            case "opponentDigi9" -> "myDigi9";
            case "opponentDigi10" -> "myDigi10";
            case "opponentDigi11" -> "myDigi11";
            case "opponentDigi12" -> "myDigi12";
            case "opponentDigi13" -> "myDigi13";
            case "opponentDigi14" -> "myDigi14";
            case "opponentDigi15" -> "myDigi15";
            case "opponentDigi16" -> "myDigi16";
            case "opponentDigi17" -> "myDigi17";
            case "opponentDigi18" -> "myDigi18";
            case "opponentDigi19" -> "myDigi19";
            case "opponentDigi20" -> "myDigi20";
            case "opponentDigi21" -> "myDigi21";
            case "opponentLink1" -> "myLink1";
            case "opponentLink2" -> "myLink2";
            case "opponentLink3" -> "myLink3";
            case "opponentLink4" -> "myLink4";
            case "opponentLink5" -> "myLink5";
            case "opponentLink6" -> "myLink6";
            case "opponentLink7" -> "myLink7";
            case "opponentLink8" -> "myLink8";
            case "opponentLink9" -> "myLink9";
            case "opponentLink10" -> "myLink10";
            case "opponentLink11" -> "myLink11";
            case "opponentLink12" -> "myLink12";
            case "opponentLink13" -> "myLink13";
            case "opponentLink14" -> "myLink14";
            case "opponentLink15" -> "myLink15";
            case "opponentLink16" -> "myLink16";
            case "opponentSecurity" -> "mySecurity";
            case "opponentHand" -> "myHand";
            case "opponentDeckField" -> "myDeckField";
            case "opponentEggDeck" -> "myEggDeck";
            case "opponentBreedingArea" -> "myBreedingArea";
            case "opponentTrash" -> "myTrash";
            case "opponentReveal" -> "myReveal";
            default -> "";
        };
    }

    private GameRoom findGameRoomById(String gameId) {
        return gameRooms.get(gameId);
    }

    public Optional<GameRoom> findGameRoomBySession(WebSocketSession session) {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        return gameRooms.values().stream().filter(room ->
                room.getPlayer1().username().equals(username) || room.getPlayer2().username().equals(username)
        ).findFirst();
    }
    
    private String mapClientToServer(String clientPosition, String username, GameRoom gameRoom) {
        boolean isPlayer1 = gameRoom.getPlayer1().username().equals(username);
        return switch (clientPosition) {
            case "myHand" -> isPlayer1 ? "player1Hand" : "player2Hand";
            case "myDeckField" -> isPlayer1 ? "player1Deck" : "player2Deck";
            case "myEggDeck" -> isPlayer1 ? "player1EggDeck" : "player2EggDeck";
            case "myTrash" -> isPlayer1 ? "player1Trash" : "player2Trash";
            case "mySecurity" -> isPlayer1 ? "player1Security" : "player2Security";
            case "myReveal" -> isPlayer1 ? "player1Reveal" : "player2Reveal";
            case "myBreedingArea" -> isPlayer1 ? "player1BreedingArea" : "player2BreedingArea";
            case "myDigi1" -> isPlayer1 ? "player1Digi1" : "player2Digi1";
            case "myDigi2" -> isPlayer1 ? "player1Digi2" : "player2Digi2";
            case "myDigi3" -> isPlayer1 ? "player1Digi3" : "player2Digi3";
            case "myDigi4" -> isPlayer1 ? "player1Digi4" : "player2Digi4";
            case "myDigi5" -> isPlayer1 ? "player1Digi5" : "player2Digi5";
            case "myDigi6" -> isPlayer1 ? "player1Digi6" : "player2Digi6";
            case "myDigi7" -> isPlayer1 ? "player1Digi7" : "player2Digi7";
            case "myDigi8" -> isPlayer1 ? "player1Digi8" : "player2Digi8";
            case "myDigi9" -> isPlayer1 ? "player1Digi9" : "player2Digi9";
            case "myDigi10" -> isPlayer1 ? "player1Digi10" : "player2Digi10";
            case "myDigi11" -> isPlayer1 ? "player1Digi11" : "player2Digi11";
            case "myDigi12" -> isPlayer1 ? "player1Digi12" : "player2Digi12";
            case "myDigi13" -> isPlayer1 ? "player1Digi13" : "player2Digi13";
            case "myDigi14" -> isPlayer1 ? "player1Digi14" : "player2Digi14";
            case "myDigi15" -> isPlayer1 ? "player1Digi15" : "player2Digi15";
            case "myDigi16" -> isPlayer1 ? "player1Digi16" : "player2Digi16";
            case "myDigi17" -> isPlayer1 ? "player1Digi17" : "player2Digi17";
            case "myDigi18" -> isPlayer1 ? "player1Digi18" : "player2Digi18";
            case "myDigi19" -> isPlayer1 ? "player1Digi19" : "player2Digi19";
            case "myDigi20" -> isPlayer1 ? "player1Digi20" : "player2Digi20";
            case "myDigi21" -> isPlayer1 ? "player1Digi21" : "player2Digi21";
            case "myLink1" -> isPlayer1 ? "player1Link1" : "player2Link1";
            case "myLink2" -> isPlayer1 ? "player1Link2" : "player2Link2";
            case "myLink3" -> isPlayer1 ? "player1Link3" : "player2Link3";
            case "myLink4" -> isPlayer1 ? "player1Link4" : "player2Link4";
            case "myLink5" -> isPlayer1 ? "player1Link5" : "player2Link5";
            case "myLink6" -> isPlayer1 ? "player1Link6" : "player2Link6";
            case "myLink7" -> isPlayer1 ? "player1Link7" : "player2Link7";
            case "myLink8" -> isPlayer1 ? "player1Link8" : "player2Link8";
            case "myLink9" -> isPlayer1 ? "player1Link9" : "player2Link9";
            case "myLink10" -> isPlayer1 ? "player1Link10" : "player2Link10";
            case "myLink11" -> isPlayer1 ? "player1Link11" : "player2Link11";
            case "myLink12" -> isPlayer1 ? "player1Link12" : "player2Link12";
            case "myLink13" -> isPlayer1 ? "player1Link13" : "player2Link13";
            case "myLink14" -> isPlayer1 ? "player1Link14" : "player2Link14";
            case "myLink15" -> isPlayer1 ? "player1Link15" : "player2Link15";
            case "myLink16" -> isPlayer1 ? "player1Link16" : "player2Link16";
            default -> clientPosition; // Return as-is if not recognized
        };
    }
    
    private GameCard[] getBoardStatePosition(BoardState boardState, String position) {
        return switch (position) {
            case "player1Hand" -> boardState.getPlayer1Hand();
            case "player1Deck" -> boardState.getPlayer1Deck();
            case "player1EggDeck" -> boardState.getPlayer1EggDeck();
            case "player1Trash" -> boardState.getPlayer1Trash();
            case "player1Security" -> boardState.getPlayer1Security();
            case "player1Reveal" -> boardState.getPlayer1Reveal();
            case "player1BreedingArea" -> boardState.getPlayer1BreedingArea();
            case "player1Digi1" -> boardState.getPlayer1Digi1();
            case "player1Digi2" -> boardState.getPlayer1Digi2();
            case "player1Digi3" -> boardState.getPlayer1Digi3();
            case "player1Digi4" -> boardState.getPlayer1Digi4();
            case "player1Digi5" -> boardState.getPlayer1Digi5();
            case "player1Digi6" -> boardState.getPlayer1Digi6();
            case "player1Digi7" -> boardState.getPlayer1Digi7();
            case "player1Digi8" -> boardState.getPlayer1Digi8();
            case "player1Digi9" -> boardState.getPlayer1Digi9();
            case "player1Digi10" -> boardState.getPlayer1Digi10();
            case "player1Digi11" -> boardState.getPlayer1Digi11();
            case "player1Digi12" -> boardState.getPlayer1Digi12();
            case "player1Digi13" -> boardState.getPlayer1Digi13();
            case "player1Digi14" -> boardState.getPlayer1Digi14();
            case "player1Digi15" -> boardState.getPlayer1Digi15();
            case "player1Digi16" -> boardState.getPlayer1Digi16();
            case "player1Digi17" -> boardState.getPlayer1Digi17();
            case "player1Digi18" -> boardState.getPlayer1Digi18();
            case "player1Digi19" -> boardState.getPlayer1Digi19();
            case "player1Digi20" -> boardState.getPlayer1Digi20();
            case "player1Digi21" -> boardState.getPlayer1Digi21();
            case "player1Link1" -> boardState.getPlayer1Link1();
            case "player1Link2" -> boardState.getPlayer1Link2();
            case "player1Link3" -> boardState.getPlayer1Link3();
            case "player1Link4" -> boardState.getPlayer1Link4();
            case "player1Link5" -> boardState.getPlayer1Link5();
            case "player1Link6" -> boardState.getPlayer1Link6();
            case "player1Link7" -> boardState.getPlayer1Link7();
            case "player1Link8" -> boardState.getPlayer1Link8();
            case "player1Link9" -> boardState.getPlayer1Link9();
            case "player1Link10" -> boardState.getPlayer1Link10();
            case "player1Link11" -> boardState.getPlayer1Link11();
            case "player1Link12" -> boardState.getPlayer1Link12();
            case "player1Link13" -> boardState.getPlayer1Link13();
            case "player1Link14" -> boardState.getPlayer1Link14();
            case "player1Link15" -> boardState.getPlayer1Link15();
            case "player1Link16" -> boardState.getPlayer1Link16();
            case "player2Hand" -> boardState.getPlayer2Hand();
            case "player2Deck" -> boardState.getPlayer2Deck();
            case "player2EggDeck" -> boardState.getPlayer2EggDeck();
            case "player2Trash" -> boardState.getPlayer2Trash();
            case "player2Security" -> boardState.getPlayer2Security();
            case "player2Reveal" -> boardState.getPlayer2Reveal();
            case "player2BreedingArea" -> boardState.getPlayer2BreedingArea();
            case "player2Digi1" -> boardState.getPlayer2Digi1();
            case "player2Digi2" -> boardState.getPlayer2Digi2();
            case "player2Digi3" -> boardState.getPlayer2Digi3();
            case "player2Digi4" -> boardState.getPlayer2Digi4();
            case "player2Digi5" -> boardState.getPlayer2Digi5();
            case "player2Digi6" -> boardState.getPlayer2Digi6();
            case "player2Digi7" -> boardState.getPlayer2Digi7();
            case "player2Digi8" -> boardState.getPlayer2Digi8();
            case "player2Digi9" -> boardState.getPlayer2Digi9();
            case "player2Digi10" -> boardState.getPlayer2Digi10();
            case "player2Digi11" -> boardState.getPlayer2Digi11();
            case "player2Digi12" -> boardState.getPlayer2Digi12();
            case "player2Digi13" -> boardState.getPlayer2Digi13();
            case "player2Digi14" -> boardState.getPlayer2Digi14();
            case "player2Digi15" -> boardState.getPlayer2Digi15();
            case "player2Digi16" -> boardState.getPlayer2Digi16();
            case "player2Digi17" -> boardState.getPlayer2Digi17();
            case "player2Digi18" -> boardState.getPlayer2Digi18();
            case "player2Digi19" -> boardState.getPlayer2Digi19();
            case "player2Digi20" -> boardState.getPlayer2Digi20();
            case "player2Digi21" -> boardState.getPlayer2Digi21();
            case "player2Link1" -> boardState.getPlayer2Link1();
            case "player2Link2" -> boardState.getPlayer2Link2();
            case "player2Link3" -> boardState.getPlayer2Link3();
            case "player2Link4" -> boardState.getPlayer2Link4();
            case "player2Link5" -> boardState.getPlayer2Link5();
            case "player2Link6" -> boardState.getPlayer2Link6();
            case "player2Link7" -> boardState.getPlayer2Link7();
            case "player2Link8" -> boardState.getPlayer2Link8();
            case "player2Link9" -> boardState.getPlayer2Link9();
            case "player2Link10" -> boardState.getPlayer2Link10();
            case "player2Link11" -> boardState.getPlayer2Link11();
            case "player2Link12" -> boardState.getPlayer2Link12();
            case "player2Link13" -> boardState.getPlayer2Link13();
            case "player2Link14" -> boardState.getPlayer2Link14();
            case "player2Link15" -> boardState.getPlayer2Link15();
            case "player2Link16" -> boardState.getPlayer2Link16();
            default -> new GameCard[0]; // Return empty array if not found
        };
    }
    
    private void setBoardStatePosition(BoardState boardState, String position, GameCard[] cards) {
        switch (position) {
            case "player1Hand" -> boardState.setPlayer1Hand(cards);
            case "player1Deck" -> boardState.setPlayer1Deck(cards);
            case "player1EggDeck" -> boardState.setPlayer1EggDeck(cards);
            case "player1Trash" -> boardState.setPlayer1Trash(cards);
            case "player1Security" -> boardState.setPlayer1Security(cards);
            case "player1Reveal" -> boardState.setPlayer1Reveal(cards);
            case "player1BreedingArea" -> boardState.setPlayer1BreedingArea(cards);
            case "player1Digi1" -> boardState.setPlayer1Digi1(cards);
            case "player1Digi2" -> boardState.setPlayer1Digi2(cards);
            case "player1Digi3" -> boardState.setPlayer1Digi3(cards);
            case "player1Digi4" -> boardState.setPlayer1Digi4(cards);
            case "player1Digi5" -> boardState.setPlayer1Digi5(cards);
            case "player1Digi6" -> boardState.setPlayer1Digi6(cards);
            case "player1Digi7" -> boardState.setPlayer1Digi7(cards);
            case "player1Digi8" -> boardState.setPlayer1Digi8(cards);
            case "player1Digi9" -> boardState.setPlayer1Digi9(cards);
            case "player1Digi10" -> boardState.setPlayer1Digi10(cards);
            case "player1Digi11" -> boardState.setPlayer1Digi11(cards);
            case "player1Digi12" -> boardState.setPlayer1Digi12(cards);
            case "player1Digi13" -> boardState.setPlayer1Digi13(cards);
            case "player1Digi14" -> boardState.setPlayer1Digi14(cards);
            case "player1Digi15" -> boardState.setPlayer1Digi15(cards);
            case "player1Digi16" -> boardState.setPlayer1Digi16(cards);
            case "player1Digi17" -> boardState.setPlayer1Digi17(cards);
            case "player1Digi18" -> boardState.setPlayer1Digi18(cards);
            case "player1Digi19" -> boardState.setPlayer1Digi19(cards);
            case "player1Digi20" -> boardState.setPlayer1Digi20(cards);
            case "player1Digi21" -> boardState.setPlayer1Digi21(cards);
            case "player1Link1" -> boardState.setPlayer1Link1(cards);
            case "player1Link2" -> boardState.setPlayer1Link2(cards);
            case "player1Link3" -> boardState.setPlayer1Link3(cards);
            case "player1Link4" -> boardState.setPlayer1Link4(cards);
            case "player1Link5" -> boardState.setPlayer1Link5(cards);
            case "player1Link6" -> boardState.setPlayer1Link6(cards);
            case "player1Link7" -> boardState.setPlayer1Link7(cards);
            case "player1Link8" -> boardState.setPlayer1Link8(cards);
            case "player1Link9" -> boardState.setPlayer1Link9(cards);
            case "player1Link10" -> boardState.setPlayer1Link10(cards);
            case "player1Link11" -> boardState.setPlayer1Link11(cards);
            case "player1Link12" -> boardState.setPlayer1Link12(cards);
            case "player1Link13" -> boardState.setPlayer1Link13(cards);
            case "player1Link14" -> boardState.setPlayer1Link14(cards);
            case "player1Link15" -> boardState.setPlayer1Link15(cards);
            case "player1Link16" -> boardState.setPlayer1Link16(cards);
            case "player2Hand" -> boardState.setPlayer2Hand(cards);
            case "player2Deck" -> boardState.setPlayer2Deck(cards);
            case "player2EggDeck" -> boardState.setPlayer2EggDeck(cards);
            case "player2Trash" -> boardState.setPlayer2Trash(cards);
            case "player2Security" -> boardState.setPlayer2Security(cards);
            case "player2Reveal" -> boardState.setPlayer2Reveal(cards);
            case "player2BreedingArea" -> boardState.setPlayer2BreedingArea(cards);
            case "player2Digi1" -> boardState.setPlayer2Digi1(cards);
            case "player2Digi2" -> boardState.setPlayer2Digi2(cards);
            case "player2Digi3" -> boardState.setPlayer2Digi3(cards);
            case "player2Digi4" -> boardState.setPlayer2Digi4(cards);
            case "player2Digi5" -> boardState.setPlayer2Digi5(cards);
            case "player2Digi6" -> boardState.setPlayer2Digi6(cards);
            case "player2Digi7" -> boardState.setPlayer2Digi7(cards);
            case "player2Digi8" -> boardState.setPlayer2Digi8(cards);
            case "player2Digi9" -> boardState.setPlayer2Digi9(cards);
            case "player2Digi10" -> boardState.setPlayer2Digi10(cards);
            case "player2Digi11" -> boardState.setPlayer2Digi11(cards);
            case "player2Digi12" -> boardState.setPlayer2Digi12(cards);
            case "player2Digi13" -> boardState.setPlayer2Digi13(cards);
            case "player2Digi14" -> boardState.setPlayer2Digi14(cards);
            case "player2Digi15" -> boardState.setPlayer2Digi15(cards);
            case "player2Digi16" -> boardState.setPlayer2Digi16(cards);
            case "player2Digi17" -> boardState.setPlayer2Digi17(cards);
            case "player2Digi18" -> boardState.setPlayer2Digi18(cards);
            case "player2Digi19" -> boardState.setPlayer2Digi19(cards);
            case "player2Digi20" -> boardState.setPlayer2Digi20(cards);
            case "player2Digi21" -> boardState.setPlayer2Digi21(cards);
            case "player2Link1" -> boardState.setPlayer2Link1(cards);
            case "player2Link2" -> boardState.setPlayer2Link2(cards);
            case "player2Link3" -> boardState.setPlayer2Link3(cards);
            case "player2Link4" -> boardState.setPlayer2Link4(cards);
            case "player2Link5" -> boardState.setPlayer2Link5(cards);
            case "player2Link6" -> boardState.setPlayer2Link6(cards);
            case "player2Link7" -> boardState.setPlayer2Link7(cards);
            case "player2Link8" -> boardState.setPlayer2Link8(cards);
            case "player2Link9" -> boardState.setPlayer2Link9(cards);
            case "player2Link10" -> boardState.setPlayer2Link10(cards);
            case "player2Link11" -> boardState.setPlayer2Link11(cards);
            case "player2Link12" -> boardState.setPlayer2Link12(cards);
            case "player2Link13" -> boardState.setPlayer2Link13(cards);
            case "player2Link14" -> boardState.setPlayer2Link14(cards);
            case "player2Link15" -> boardState.setPlayer2Link15(cards);
            case "player2Link16" -> boardState.setPlayer2Link16(cards);
        }
    }
    
    private void updateBoardStateForStackMove(GameRoom gameRoom, String cardId, String fromClient, String toClient, String topOrBottom, String facing, String username) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        String fromServer = mapClientToServer(fromClient, username, gameRoom);
        String toServer = mapClientToServer(toClient, username, gameRoom);
        
        // Find and remove card from source position
        GameCard[] fromArray = getBoardStatePosition(boardState, fromServer);
        GameCard cardToMove = null;
        List<GameCard> fromList = new ArrayList<>(Arrays.asList(fromArray));
        
        for (int i = 0; i < fromList.size(); i++) {
            if (fromList.get(i).id().toString().equals(cardId)) {
                cardToMove = fromList.get(i);
                fromList.remove(i);
                break;
            }
        }
        
        if (cardToMove == null) return; // Card not found
        
        // Update source position
        setBoardStatePosition(boardState, fromServer, fromList.toArray(new GameCard[0]));
        
        // Check if it's a token being moved to a destroy location
        if (DESTROY_TOKEN_LOCATIONS.contains(toServer) && cardToMove.uniqueCardNumber().contains("TOKEN")) {
            // Token is destroyed - don't add to destination, just remove from source
            return;
        }
        
        // Handle face status based on facing parameter
        if (facing != null) {
            boolean shouldBeFaceUp = facing.equals("up");
            if (shouldBeFaceUp != cardToMove.isFaceUp()) {
                cardToMove = new GameCard(
                    cardToMove.uniqueCardNumber(), cardToMove.name(), cardToMove.imgUrl(), cardToMove.cardType(),
                    cardToMove.color(), cardToMove.attribute(), cardToMove.cardNumber(), cardToMove.digivolveConditions(),
                    cardToMove.specialDigivolve(), cardToMove.stage(), cardToMove.digiType(), cardToMove.dp(),
                    cardToMove.playCost(), cardToMove.level(), cardToMove.mainEffect(), cardToMove.inheritedEffect(),
                    cardToMove.aceEffect(), cardToMove.burstDigivolve(), cardToMove.digiXros(), cardToMove.dnaDigivolve(),
                    cardToMove.securityEffect(), cardToMove.linkDP(), cardToMove.linkEffect(), cardToMove.linkRequirement(),
                    cardToMove.assemblyEffect(), cardToMove.restrictions(), cardToMove.illustrator(), cardToMove.id(),
                    cardToMove.modifiers(), cardToMove.isTilted(), shouldBeFaceUp
                );
            }
        }
        
        // Add card to destination stack in correct position (top or bottom)
        GameCard[] toArray = getBoardStatePosition(boardState, toServer);
        List<GameCard> toList = new ArrayList<>(Arrays.asList(toArray));
        
        if (topOrBottom.equals("Top")) {
            toList.add(0, cardToMove); // Add to beginning (top of stack)
        } else {
            toList.add(cardToMove); // Add to end (bottom of stack)
        }
        
        setBoardStatePosition(boardState, toServer, toList.toArray(new GameCard[0]));
    }

    private void updateBoardStateForCardMove(GameRoom gameRoom, String cardId, String fromClient, String toClient, String username) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        String fromServer = mapClientToServer(fromClient, username, gameRoom);
        String toServer = mapClientToServer(toClient, username, gameRoom);
        
        // Find and remove card from source position
        GameCard[] fromArray = getBoardStatePosition(boardState, fromServer);
        GameCard cardToMove = null;
        List<GameCard> fromList = new ArrayList<>(Arrays.asList(fromArray));
        
        for (int i = 0; i < fromList.size(); i++) {
            if (fromList.get(i).id().toString().equals(cardId)) {
                cardToMove = fromList.get(i);
                fromList.remove(i);
                break;
            }
        }
        
        if (cardToMove == null) return; // Card not found
        
        // Update source position
        setBoardStatePosition(boardState, fromServer, fromList.toArray(new GameCard[0]));
        
        // Check if it's a token being moved to a destroy location
        if (DESTROY_TOKEN_LOCATIONS.contains(toServer) && cardToMove.uniqueCardNumber().contains("TOKEN")) {
            // Token is destroyed - don't add to destination, just remove from source
            return;
        }
        
        // Determine correct face status for destination position
        boolean shouldBeFaceUp = isFieldPosition(toServer);
        boolean shouldBeFaceDown = shouldBeFaceDown(toServer);
        
        // Check if modifiers should be reset
        boolean shouldResetModifiers = shouldResetModifiersOnMove(fromServer, toServer);
        
        // Update card if face status needs to change or modifiers need reset
        boolean needsFaceStatusUpdate = (shouldBeFaceUp && !cardToMove.isFaceUp()) || 
                                      (shouldBeFaceDown && cardToMove.isFaceUp());
        
        if (needsFaceStatusUpdate || shouldResetModifiers) {
            // Create default modifiers for reset
            Modifiers resetModifiers = shouldResetModifiers ?
                new Modifiers(0, 0, new ArrayList<>(), cardToMove.color()) : cardToMove.modifiers();
            
            // Determine final face status
            boolean finalFaceUp;
            if (shouldBeFaceUp) {
                finalFaceUp = true;
            } else if (shouldBeFaceDown) {
                finalFaceUp = false;
            } else {
                finalFaceUp = cardToMove.isFaceUp(); // Keep current status
            }
                
            // Update card with new face status and/or reset modifiers
            cardToMove = new GameCard(
                cardToMove.uniqueCardNumber(), cardToMove.name(), cardToMove.imgUrl(), cardToMove.cardType(),
                cardToMove.color(), cardToMove.attribute(), cardToMove.cardNumber(), cardToMove.digivolveConditions(),
                cardToMove.specialDigivolve(), cardToMove.stage(), cardToMove.digiType(), cardToMove.dp(),
                cardToMove.playCost(), cardToMove.level(), cardToMove.mainEffect(), cardToMove.inheritedEffect(),
                cardToMove.aceEffect(), cardToMove.burstDigivolve(), cardToMove.digiXros(), cardToMove.dnaDigivolve(),
                cardToMove.securityEffect(), cardToMove.linkDP(), cardToMove.linkEffect(), cardToMove.linkRequirement(),
                cardToMove.assemblyEffect(), cardToMove.restrictions(), cardToMove.illustrator(), cardToMove.id(),
                resetModifiers, cardToMove.isTilted(), finalFaceUp
            );
        }
        
        // Add card to destination position
        GameCard[] toArray = getBoardStatePosition(boardState, toServer);
        List<GameCard> toList = new ArrayList<>(Arrays.asList(toArray));
        toList.add(cardToMove);
        setBoardStatePosition(boardState, toServer, toList.toArray(new GameCard[0]));
    }
    
    private boolean isFieldPosition(String position) {
        // Field positions where cards should be face-up
        return position.startsWith("player1Digi") || position.startsWith("player2Digi") ||
               position.startsWith("player1Link") || position.startsWith("player2Link") ||
               position.equals("player1Reveal") || position.equals("player2Reveal") ||
               position.equals("player1Trash") || position.equals("player2Trash") ||
               position.equals("player1BreedingArea") || position.equals("player2BreedingArea");
    }
    
    private boolean shouldBeFaceDown(String position) {
        // Positions where cards should be face-down (mirrors frontend logic)
        return position.equals("player1Hand") || position.equals("player2Hand") ||
               position.equals("player1Deck") || position.equals("player2Deck") ||
               position.equals("player1Security") || position.equals("player2Security");
    }
    
    private boolean shouldResetModifiersOnMove(String fromServer, String toServer) {
        // Reset modifiers when moving to certain locations (mirroring frontend logic)
        return toServer.equals("player1Hand") || toServer.equals("player2Hand") ||
               toServer.equals("player1Deck") || toServer.equals("player2Deck") ||
               toServer.equals("player1EggDeck") || toServer.equals("player2EggDeck") ||
               toServer.equals("player1Security") || toServer.equals("player2Security") ||
               toServer.equals("player1Trash") || toServer.equals("player2Trash");
    }

    private void computeGameRoom(WebSocketSession session, String gameId) throws IOException {
        GameRoom gameRoom = gameRooms.get(gameId);

        if (gameRoom == null) {
            String[] usernames = gameId.split("‗");
            if (usernames.length == 2) {
                String avatar1 = mongoUserDetailsService.getAvatar(usernames[0]);
                String avatar2 = mongoUserDetailsService.getAvatar(usernames[1]);

                String deckId1 = mongoUserDetailsService.getActiveDeck(usernames[0]);
                String deckId2 = mongoUserDetailsService.getActiveDeck(usernames[1]);

                String sleeve1 = deckService.getDeckSleeveById(deckId1);
                String sleeve2 = deckService.getDeckSleeveById(deckId2);

                Player player1 = new Player(usernames[0], avatar1, sleeve1);
                Player player2 = new Player(usernames[1], avatar2, sleeve2);

                List<Card> player1Deck = deckService.getDeckCardsById(deckId1);
                List<Card> player2Deck = deckService.getDeckCardsById(deckId2);

                gameRoom = new GameRoom(gameId, player1, player1Deck, player2, player2Deck, eventPublisher);

                gameRoom.setChat(new String[0]);

                GameRoom existingRoom = gameRooms.putIfAbsent(gameId, gameRoom); // returns null for the first connection
                if (existingRoom == null) startGameRoomScheduledTasks(gameRoom); // and starts the schedule
                else gameRoom = existingRoom; // second connecting player joins
            }
        }

        if (gameRoom != null) {
            gameRoom.addSession(session);
            if (gameRoom.hasFullConnection()) {
                gameRoom.sendMessagesToAll("[OPPONENT_RECONNECTED]");
                if (gameRoom.getBoardState() == null) {
                    SetupInfo setupInfo = gameRoom.setUpGame();
                    scheduleGameSetup(gameRoom, setupInfo.names(), setupInfo.startingPlayerIndex());
                    
                    GameStart newGame = gameRoom.initiallyDistributeCards();
                    GameRoom finalGameRoom = gameRoom;
                    scheduleCardDistribution(gameRoom, () -> finalGameRoom.distributeCardsAndSetStage(newGame));
                }
                else distributeExistingBoardState(gameRoom);
            }
        }
    }

    private void distributeExistingBoardState(GameRoom gameRoom) throws IOException {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;

        gameRoom.broadcastPlayerInfo();
        distributeBoardStateCards(gameRoom, boardState);
        distributeChatHistory(gameRoom);

        gameRoom.sendMessagesToAll("[SET_BOOT_STAGE]:" + gameRoom.getBootStage());
        gameRoom.sendMessagesToAll("[SET_PHASE]:" + gameRoom.getPhase());
        gameRoom.sendMessagesToAll("[SET_TURN]:" + gameRoom.getUsernameTurn());
    }
    
    private void distributeChatHistory(GameRoom gameRoom) {
        String[] chatHistory = gameRoom.getChat();
        if (chatHistory == null || chatHistory.length == 0) return;
        
        try {
            // Reverse the chat history to match frontend ordering (newest first)
            String[] reversedChatHistory = new String[chatHistory.length];
            for (int i = 0; i < chatHistory.length; i++) {
                reversedChatHistory[i] = chatHistory[chatHistory.length - 1 - i];
            }
            String chatHistoryJson = objectMapper.writeValueAsString(reversedChatHistory);
            gameRoom.sendMessagesToAll("[CHAT_HISTORY]:" + chatHistoryJson);
        } catch (Exception e) {
            // Fallback to empty array if serialization fails or max message size exceeded
            gameRoom.sendMessagesToAll("[CHAT_HISTORY]:[]");
        }
    }
    
    private void distributeBoardStateCards(GameRoom gameRoom, BoardState boardState) throws IOException {
        // Create complete board state object including all positions
        Map<String, Object> completeBoardState = new HashMap<>();
        
        // Add all card positions
        completeBoardState.put("player1Hand", Arrays.asList(boardState.getPlayer1Hand()));
        completeBoardState.put("player1Deck", Arrays.asList(boardState.getPlayer1Deck()));
        completeBoardState.put("player1EggDeck", Arrays.asList(boardState.getPlayer1EggDeck()));
        completeBoardState.put("player1Security", Arrays.asList(boardState.getPlayer1Security()));
        completeBoardState.put("player1Trash", Arrays.asList(boardState.getPlayer1Trash()));
        completeBoardState.put("player1Reveal", Arrays.asList(boardState.getPlayer1Reveal()));
        completeBoardState.put("player1BreedingArea", Arrays.asList(boardState.getPlayer1BreedingArea()));
        
        // Add all digimon field positions
        for (int i = 1; i <= 21; i++) {
            GameCard[] cards = getBoardStatePosition(boardState, "player1Digi" + i);
            completeBoardState.put("player1Digi" + i, Arrays.asList(cards));
        }
        
        // Add all link positions
        for (int i = 1; i <= 16; i++) {
            GameCard[] cards = getBoardStatePosition(boardState, "player1Link" + i);
            completeBoardState.put("player1Link" + i, Arrays.asList(cards));
        }
        
        // Add player2 positions
        completeBoardState.put("player2Hand", Arrays.asList(boardState.getPlayer2Hand()));
        completeBoardState.put("player2Deck", Arrays.asList(boardState.getPlayer2Deck()));
        completeBoardState.put("player2EggDeck", Arrays.asList(boardState.getPlayer2EggDeck()));
        completeBoardState.put("player2Security", Arrays.asList(boardState.getPlayer2Security()));
        completeBoardState.put("player2Trash", Arrays.asList(boardState.getPlayer2Trash()));
        completeBoardState.put("player2Reveal", Arrays.asList(boardState.getPlayer2Reveal()));
        completeBoardState.put("player2BreedingArea", Arrays.asList(boardState.getPlayer2BreedingArea()));
        
        for (int i = 1; i <= 21; i++) {
            GameCard[] cards = getBoardStatePosition(boardState, "player2Digi" + i);
            completeBoardState.put("player2Digi" + i, Arrays.asList(cards));
        }
        
        for (int i = 1; i <= 16; i++) {
            GameCard[] cards = getBoardStatePosition(boardState, "player2Link" + i);
            completeBoardState.put("player2Link" + i, Arrays.asList(cards));
        }

        // Add memory values
        completeBoardState.put("player1Memory", boardState.getPlayer1Memory());
        completeBoardState.put("player2Memory", boardState.getPlayer2Memory());

        String boardStateJson = objectMapper.writeValueAsString(completeBoardState);
        gameRoom.sendMessagesToAll("[DISTRIBUTE_CARDS]:" + boardStateJson);
    }

    private void handleAttack(GameRoom gameRoom, WebSocketSession session, String message) {
        if (!gameRoom.hasFullConnection() || message.split(":").length < 5) return;
        String[] parts = message.split(":", 5);
        String from = parts[2];
        String to = parts[3];
        String isEffect = parts[4];
        gameRoom.sendMessageToOtherSessions(session,"[ATTACK]:" + getPosition(from) + ":" + getPosition(to) + ":" + isEffect);
    }

    private void handleSendMoveCard(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 5) return;
        String[] parts = roomMessage.split(":", 5);
        String cardId = parts[2];
        String from = parts[3];
        String to = parts[4];
        
        // Get current player username
        String currentPlayer = session.getPrincipal() != null ? session.getPrincipal().getName() : null;
                
        if (currentPlayer != null) {
            // Update BoardState
            updateBoardStateForCardMove(gameRoom, cardId, from, to, currentPlayer);
        }

        gameRoom.sendMessageToOtherSessions(session, "[MOVE_CARD]:" + cardId + ":" + getPosition(from) + ":" + getPosition(to));
    }

    private void handleSendSetModifiers(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 5) return;
        String[] parts = roomMessage.split(":");
        String cardId = parts[2];
        String location = parts[3];
        String modifiersJson = String.join(":", Arrays.copyOfRange(parts, 4, parts.length));

        updateCardModifiers(gameRoom, cardId, location, modifiersJson);

        gameRoom.sendMessageToOtherSessions(session, "[SET_MODIFIERS]:" + cardId + ":" + getPosition(location) + ":" + modifiersJson);
    }

    private void handleSendMoveToStack(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 7) return;
        String[] parts = roomMessage.split(":", 7);
        String topOrBottom = parts[2];
        String cardId = parts[3];
        String from = parts[4];
        String to = parts[5];
        String facing = parts[6];
        
        // Get current player username
        String currentPlayer = session.getPrincipal() != null ? session.getPrincipal().getName() : null;
        
        if (currentPlayer != null) {
            // Update BoardState for stack move
            updateBoardStateForStackMove(gameRoom, cardId, from, to, topOrBottom, facing, currentPlayer);
        }
        
        gameRoom.sendMessageToOtherSessions(session, "[MOVE_CARD_TO_STACK]:" + topOrBottom + ":" + cardId + ":" + getPosition(from) + ":" + getPosition(to) + ":" + facing);
    }

    private void handleTiltCard(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 4) return;
        String[] parts = roomMessage.split(":", 4);
        String cardId = parts[2];
        String location = parts[3];

        updateCardTiltStatus(gameRoom, cardId, location);
        
        gameRoom.sendMessageToOtherSessions(session, "[TILT_CARD]:" + cardId + ":" + getPosition(location));
    }

    private void handleFlipCard(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 4) return;
        String[] parts = roomMessage.split(":", 4);
        String cardId = parts[2];
        String location = parts[3];
        
        // Update BoardState with face status
        updateCardFaceStatus(gameRoom, cardId, location);

        gameRoom.sendMessageToOtherSessions(session, "[FLIP_CARD]:" + cardId + ":" + getPosition(location));
    }

    private void updateCardTiltStatus(GameRoom gameRoom, String cardId, String location) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        // Try both player1 and player2 mappings to find the card
        String[] possibleLocations = {
            mapClientToServer(location, gameRoom.getPlayer1().username(), gameRoom),
            mapClientToServer(location, gameRoom.getPlayer2().username(), gameRoom)
        };
        
        for (String serverLocation : possibleLocations) {
            GameCard[] cards = getBoardStatePosition(boardState, serverLocation);
            for (int i = 0; i < cards.length; i++) {
                if (cards[i].id().toString().equals(cardId)) {
                    // Toggle tilt status
                    GameCard oldCard = cards[i];
                    GameCard updatedCard = new GameCard(
                        oldCard.uniqueCardNumber(), oldCard.name(), oldCard.imgUrl(), oldCard.cardType(),
                        oldCard.color(), oldCard.attribute(), oldCard.cardNumber(), oldCard.digivolveConditions(),
                        oldCard.specialDigivolve(), oldCard.stage(), oldCard.digiType(), oldCard.dp(),
                        oldCard.playCost(), oldCard.level(), oldCard.mainEffect(), oldCard.inheritedEffect(),
                        oldCard.aceEffect(), oldCard.burstDigivolve(), oldCard.digiXros(), oldCard.dnaDigivolve(),
                        oldCard.securityEffect(), oldCard.linkDP(), oldCard.linkEffect(), oldCard.linkRequirement(),
                        oldCard.assemblyEffect(), oldCard.restrictions(), oldCard.illustrator(), oldCard.id(),
                        oldCard.modifiers(), !oldCard.isTilted(), oldCard.isFaceUp()
                    );
                    cards[i] = updatedCard;
                    setBoardStatePosition(boardState, serverLocation, cards);
                    return;
                }
            }
        }
    }
    
    private void updateCardFaceStatus(GameRoom gameRoom, String cardId, String location) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        // Try both player1 and player2 mappings to find the card
        String[] possibleLocations = {
            mapClientToServer(location, gameRoom.getPlayer1().username(), gameRoom),
            mapClientToServer(location, gameRoom.getPlayer2().username(), gameRoom)
        };
        
        for (String serverLocation : possibleLocations) {
            GameCard[] cards = getBoardStatePosition(boardState, serverLocation);
            for (int i = 0; i < cards.length; i++) {
                if (cards[i].id().toString().equals(cardId)) {
                    // Toggle face status
                    GameCard oldCard = cards[i];
                    GameCard updatedCard = new GameCard(
                        oldCard.uniqueCardNumber(), oldCard.name(), oldCard.imgUrl(), oldCard.cardType(),
                        oldCard.color(), oldCard.attribute(), oldCard.cardNumber(), oldCard.digivolveConditions(),
                        oldCard.specialDigivolve(), oldCard.stage(), oldCard.digiType(), oldCard.dp(),
                        oldCard.playCost(), oldCard.level(), oldCard.mainEffect(), oldCard.inheritedEffect(),
                        oldCard.aceEffect(), oldCard.burstDigivolve(), oldCard.digiXros(), oldCard.dnaDigivolve(),
                        oldCard.securityEffect(), oldCard.linkDP(), oldCard.linkEffect(), oldCard.linkRequirement(),
                        oldCard.assemblyEffect(), oldCard.restrictions(), oldCard.illustrator(), oldCard.id(),
                        oldCard.modifiers(), oldCard.isTilted(), !oldCard.isFaceUp()
                    );
                    cards[i] = updatedCard;
                    setBoardStatePosition(boardState, serverLocation, cards);
                    return;
                }
            }
        }
    }

    private void updateCardModifiers(GameRoom gameRoom, String cardId, String location, String modifiersJson) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        try {
            Modifiers newModifiers = objectMapper.readValue(modifiersJson, Modifiers.class);
            
            // Try both player1 and player2 mappings to find the card
            String[] possibleLocations = {
                mapClientToServer(location, gameRoom.getPlayer1().username(), gameRoom),
                mapClientToServer(location, gameRoom.getPlayer2().username(), gameRoom)
            };
            
            for (String serverLocation : possibleLocations) {
                GameCard[] cards = getBoardStatePosition(boardState, serverLocation);
                for (int i = 0; i < cards.length; i++) {
                    if (cards[i].id().toString().equals(cardId)) {
                        // Update modifiers
                        GameCard oldCard = cards[i];
                        GameCard updatedCard = new GameCard(
                            oldCard.uniqueCardNumber(), oldCard.name(), oldCard.imgUrl(), oldCard.cardType(),
                            oldCard.color(), oldCard.attribute(), oldCard.cardNumber(), oldCard.digivolveConditions(),
                            oldCard.specialDigivolve(), oldCard.stage(), oldCard.digiType(), oldCard.dp(),
                            oldCard.playCost(), oldCard.level(), oldCard.mainEffect(), oldCard.inheritedEffect(),
                            oldCard.aceEffect(), oldCard.burstDigivolve(), oldCard.digiXros(), oldCard.dnaDigivolve(),
                            oldCard.securityEffect(), oldCard.linkDP(), oldCard.linkEffect(), oldCard.linkRequirement(),
                            oldCard.assemblyEffect(), oldCard.restrictions(), oldCard.illustrator(), oldCard.id(),
                            newModifiers, oldCard.isTilted(), oldCard.isFaceUp()
                        );
                        cards[i] = updatedCard;
                        setBoardStatePosition(boardState, serverLocation, cards);
                        return;
                    }
                }
            }
        } catch (Exception e) {
            // Log error or handle gracefully
        }
    }

    private void handleUnsuspendAll(GameRoom gameRoom, WebSocketSession session) {
        if (!gameRoom.hasFullConnection()) return;

        // Update BoardState - unsuspend all cards in Digi fields for the current player
        unsuspendAllCardsInBoardState(gameRoom, session);

        gameRoom.sendMessageToOtherSessions(session, "[UNSUSPEND_ALL]");
    }
    
    private void unsuspendAllCardsInBoardState(GameRoom gameRoom, WebSocketSession session) {
        BoardState boardState = gameRoom.getBoardState();
        if (boardState == null) return;
        
        // Determine which player is performing the unsuspend (not the opponent)
        String currentPlayer = session.getPrincipal() != null ? session.getPrincipal().getName() : null;
        
        if (currentPlayer == null) return;
        
        boolean isPlayer1 = gameRoom.getPlayer1().username().equals(currentPlayer);
        
        // Unsuspend all cards in Digi1-21 positions for the current player
        for (int i = 1; i <= 21; i++) {
            String digiPosition = isPlayer1 ? "player1Digi" + i : "player2Digi" + i;
            GameCard[] cards = getBoardStatePosition(boardState, digiPosition);
            
            for (int j = 0; j < cards.length; j++) {
                if (cards[j].isTilted()) {
                    GameCard oldCard = cards[j];
                    GameCard updatedCard = new GameCard(
                        oldCard.uniqueCardNumber(), oldCard.name(), oldCard.imgUrl(), oldCard.cardType(),
                        oldCard.color(), oldCard.attribute(), oldCard.cardNumber(), oldCard.digivolveConditions(),
                        oldCard.specialDigivolve(), oldCard.stage(), oldCard.digiType(), oldCard.dp(),
                        oldCard.playCost(), oldCard.level(), oldCard.mainEffect(), oldCard.inheritedEffect(),
                        oldCard.aceEffect(), oldCard.burstDigivolve(), oldCard.digiXros(), oldCard.dnaDigivolve(),
                        oldCard.securityEffect(), oldCard.linkDP(), oldCard.linkEffect(), oldCard.linkRequirement(),
                        oldCard.assemblyEffect(), oldCard.restrictions(), oldCard.illustrator(), oldCard.id(),
                        oldCard.modifiers(), false, oldCard.isFaceUp() // Set isTilted to false
                    );
                    cards[j] = updatedCard;
                }
            }
            setBoardStatePosition(boardState, digiPosition, cards);
        }
    }

    private void handleCreateToken(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection()) return;
        String[] parts = roomMessage.split(":", 3);
        String targetPosition = parts[1];
        String cardJson = parts[2];

        // Get current player username
        String currentPlayer = session.getPrincipal() != null ? session.getPrincipal().getName() : null;
        
        if (currentPlayer != null) {
            try {
                GameCard card = cardJsonConverter.convertToGameCard(cardJson);
                
                // Persist card in BoardState at the specified target position
                BoardState boardState = gameRoom.getBoardState();
                if (boardState != null) {
                    String serverPosition = mapClientToServer(targetPosition, currentPlayer, gameRoom);
                    setBoardStatePosition(boardState, serverPosition, new GameCard[]{card});
                }

                gameRoom.sendMessageToOtherSessions(session, 
                    "[CREATE_TOKEN]:" + card.id() + ":" + card.name() + ":" + getPosition(targetPosition));
                    
            } catch (Exception e) {
                System.err.println("ERROR in handleCreateToken: " + e.getMessage());
            }
        }
    }

    private void handleMemoryUpdate(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 3) return;
        String[] parts = roomMessage.split(":", 3);
        int memory = Integer.parseInt(parts[2]) * -1;
        
        // Update BoardState memory
        BoardState boardState = gameRoom.getBoardState();
        if (boardState != null) {
            // Determine which player is updating memory
            String currentPlayer = session.getPrincipal() != null ? session.getPrincipal().getName() : null;
                    
            if (currentPlayer != null) {
                boolean isPlayer1 = gameRoom.getPlayer1().username().equals(currentPlayer);
                int newMemory = Integer.parseInt(parts[2]);
                if (isPlayer1) {
                    boardState.setPlayer1Memory(newMemory);
                    boardState.setPlayer2Memory(-1 * newMemory);
                } else {
                    boardState.setPlayer1Memory(-1 * newMemory);
                    boardState.setPlayer2Memory(newMemory);
                }
            }
        }
        gameRoom.sendMessageToOtherSessions(session, "[UPDATE_MEMORY]:" + memory);
    }

    private void handleCommandWithId(GameRoom gameRoom, WebSocketSession session, String roomMessage) {
        if (!gameRoom.hasFullConnection() || roomMessage.split(":").length < 3) return;
        String[] parts = roomMessage.split(":", 3);
        String command = parts[0];
        String id = parts[2];
        gameRoom.sendMessageToOtherSessions(session, convertCommand(command) + ":" + id);
    }
    
    public void broadcastServerMessageToAllGameRooms(String message) {
        String formattedMessage = "[CHAT_MESSAGE]:【SERVER】﹕" + message;
        for (GameRoom gameRoom : gameRooms.values()) {
            gameRoom.sendMessagesToAll(formattedMessage);
        }
    }
    
    private void startGameRoomScheduledTasks(GameRoom gameRoom) {
        SHARED_SCHEDULER.scheduleWithFixedDelay(() -> {
            try {
                gameRoom.sendMessagesToAll("[HEARTBEAT]");
            } catch (Exception e) {
                System.err.println("Error in heartbeat for room " + gameRoom.getRoomId() + ": " + e.getMessage());
            }
        }, 10, 10, TimeUnit.SECONDS);

        SHARED_SCHEDULER.scheduleWithFixedDelay(() -> {
            try {
                gameRoom.checkAndEmitIfEmpty();
            } catch (Exception e) {
                System.err.println("Error in empty check for room " + gameRoom.getRoomId() + ": " + e.getMessage());
            }
        }, 30, 30, TimeUnit.SECONDS);
    }
    
    private void scheduleGameSetup(GameRoom gameRoom, String[] names, int startingPlayerIndex) {
        SHARED_SCHEDULER.schedule(() -> {
            try {
                gameRoom.setUsernameTurn(names[startingPlayerIndex]);
                String startingPlayerMessage = "[STARTING_PLAYER]≔" + names[startingPlayerIndex];
                gameRoom.sendMessagesToAll(startingPlayerMessage);
                gameRoom.storeChatMessage(startingPlayerMessage);
            } catch (Exception e) {
                System.err.println("Error in scheduleGameSetup for room " + gameRoom.getRoomId() + ": " + e.getMessage());
            }
        }, 50, TimeUnit.MILLISECONDS);
    }
    
    private void scheduleGameSetupRestart(GameRoom gameRoom, String startingPlayer) {
        SHARED_SCHEDULER.schedule(() -> {
            try {
                gameRoom.setUsernameTurn(startingPlayer);
                String startingPlayerMessage = "[STARTING_PLAYER]≔" + startingPlayer;
                gameRoom.sendMessagesToAll(startingPlayerMessage);
                gameRoom.storeChatMessage(startingPlayerMessage);
            } catch (Exception e) {
                System.err.println("Error in scheduleGameSetupRestart for room " + gameRoom.getRoomId() + ": " + e.getMessage());
            }
        }, 50, TimeUnit.MILLISECONDS);
    }
    
    private void scheduleCardDistribution(GameRoom gameRoom, Runnable distributionTask) {
        SHARED_SCHEDULER.schedule(() -> {
            try {
                distributionTask.run();
            } catch (Exception e) {
                System.err.println("Error in scheduleCardDistribution for room " + gameRoom.getRoomId() + ": " + e.getMessage());
            }
        }, 4800, TimeUnit.MILLISECONDS);
    }
}
