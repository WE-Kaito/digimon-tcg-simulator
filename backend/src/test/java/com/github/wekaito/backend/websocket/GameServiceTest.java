package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.Deck;
import com.github.wekaito.backend.IdService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;


import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
class GameServiceTest {

    @Mock
    private MongoUserDetailsService mongoUserDetailsService;
    @Mock
    private DeckService deckService;
    @Mock
    private IdService idService;

    private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks
    private GameService gameService;
    private WebSocketSession session1;
    private WebSocketSession session2;

    Card exampleCard = new Card("ExampleAgumon1", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine",
            "Reptile", 2000, 3, 0, 3,
            "main effect text", null);

    Card exampleCard2 = new Card("ExampleAgumon2", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine",
            "Reptile", 2000, 3, 0, 3,
            null, "inherited effect text");

    Card[] cards = {exampleCard, exampleCard, exampleCard};
    Card[] cards2 = {exampleCard2, exampleCard2, exampleCard2};
    String username1 = "testUser1";
    String username2 = "testUser2";
    Deck exampleDeck = new Deck("12345", "New Deck", cards, "authorId");
    Deck exampleDeck2 = new Deck("67890", "New Deck2", cards2, "authorId");
    String gameId = "testUser1‗testUser2";

    private WebSocketSession createMockSession(String username) {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getPrincipal()).thenReturn(() -> username);
        when(session.isOpen()).thenReturn(true);
        return session;
    }

    private void putPlayersToGameRoom() {
        Set<WebSocketSession> gameRoom = new HashSet<>();
        gameRoom.add(session1);
        gameRoom.add(session2);
        gameService.getGameRooms().put(gameId, gameRoom);
    }

    @BeforeEach
    void setUp() {
        gameService = new GameService(mongoUserDetailsService, deckService, idService, objectMapper);
        session1 = createMockSession(username1);
        session2 = createMockSession(username2);

        when(deckService.getDeckById(exampleDeck.id())).thenReturn(exampleDeck);
        when(deckService.getDeckById(exampleDeck2.id())).thenReturn(exampleDeck2);
        when(mongoUserDetailsService.getActiveDeck(username1)).thenReturn(exampleDeck.id());
        when(mongoUserDetailsService.getActiveDeck(username2)).thenReturn(exampleDeck2.id());
        when(mongoUserDetailsService.getAvatar(username1)).thenReturn("takato");
        when(mongoUserDetailsService.getAvatar(username2)).thenReturn("tai");
    }

    @Test
    void testStartGameMessage() throws IOException, InterruptedException {
        // WHEN
        gameService.afterConnectionEstablished(session1);
        gameService.handleTextMessage(session1, new TextMessage("/startGame:testUser1‗testUser2"));
        // THEN
        verify(session1, times(3)).sendMessage(any());
    }

    @Test
    void testGameSetup() throws IOException, InterruptedException {
        // GIVEN
        Player player1 = new Player(username1, "takato");
        Player player2 = new Player(username2, "tai");
        Player[] players = {player1, player2};
        String playersJson = new ObjectMapper().writeValueAsString(players);
        TextMessage expectedMessage = new TextMessage("[START_GAME]:" + playersJson);
        // WHEN
        gameService.setUpGame(session1, gameId);
        gameService.setUpGame(session2, gameId);
        // THEN
        verify(session1, times(1)).sendMessage(expectedMessage);
        verify(session2, times(1)).sendMessage(expectedMessage);
        assertThat(gameService.getGameRooms().get(gameId)).contains(session1).contains(session2);
    }

    @Test
    void testSurrender() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[SURRENDER]");
        putPlayersToGameRoom();

        // WHEN
        gameService.handleTextMessage(session2, new TextMessage(gameId + ":/surrender:" + username1));

        // THEN
        verify(session1, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testSendMessageToOpponent() throws IOException, InterruptedException {
        //Given
        TextMessage expectedMessage1 = new TextMessage("[RESTART]");
        TextMessage expectedMessage2 = new TextMessage("[SECURITY_VIEWED]");
        TextMessage expectedMessage3 = new TextMessage("[REVEAL_SFX]");
        TextMessage expectedMessage4 = new TextMessage("[SECURITY_REVEAL_SFX]");
        TextMessage expectedMessage5 = new TextMessage("[PLACE_CARD_SFX]");
        TextMessage expectedMessage6 = new TextMessage("[DRAW_CARD_SFX]");
        TextMessage expectedMessage7 = new TextMessage("[SUSPEND_CARD_SFX]");
        TextMessage expectedMessage8 = new TextMessage("[UNSUSPEND_CARD_SFX]");
        TextMessage expectedMessage9 = new TextMessage("[BUTTON_CLICK_SFX]");
        TextMessage expectedMessage10 = new TextMessage("[TRASH_CARD_SFX]");
        TextMessage expectedMessage11 = new TextMessage("[SHUFFLE_DECK_SFX]");
        TextMessage expectedMessage12 = new TextMessage("[ACCEPT_RESTART]");

        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/restartRequest:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/openedSecurity:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playRevealSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playSecurityRevealSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playPlaceCardSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playDrawCardSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playSuspendCardSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playUnsuspendCardSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playButtonClickSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playTrashCardSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/playShuffleDeckSfx:" + username2));
        gameService.handleTextMessage(session1, new TextMessage(gameId + ":/acceptRestart:" + username2));
        gameService.handleTextMessage(session1, new TextMessage("/heartbeat/"));

        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage1);
        verify(session2, times(1)).sendMessage(expectedMessage2);
        verify(session2, times(1)).sendMessage(expectedMessage3);
        verify(session2, times(1)).sendMessage(expectedMessage4);
        verify(session2, times(1)).sendMessage(expectedMessage5);
        verify(session2, times(1)).sendMessage(expectedMessage6);
        verify(session2, times(1)).sendMessage(expectedMessage7);
        verify(session2, times(1)).sendMessage(expectedMessage8);
        verify(session2, times(1)).sendMessage(expectedMessage9);
        verify(session2, times(1)).sendMessage(expectedMessage10);
        verify(session2, times(1)).sendMessage(expectedMessage11);
        verify(session2, times(1)).sendMessage(expectedMessage12);
    }

    @Test
    void expectReturn_whenGameRoomDoesNotExist() throws IOException, InterruptedException {
        // WHEN
        gameService.handleTextMessage(session1, new TextMessage("wrongId" + ":/surrender:" + username1));
        // THEN
        verify(session1, times(0)).sendMessage(any());
    }

    @Test
    void testProcessGameChunks() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[DISTRIBUTE_CARDS]:{test}");
        TextMessage updateFromClient = new TextMessage(gameId + ":/updateGame:{test}");
        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, updateFromClient);
        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testHandleAttack() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage1 = new TextMessage("[ATTACK]:opponentDigi1:myDigi1");
        TextMessage attackMessage1 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi1:opponentDigi1");
        TextMessage expectedMessage2 = new TextMessage("[ATTACK]:opponentDigi2:myDigi2");
        TextMessage attackMessage2 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi2:opponentDigi2");
        TextMessage expectedMessage3 = new TextMessage("[ATTACK]:opponentDigi3:myDigi3");
        TextMessage attackMessage3 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi3:opponentDigi3");
        TextMessage expectedMessage4 = new TextMessage("[ATTACK]:opponentDigi4:myDigi4");
        TextMessage attackMessage4 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi4:opponentDigi4");
        TextMessage expectedMessage5 = new TextMessage("[ATTACK]:opponentDigi5:myDigi5");
        TextMessage attackMessage5 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi5:opponentDigi5");
        TextMessage expectedMessage6 = new TextMessage("[ATTACK]:opponentDigi6:myDigi6");
        TextMessage attackMessage6 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi6:opponentDigi6");
        TextMessage expectedMessage7 = new TextMessage("[ATTACK]:opponentDigi7:myDigi7");
        TextMessage attackMessage7 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi7:opponentDigi7");
        TextMessage expectedMessage8 = new TextMessage("[ATTACK]:opponentDigi8:myDigi8");
        TextMessage attackMessage8 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi8:opponentDigi8");
        TextMessage expectedMessage9 = new TextMessage("[ATTACK]:opponentDigi9:myDigi9");
        TextMessage attackMessage9 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi9:opponentDigi9");
        TextMessage expectedMessage10 = new TextMessage("[ATTACK]:opponentDigi10:myDigi10");
        TextMessage attackMessage10 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi10:opponentDigi10");
        TextMessage expectedMessage11 = new TextMessage("[ATTACK]:opponentDigi1:mySecurity");
        TextMessage attackMessage11 = new TextMessage(gameId + ":/attack:" + username2 + ":myDigi1:opponentSecurity");

        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, attackMessage1);
        gameService.handleTextMessage(session1, attackMessage2);
        gameService.handleTextMessage(session1, attackMessage3);
        gameService.handleTextMessage(session1, attackMessage4);
        gameService.handleTextMessage(session1, attackMessage5);
        gameService.handleTextMessage(session1, attackMessage6);
        gameService.handleTextMessage(session1, attackMessage7);
        gameService.handleTextMessage(session1, attackMessage8);
        gameService.handleTextMessage(session1, attackMessage9);
        gameService.handleTextMessage(session1, attackMessage10);
        gameService.handleTextMessage(session1, attackMessage11);
        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage1);
        verify(session2, times(1)).sendMessage(expectedMessage2);
        verify(session2, times(1)).sendMessage(expectedMessage3);
        verify(session2, times(1)).sendMessage(expectedMessage4);
        verify(session2, times(1)).sendMessage(expectedMessage5);
        verify(session2, times(1)).sendMessage(expectedMessage6);
        verify(session2, times(1)).sendMessage(expectedMessage7);
        verify(session2, times(1)).sendMessage(expectedMessage8);
        verify(session2, times(1)).sendMessage(expectedMessage9);
        verify(session2, times(1)).sendMessage(expectedMessage10);
        verify(session2, times(1)).sendMessage(expectedMessage11);
    }

    @Test
    void testChatMessage() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[CHAT_MESSAGE]:" + username1 + ":test test");
        TextMessage chatMessage = new TextMessage(gameId + ":/chatMessage:" + username2 + ":test test");
        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, chatMessage);
        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testSingleUpdate() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[MOVE_CARD]:123abc:opponentDigi1:opponentDigi2");
        TextMessage updateFromClient = new TextMessage(gameId + ":/moveCard:"+ username2 +":123abc:myDigi1:myDigi2");
        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, updateFromClient);
        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testMemoryUpdate() throws IOException, InterruptedException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[UPDATE_MEMORY]:-5");
        TextMessage updateFromClient = new TextMessage(gameId + ":/updateMemory:"+ username2 +":5");
        putPlayersToGameRoom();
        // WHEN
        gameService.handleTextMessage(session1, updateFromClient);
        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testSendingHeartbeats() throws IOException {
        // GIVEN
        gameService.afterConnectionEstablished(session1);
        gameService.afterConnectionEstablished(session2);
        // WHEN
        gameService.sendHeartbeat();
        // THEN
        verify(session1, times(1)).sendMessage(new TextMessage("[HEARTBEAT]"));
        verify(session2, times(1)).sendMessage(new TextMessage("[HEARTBEAT]"));
    }
}
