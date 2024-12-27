package com.github.wekaito.backend.models;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Objects;

public record DeckWithoutId(
        @NotNull
        String name,
        @NotNull
        @Size(min = 50, max = 55)
        List<String> decklist,
        String deckImageCardUrl,
        boolean isAllowed_en,
        boolean isAllowed_jp,
        String sleeveName) {

        @AssertTrue
        public boolean isDecklistValid() {
                return decklist.stream().noneMatch(Objects::isNull);
        }
}
