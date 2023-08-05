package com.github.wekaito.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.Deck;
import com.github.wekaito.backend.ProfileService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.CloseStatus;
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
    private ProfileService profileService;
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
    String gameId = "testUser1_testUser2";

    private WebSocketSession createMockSession(String username) {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getPrincipal()).thenReturn(() -> username);
        when(session.isOpen()).thenReturn(true);
        return session;
    }

    @BeforeEach
    void setUp() {
        gameService = new GameService(mongoUserDetailsService, profileService);
        session1 = createMockSession(username1);
        session2 = createMockSession(username2);

        when(profileService.getDeckById(exampleDeck.id())).thenReturn(exampleDeck);
        when(profileService.getDeckById(exampleDeck2.id())).thenReturn(exampleDeck2);
        when(mongoUserDetailsService.getActiveDeck(username1)).thenReturn(exampleDeck.id());
        when(mongoUserDetailsService.getActiveDeck(username2)).thenReturn(exampleDeck2.id());
        when(mongoUserDetailsService.getAvatar(username1)).thenReturn("takato");
        when(mongoUserDetailsService.getAvatar(username2)).thenReturn("tai");
    }

    @Test
    void testGameSetup() throws IOException {
        // GIVEN
        Player player1 = new Player(username1, "takato", exampleDeck.cards());
        Player player2 = new Player(username2, "tai", exampleDeck2.cards());
        Player[] players = {player1, player2};
        String playersJson = new ObjectMapper().writeValueAsString(players);
        TextMessage expectedMessage = new TextMessage( "[START_GAME]:" + playersJson);
        // WHEN
        gameService.setUpGame(session1, gameId);
        gameService.setUpGame(session2, gameId);
        // THEN
        verify(session1, times(1)).sendMessage(expectedMessage);
        verify(session2, times(1)).sendMessage(expectedMessage);
        assertThat(gameService.getGameRooms().get(gameId)).contains(session1).contains(session2);
    }

    @Test
    void testSurrender() throws IOException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[SURRENDER]");
        Set<WebSocketSession> gameRoom = new HashSet<>();
        gameRoom.add(session1);
        gameRoom.add(session2);
        gameService.getGameRooms().put(gameId, gameRoom);

        // WHEN
        gameService.handleSurrender(session1, gameRoom, "/surrender:" + username2);

        // THEN
        assertThat(gameService.getGameRooms()).isEmpty();
        verify(session2, times(1)).sendMessage(expectedMessage);
    }

    @Test
    void testPlayerLeaves() throws IOException {
        // GIVEN
        TextMessage expectedMessage = new TextMessage("[PLAYER_LEFT]");
        Set<WebSocketSession> gameRoom = new HashSet<>();
        gameRoom.add(session1);
        gameRoom.add(session2);
        gameService.getGameRooms().put(gameId, gameRoom);

        // WHEN
        gameService.afterConnectionClosed(session1, CloseStatus.NORMAL);

        // THEN
        verify(session2, times(1)).sendMessage(expectedMessage);
        assertThat(gameService.getGameRooms()).isEmpty();
    }

}
