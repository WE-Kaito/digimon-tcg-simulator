package com.github.wekaito.backend.security;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordRecovery(
        String username,
        String answer,
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9])", message = "Invalid password")
        @Size(min=6, message = "Password must contain at least 6 characters")
        String newPassword) {
}
