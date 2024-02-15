package com.github.wekaito.backend.security;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordRecovery(
        String username,
        String answer,
        @NotNull
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).{6,128}$", message = "Invalid password")
        String newPassword) {
}
