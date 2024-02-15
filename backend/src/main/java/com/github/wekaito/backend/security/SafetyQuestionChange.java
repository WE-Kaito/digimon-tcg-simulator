package com.github.wekaito.backend.security;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SafetyQuestionChange(
        @NotNull
        @Pattern(regexp = "^(?:(?![:_【】﹕≔<>$&]).){1,64}$", message = "Invalid question")
        String question,
        @NotNull
        @Pattern(regexp = "^(?:(?![:_【】﹕≔<>$&]).){1,64}$", message = "Invalid answer")
        String answer) {
}
