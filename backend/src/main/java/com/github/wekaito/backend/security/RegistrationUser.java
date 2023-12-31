package com.github.wekaito.backend.security;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationUser(
        @NotNull
        @Size(min=3, max=16, message = "Username must contain between 3 and 16 characters")
        String username,
        @NotNull
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).*$", message = "Invalid password")
        @Size(min=6)
        String password,
        @NotNull
        @Size(min=1, max=64)
        String question,
        @NotNull
        @Size(min=1, max=64)
        String answer) {
}
