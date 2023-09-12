package com.github.wekaito.backend.security;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationUser(
        @NotEmpty
        @Size(min=3, max=14, message = "Username must contain between 3 and 14 characters")
        String username,
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).{6,20}$", message = "Invalid password")
        String password) {
}
