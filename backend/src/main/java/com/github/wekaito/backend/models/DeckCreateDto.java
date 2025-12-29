package com.github.wekaito.backend.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DeckCreateDto(
        @NotNull(message = "Must provide a name for the deck")
        String name,
        @Size(min = 1, max = 50, message = "Main deck must contain between 1 and 50 cards")
        List<String> mainDeckList,
        @Size(max = 5, message = "Egg deck can contain up to 5 cards")
        List<String> eggDeckList,
        String deckImageCardUrl,
        String mainSleeveName,
        String eggSleeveName) {
}
