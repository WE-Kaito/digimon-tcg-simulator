package com.github.wekaito.backend.websocket;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GameTest {

    @Test
    void testEqualsAndHashCode() {
        GameCard[] cards = new GameCard[0];
        Game game1 = new Game(
                10, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards
        );
        Game game2 = new Game(
                10, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards
        );

        assertEquals(game1, game2);
        assertEquals(game1.hashCode(), game2.hashCode());
    }

    @Test
    void testToString() {
        GameCard[] cards = new GameCard[0];
        Game game = new Game(
                123, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards
        );
        String expectedString = "Game{" +
                "memory='123'," +
                " player1Hand='[]'," +
                " player1DeckField='[]'," +
                " player1EggDeck='[]'," +
                " player1Trash='[]'," +
                " player1Security='[]'," +
                " player1Tamer='[]'," +
                " player1Digi1='[]'," +
                " player1Digi2='[]'," +
                " player1Digi3='[]'," +
                " player1Digi4='[]'," +
                " player1Digi5='[]'," +
                " player1BreedingArea='[]'," +
                " player2Hand='[]'," +
                " player2DeckField='[]'," +
                " player2EggDeck='[]'," +
                " player2Trash='[]'," +
                " player2Security='[]'," +
                " player2Tamer='[]'," +
                " player2Digi1='[]'," +
                " player2Digi2='[]'," +
                " player2Digi3='[]'," +
                " player2Digi4='[]'," +
                " player2Digi5='[]'," +
                " player2BreedingArea='[]'," +
                " player1Delay='[]'," +
                " player2Delay='[]'" +
                "}";
        assertEquals(expectedString, game.toString());
    }
}
