package com.github.wekaito.backend;

public record DeckWithoutId( String name, Card[] cards, DeckStatus deckStatus) {
}
