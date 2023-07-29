package com.github.wekaito.backend;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeckTest {

    @Test
    void testEquals() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Deck deck1 = new Deck("New Deck", new Card[]{card1, card2});
        Deck deck2 = new Deck("New Deck", new Card[]{card1, card2});

        assertEquals(deck1, deck2);
    }

    @Test
    void testHashCode() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        Deck deck1 = new Deck("New Deck", new Card[]{card1, card2});
        Deck deck2 = new Deck("New Deck", new Card[]{card1, card2});
        Deck deck3 = new Deck("Another Deck", new Card[]{card1, card2});

        assertEquals(deck1.hashCode(), deck2.hashCode());
        assertNotEquals(deck1.hashCode(), deck3.hashCode());
    }
}
