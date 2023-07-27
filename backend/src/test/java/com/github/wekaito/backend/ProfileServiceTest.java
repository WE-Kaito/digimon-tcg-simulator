package com.github.wekaito.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.MockitoAnnotations.openMocks;

class ProfileServiceTest {

    private ProfileService profileService;

    @Mock
    private DeckRepo deckRepo;

    @BeforeEach
    void setUp() {
        openMocks(this);
        profileService = new ProfileService(deckRepo);
    }

    Card exampleCard = new Card(
            "Agumon",
            "Digimon",
            "Red",
            "https://images.digimoncard.io/images/cards/BT1-010.jpg",
            "BT1-010",
            "Rookie",
            "Vaccine",
            "Reptile",
            2000,
            3,
            0,
            3,
            "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.",
            null
    );

    @Test
    void testFetchCards() {
        Card[] cards = profileService.fetchCards("Agumon".describeConstable(), "Red".describeConstable(), "Digimon".describeConstable());

        assertNotNull(cards);
        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class);
    }

    @Test
    void testAddDeck() {
        Card[] cards = {exampleCard};
        Deck sampleDeck = new Deck("Test Deck", cards);

        profileService.addDeck(sampleDeck);

        verify(deckRepo).save(sampleDeck);
    }
}