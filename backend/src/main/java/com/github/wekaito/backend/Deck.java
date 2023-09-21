package com.github.wekaito.backend;

import org.springframework.data.mongodb.core.mapping.Document;

@Document("decks")
public record Deck(
        String id,
        String name,
        Card[] cards,
        String authorId) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Deck deck = (Deck) o;
        return DeckUtils.areDecksEqual(this, deck);
    }

    @Override
    public int hashCode() {
        return DeckUtils.hashCode(this);
    }

    @Override
    public String toString() {
        return DeckUtils.deckToString(id, name, cards, authorId);
    }
}
