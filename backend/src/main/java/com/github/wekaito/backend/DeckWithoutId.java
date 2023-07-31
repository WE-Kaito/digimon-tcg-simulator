package com.github.wekaito.backend;

public record DeckWithoutId(String name, Card[] cards) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeckWithoutId that = (DeckWithoutId) o;
        return DeckUtils.areDecksWithoutIdEqual(this, that);
    }

    @Override
    public int hashCode() {
        return DeckUtils.hashCode(this);
    }

    @Override
    public String toString() {
        return DeckUtils.deckWithoutIdToString(name, cards);
    }
}
