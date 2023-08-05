package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.Card;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class PlayerTest {

    Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
    Card card2 = new Card("Greymon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-011.jpg", "BT1-011", "Champion", "Vaccine", "Dinosaur", 4000, 0, 0, 5, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Digimon card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

    Card[] deck1 = {card1, card2};

    @Test
    void testPlayerInitialization() {
        // GIVEN
        String username = "testUser";
        String avatar = "avatar.png";
        Card[] deck = new Card[3];

        // WHEN
        Player player = new Player(username, avatar, deck);

        // THEN
        assertThat(player.username()).isEqualTo(username);
        assertThat(player.avatarName()).isEqualTo(avatar);
        assertThat(player.deck()).isEqualTo(deck);
    }

    @Test
    void testEquals() {
        Card[] deck2 = {card1, card2};

        Player player1 = new Player("testUser1", "avatar1.png", deck1);
        Player player2 = new Player("testUser1", "avatar1.png", deck2);

        assertEquals(player1, player2);
    }

    @Test
    void testNotEquals() {
        Card[] deck2 = {card1};

        Player player1 = new Player("testUser1", "avatar1.png", deck1);
        Player player2 = new Player("testUser1", "avatar1.png", deck2);

        assertNotEquals(player1, player2);
    }

    @Test
    void testHashCode() {
        Card[] deck2 = {card1, card2};

        Player player1 = new Player("testUser1", "avatar1.png", deck1);
        Player player2 = new Player("testUser1", "avatar1.png", deck2);

        assertEquals(player1.hashCode(), player2.hashCode());
    }

    @Test
    void testNotEqualsHashCode() {
        Card[] deck2 = {card1};

        Player player1 = new Player("testUser1", "avatar1.png", deck1);
        Player player2 = new Player("testUser1", "avatar1.png", deck2);

        assertNotEquals(player1.hashCode(), player2.hashCode());
    }

    @Test
    void testToString() {
        // GIVEN
        String username = "testUser";
        String avatar = "avatar.png";
        Card[] deck = new Card[3];
        Player player = new Player(username, avatar, deck);

        // WHEN
        String playerString = player.toString();

        // THEN
        assertThat(playerString).contains(username).contains(avatar).contains("deck=" + Arrays.toString(deck));
    }
}
