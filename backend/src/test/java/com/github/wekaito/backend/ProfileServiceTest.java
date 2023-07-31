package com.github.wekaito.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class ProfileServiceTest {

    private ProfileService profileService;

    @Mock
    private DeckRepo deckRepo;

    @Mock
    private IdService idService;

    @BeforeEach
    void setUp() {
        openMocks(this);
        profileService = new ProfileService(deckRepo, idService);
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

    Card[] cards = {exampleCard, exampleCard, exampleCard};
    Deck exampleDeck = new Deck("12345","New Deck", cards);
    DeckWithoutId exampleDeckWithoutId = new DeckWithoutId("New Deck", cards);
    @Test
    void testFetchCards() {
        Card[] cards = profileService.fetchCards("Agumon".describeConstable(), "Red".describeConstable(), "Digimon".describeConstable());

        assertNotNull(cards);
        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class);
    }
    @DirtiesContext
    @Test
    void testAddDeck() {
        when(idService.createId()).thenReturn("12345");

        profileService.addDeck(exampleDeckWithoutId);

        verify(deckRepo).save(exampleDeck);
    }

    @Test
    void testGetDecks() {
        Deck[] decks = {exampleDeck};

        profileService.addDeck(exampleDeckWithoutId);
        when(deckRepo.findAll()).thenReturn(List.of(decks));
        Deck[] returnedDecks = profileService.getDecks();

        assertNotNull(returnedDecks);
        assertThat(returnedDecks).contains(exampleDeck).isInstanceOf(Deck[].class);
    }

    @Test
    void testUpdateDeck() {
        Deck exampleDeck = new Deck("12345","New Deck", cards);
        when(deckRepo.findById("12345")).thenReturn(java.util.Optional.of(exampleDeck));
        profileService.updateDeck("12345", exampleDeckWithoutId);

        verify(deckRepo).save(exampleDeck);
    }

    @Test
    void testDeleteDeck() {
        profileService.deleteDeck("12345");
        verify(deckRepo).deleteById("12345");
    }


}