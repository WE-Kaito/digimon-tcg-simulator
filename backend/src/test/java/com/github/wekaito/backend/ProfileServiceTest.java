package com.github.wekaito.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.MockitoAnnotations.openMocks;

class ProfileServiceTest {

    @InjectMocks
    private ProfileService profileService;

    @Test
    void testFetchCards() {

        Card exampleCard = new Card(
                "Agumon",
                "Digimon",
                "Red",
                "https://images.digimoncard.io/images/cards/BT1-010.jpg",
                "BT1-010",
                Optional.of("Rookie"),
                Optional.of("Vaccine"),
                Optional.of("Reptile"),
                Optional.of(2000),
                Optional.of(3),
                Optional.of(0),
                Optional.of(3),
                Optional.of("[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order."),
                Optional.empty()
        );

        openMocks(this);

        Card[] cards = profileService.fetchCards();

        assertNotNull(cards);
        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class).hasSizeGreaterThan(200);
    }
}