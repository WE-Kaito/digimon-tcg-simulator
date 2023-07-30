package com.github.wekaito.backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class DeckWithoutIdTest {

    @ParameterizedTest
    @MethodSource("provideDecksForEqualityTest")
    void testEquals(DeckWithoutId deck1, DeckWithoutId deck2, boolean expectedEquals) {
        assertEquals(expectedEquals, deck1.equals(deck2));
    }

    @ParameterizedTest
    @MethodSource("provideDecksForHashCodeTest")
    void testHashCode(DeckWithoutId deck1, DeckWithoutId deck2, boolean expectedEquals) {
        if (expectedEquals) {
            assertEquals(deck1.hashCode(), deck2.hashCode());
        } else {
            assertNotEquals(deck1.hashCode(), deck2.hashCode());
        }
    }

    private static Stream<Arguments> provideDecksForEqualityTest() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        DeckWithoutId deck1 = new DeckWithoutId("New Deck", new Card[]{card1, card2});
        DeckWithoutId deck2 = new DeckWithoutId("New Deck", new Card[]{card1, card2});
        DeckWithoutId deck3 = new DeckWithoutId("Another Deck", new Card[]{card1, card2});
        DeckWithoutId deck4 = new DeckWithoutId("New Deck", new Card[]{});
        DeckWithoutId deck5 = new DeckWithoutId("New Deck", new Card[]{card2, card1});

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false),
                Arguments.of(deck1, deck4, false),
                Arguments.of(deck1, deck5, true)
        );
    }

    private static Stream<Arguments> provideDecksForHashCodeTest() {
        Card card1 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);
        Card card2 = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine", "Reptile", 2000, 3, 0, 3, "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

        DeckWithoutId deck1 = new DeckWithoutId("New Deck", new Card[]{card1, card2});
        DeckWithoutId deck2 = new DeckWithoutId("New Deck", new Card[]{card1, card2});
        DeckWithoutId deck3 = new DeckWithoutId("Another Deck", new Card[]{card1, card2});
        DeckWithoutId deck4 = new DeckWithoutId("New Deck", new Card[]{});

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false),
                Arguments.of(deck1, deck4, false)
        );
    }
}
