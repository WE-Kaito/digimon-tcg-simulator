package com.github.wekaito.backend;

import com.github.wekaito.backend.models.DeckWithoutId;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.ArrayList;
import java.util.List;
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
        DeckWithoutId deck1 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck2 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck3 = new DeckWithoutId("Another Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck4 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck5 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false),
                Arguments.of(deck3, deck4, false),
                Arguments.of(deck1, deck5, true)
        );
    }

    private static Stream<Arguments> provideDecksForHashCodeTest() {
        DeckWithoutId deck1 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck2 = new DeckWithoutId("New Deck", new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck3 = new DeckWithoutId("Another Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");
        DeckWithoutId deck4 = new DeckWithoutId("New Deck",  new ArrayList<>(List.of("card1","card2")), "url", false, true,  "sleeve");

        return Stream.of(
                Arguments.of(deck1, deck2, true),
                Arguments.of(deck1, deck3, false),
                Arguments.of(deck3, deck4, false)
        );
    }
}
