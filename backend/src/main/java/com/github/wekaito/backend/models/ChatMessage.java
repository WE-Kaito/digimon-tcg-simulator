package com.github.wekaito.backend.models;

import java.time.Instant;
import java.util.UUID;

public record ChatMessage(
    String id,
    String message,
    String author,
    String timestamp
) {
    public ChatMessage(String message, String author) {
        this(UUID.randomUUID().toString(), message, author, Instant.now().toString());
    }
}
