package com.github.wekaito.backend;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DeckWithoutId(
        @NotNull
        String name,
        @NotNull
        String color,
        @NotNull
        @Size(min = 50, max = 55)
        List<String> decklist) {
}