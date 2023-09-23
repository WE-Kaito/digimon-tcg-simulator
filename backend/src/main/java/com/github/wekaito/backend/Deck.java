package com.github.wekaito.backend;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("decks")
public record Deck(
        String id,
        String name,
        String color,
        List<String> decklist,
        String authorId) {

}
