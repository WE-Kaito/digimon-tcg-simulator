package com.github.wekaito.backend;

import java.util.List;

public record DeckWithoutId(
        String name,
        String color,
        List<String> decklist) {

}
