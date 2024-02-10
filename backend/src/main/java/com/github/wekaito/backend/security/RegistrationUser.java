package com.github.wekaito.backend.security;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RegistrationUser(
        @NotNull
        @Pattern(regexp = "^(?:(?![:_【】﹕≔<>$& ]).){3,16}$", message = "Invalid username")
        String username,
        @NotNull
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).{6,128}$", message = "Invalid password")
        String password,
        @NotNull
        @Pattern(regexp = "^(?:(?![:_【】﹕≔<>$&]).){1,64}$", message = "Invalid question")
        String question,
        @NotNull
        @Pattern(regexp = "^(?:(?![:_【】﹕≔<>$&]).){1,64}$", message = "Invalid answer")
        String answer) {
}
