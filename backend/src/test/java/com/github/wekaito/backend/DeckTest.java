package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Deck;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class DeckTest {

    @ParameterizedTest
    @MethodSource("provideDecksForEqualityTest")
    void testEquals(Deck deck1, Deck deck2, boolean expectedEquals) {
        assertEquals(expectedEquals, deck1.equals(deck2));
    }

    @ParameterizedTest
    @MethodSource("provideDecksForHashCodeTest")
    void testHashCode(Deck deck1, Deck deck2, boolean expectedEquals) {
        if (expectedEquals) {
            assertEquals(deck1.hashCode(), deck2.hashCode());
        } else {
            assertNotEquals(deck1.hashCode(), deck2.hashCode());
        }
    }

    private static Stream<Arguments> provideDecksForEqualityTest() {
        Deck deck1 = new Deck("1", "New Deck",  new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId1");
        Deck deck2 = new Deck("1", "New Deck", new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId1");
        Deck deck3 = new Deck("2", "Another Deck", new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId2");
        Deck deck4 = new Deck("1", "New Deck",  new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId1");

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false),
                Arguments.of(deck3, deck4, false)
        );
    }

    private static Stream<Arguments> provideDecksForHashCodeTest() {
        Deck deck1 = new Deck("1", "New Deck", new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId1");
        Deck deck2 = new Deck("1", "New Deck", new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId1");
        Deck deck3 = new Deck("2", "Another Deck", new ArrayList<>(List.of("card1","card2")), "url", "sleeve", true, true, "authorId2");

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false)
        );
    }
}
