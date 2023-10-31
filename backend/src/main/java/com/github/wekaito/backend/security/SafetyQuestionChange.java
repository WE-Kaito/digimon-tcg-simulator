package com.github.wekaito.backend.security;

import jakarta.validation.constraints.Size;

public record SafetyQuestionChange(
        @Size(min=1, max=64)
        String question,
        @Size(min=1, max=64)
        String answer) {
}
