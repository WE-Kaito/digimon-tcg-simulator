package com.github.wekaito.backend.security;

import org.springframework.security.core.AuthenticationException;

public class UserBannedException extends AuthenticationException {
    public UserBannedException(String message) {
        super(message);
    }
}
