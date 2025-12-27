package com.github.wekaito.backend.models;

import java.util.UUID;

public record ChatMessage(
    String id,
    String message,
    String author
) {
    public ChatMessage(String message, String author) {
        this(UUID.randomUUID().toString(), message, author);
    }
}