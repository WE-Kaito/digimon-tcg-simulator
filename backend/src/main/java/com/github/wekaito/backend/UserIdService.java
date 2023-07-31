package com.github.wekaito.backend;

import com.github.wekaito.backend.security.MongoUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserIdService {

    private final MongoUserDetailsService mongoUserDetailsService;

    public String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return this.mongoUserDetailsService.getUserIdByUsername(username);
    }

}
