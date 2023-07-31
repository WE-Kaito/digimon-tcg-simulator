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

    @Mock
    private UserIdService userIdService;

    Card exampleCard = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine",
                            "Reptile", 2000, 3, 0, 3,
            "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

    Card[] cards = {exampleCard, exampleCard, exampleCard};
    Deck exampleDeck = new Deck("12345", "New Deck", cards, "authorId");
    DeckWithoutId exampleDeckWithoutId = new DeckWithoutId("New Deck", cards);
    Deck[] decks = {exampleDeck};

    @BeforeEach
    void setUp() {
        openMocks(this);
        profileService = new ProfileService(deckRepo, idService, userIdService);
        when(idService.createId()).thenReturn(exampleDeck.id());
        when(userIdService.getCurrentUserId()).thenReturn(exampleDeck.authorId());
        when(deckRepo.existsById(exampleDeck.id())).thenReturn(true);
        when(deckRepo.findAll()).thenReturn(List.of(decks));
    }

    @Test
    void testFetchCards() {
        Card[] cards = profileService.fetchCards("Agumon".describeConstable(), "Red".describeConstable(), "Digimon".describeConstable());
        assertNotNull(cards);
        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class);
    }

    @DirtiesContext
    @Test
    void testAddDeck() {

        profileService.addDeck(exampleDeckWithoutId);
        verify(deckRepo).save(exampleDeck);
    }

    @Test
    void testGetDecks() {
        profileService.addDeck(exampleDeckWithoutId);
        List<Deck> returnedDecks = profileService.getDecks();
        assertNotNull(returnedDecks);
        assertThat(returnedDecks).contains(exampleDeck).isInstanceOf(List.class);
    }

    @Test
    void testUpdateDeck() {
        profileService.updateDeck(exampleDeck.id(), exampleDeckWithoutId);
        verify(deckRepo).save(exampleDeck);
    }

    @Test
    void testDeleteDeck() {
        profileService.deleteDeck(exampleDeck.id());
        verify(deckRepo).deleteById(exampleDeck.id());
    }


}