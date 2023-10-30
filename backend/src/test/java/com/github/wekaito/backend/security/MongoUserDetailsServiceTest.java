package com.github.wekaito.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MongoUserDetailsServiceTest {

    @Mock
    private MongoUserRepository mongoUserRepository;

    @InjectMocks
    private MongoUserDetailsService mongoUserDetailsService;

    @BeforeEach
    void setUp() {
        mongoUserDetailsService = new MongoUserDetailsService(mongoUserRepository);
        when(mongoUserRepository.findByUsername("testUser1")).thenReturn(Optional.of(new MongoUser("123", "testUser1", "password", "question?", "answer!", "12345", "takato", "sleeve1")));
    }

    @Test
    void testGetActiveDeckByUsername() {
        // WHEN
        String resultDeckId = mongoUserDetailsService.getActiveDeck("testUser1");
        // THEN
        assertThat(resultDeckId).isEqualTo("12345");
        assertThrows(UsernameNotFoundException.class, () -> {
            mongoUserDetailsService.getActiveDeck("notExistingUser");
        });
    }

    @Test
    void testGetAvatarByUsername() {
        // WHEN
        String resultAvatarName = mongoUserDetailsService.getAvatar("testUser1");

        // THEN
        assertThat(resultAvatarName).isEqualTo("takato");
        assertThrows(UsernameNotFoundException.class, () -> {
            mongoUserDetailsService.getAvatar("notExistingUser");
        });
    }

    @Test
    void testLoadUserByUsername() {
        // WHEN
        UserDetails userDetails = mongoUserDetailsService.loadUserByUsername("testUser1");

        // THEN
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testUser1");
        assertThat(userDetails.getPassword()).isEqualTo("password");
        assertThat(userDetails.getAuthorities()).isEmpty();
        assertThrows(UsernameNotFoundException.class, () -> {
            mongoUserDetailsService.loadUserByUsername("notExistingUser");
        });
    }

    @Test
    void testGetUserIdByUsername() {
        String userId = mongoUserDetailsService.getUserIdByUsername("testUser1");
        assertThat(userId).isEqualTo("123");
        assertThrows(UsernameNotFoundException.class, () -> {
            mongoUserDetailsService.getUserIdByUsername("notExistingUser");
        });
    }

}
