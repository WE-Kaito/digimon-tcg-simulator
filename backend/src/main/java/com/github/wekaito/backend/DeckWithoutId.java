package com.github.wekaito.backend;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Objects;

public record DeckWithoutId(
        @NotNull
        String name,
        String color,
        @NotNull
        @Size(min = 50, max = 55)
        List<String> decklist) {

        @AssertTrue
        public boolean isDecklistValid() {
                return decklist.stream().noneMatch(Objects::isNull);
        }
}