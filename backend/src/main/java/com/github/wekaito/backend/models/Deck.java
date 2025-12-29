package com.github.wekaito.backend.models;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("decks")
public record Deck(
        String id,
        String name,
        List<String> mainDeckList,
        List<String> eggDeckList,
        String deckImageCardUrl,
        String mainSleeveName,
        String eggSleeveName,
        String authorId) {
}
