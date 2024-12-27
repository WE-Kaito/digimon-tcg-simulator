package com.github.wekaito.backend.models;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("decks")
public record Deck(
        String id,
        String name,
        List<String> decklist,
        String deckImageCardUrl,
        String sleeveName,
        boolean isAllowed_en,
        boolean isAllowed_jp,
        String authorId) {

}
