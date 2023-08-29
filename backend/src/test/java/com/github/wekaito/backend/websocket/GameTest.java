package com.github.wekaito.backend.websocket;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GameTest {

    @Test
    void testEqualsAndHashCode() {
        GameCard[] cards = new GameCard[0];
        Game game1 = new Game(
                10, -10, cards, cards, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards
        );
        Game game2 = new Game(
                10, -10, cards, cards, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards
        );
        Game game3 = new Game(
                5, -5, cards, cards, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards
        );

        assertEquals(game1, game2);
        assertNotEquals(game1, game3);
        assertNotEquals(null, game1);
        assertEquals(game1.hashCode(), game2.hashCode());
        assertNotEquals(game1.hashCode(), game3.hashCode());
    }

    @Test
    void testToString() {
        GameCard[] cards = new GameCard[0];
        Game game = new Game(
                5, -5, cards, cards, cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards,
                cards, cards, cards, cards, cards, cards
        );
        String expectedString = "Game{" +
                "player1Memory='5'," +
                " player2Memory='-5'," +
                " player1Reveal='[]'," +
                " player2Reveal='[]'," +
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
                " player2Delay='[]'," +
                " player1Digi6='[]'," +
                " player1Digi7='[]'," +
                " player1Digi8='[]'," +
                " player1Digi9='[]'," +
                " player1Digi10='[]'," +
                " player2Digi6='[]'," +
                " player2Digi7='[]'," +
                " player2Digi8='[]'," +
                " player2Digi9='[]'," +
                " player2Digi10='[]'" +
                "}";
        assertEquals(expectedString, game.toString());
    }
}
