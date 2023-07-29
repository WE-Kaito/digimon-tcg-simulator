package com.github.wekaito.backend;

import com.github.wekaito.backend.Card;
import com.github.wekaito.backend.Deck;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeckTest {

    @Test
    void testEquals() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Card card3 = new Card("Gabumon", "Digimon", "Blue", "https://images.digimoncard.io/images/cards/BT1-011.jpg", "BT1-011", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Deck deck1 = new Deck("New Deck", new Card[]{card1, card2});
        Deck deck2 = new Deck("New Deck", new Card[]{card1, card2}); // Same content as deck1
        Deck deck3 = new Deck("Another Deck", new Card[]{card1, card2}); // Different name but same cards
        Deck deck4 = new Deck("New Deck", new Card[]{card1, card3}); // Different cards

        assertEquals(deck1, deck1); // Test reflexivity: an object should be equal to itself
        assertEquals(deck1, deck2); // Test equality: deck1 and deck2 have the same content
        assertNotEquals(deck1, deck3); // Test inequality: deck1 and deck3 have different names
        assertNotEquals(deck1, deck4); // Test inequality: deck1 and deck4 have different cards
        assertNotEquals(deck1, null); // Test inequality: deck1 is not equal to null
    }

    @Test
    void testHashCode() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Card card3 = new Card("Gabumon", "Digimon", "Blue", "https://images.digimoncard.io/images/cards/BT1-011.jpg", "BT1-011", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Deck deck1 = new Deck("New Deck", new Card[]{card1, card2});
        Deck deck2 = new Deck("New Deck", new Card[]{card1, card2}); // Same content as deck1
        Deck deck3 = new Deck("Another Deck", new Card[]{card1, card2}); // Different name but same cards
        Deck deck4 = new Deck("New Deck", new Card[]{card1, card3}); // Different cards

        assertEquals(deck1.hashCode(), deck2.hashCode()); // Test that equal objects have the same hash code
        assertNotEquals(deck1.hashCode(), deck3.hashCode()); // Test that different objects have different hash codes
    }
}
