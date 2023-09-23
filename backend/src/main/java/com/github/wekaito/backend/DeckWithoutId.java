package com.github.wekaito.backend;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

public record DeckWithoutId(
        String name,
        String color,
        @Min(50)
        @Max(55)
        List<String> decklist) {
}
