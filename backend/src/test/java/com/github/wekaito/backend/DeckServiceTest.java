package com.github.wekaito.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.test.annotation.DirtiesContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class DeckServiceTest {

    private DeckService deckService;

    private CardService cardService;
    @Mock
    private DeckRepo deckRepo;
    @Mock
    private CardRepo cardRepo;
    @Mock
    private IdService idService;
    @Mock
    private UserIdService userIdService;

    Card exampleCard = new Card("Agumon", "Digimon", "Red", "https://images.digimoncard.io/images/cards/BT1-010.jpg", "BT1-010", "Rookie", "Vaccine",
                            "Reptile", 2000, 3, 0, 3,
            "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.", null);

    List<String> decklist = List.of("BT1-010", "BT1-010", "BT1-010");
    Deck exampleDeck = new Deck("12345", "New Deck", "Red", decklist, "authorId");
    DeckWithoutId exampleDeckWithoutId = new DeckWithoutId("New Deck", "Red", decklist);
    Deck[] decks = {exampleDeck};

    List<Card> cardCollection = new ArrayList<>();

    @BeforeEach
    void setUp() {
        openMocks(this);
        deckService = new DeckService(deckRepo, cardService, idService, userIdService);
        cardService = new CardService(cardRepo, cardCollection);
        when(cardRepo.findAll()).thenReturn(List.of(exampleCard));
        when(deckRepo.save(exampleDeck)).thenReturn(exampleDeck);
        when(deckRepo.findById(exampleDeck.id())).thenReturn(Optional.of(exampleDeck));
        when(idService.createId()).thenReturn(exampleDeck.id());
        when(userIdService.getCurrentUserId()).thenReturn(exampleDeck.authorId());
        when(deckRepo.existsById(exampleDeck.id())).thenReturn(true);
        when(deckRepo.findByAuthorId("authorId")).thenReturn(List.of(decks));
    }

    @Test
    void testFetchCards() {
        cardService.init();
        List<Card> cards = cardService.getCards();
        assertNotNull(cards);
        assertThat(cards).contains(exampleCard);
    }

    @DirtiesContext
    @Test
    void testAddDeck() {
        deckService.addDeck(exampleDeckWithoutId);
        verify(deckRepo).save(exampleDeck);
    }

    @Test
    void testGetDecks() {
        deckService.addDeck(exampleDeckWithoutId);
        List<Deck> returnedDecks = deckService.getDecksByAuthorId(exampleDeck.authorId());
        assertNotNull(returnedDecks);
        assertThat(returnedDecks).contains(exampleDeck).isInstanceOf(List.class);
    }

    @Test
    void testUpdateDeck() {
        deckService.updateDeck(exampleDeck.id(), exampleDeckWithoutId);
        verify(deckRepo).save(exampleDeck);

        when(deckRepo.existsById(exampleDeck.id())).thenReturn(false);
        String id = exampleDeck.id();
        assertThrows(IllegalArgumentException.class, () -> deckService.updateDeck(id, exampleDeckWithoutId));
    }

    @Test
    void testDeleteDeck() {
        deckService.deleteDeck(exampleDeck.id());
        verify(deckRepo).deleteById(exampleDeck.id());

        when(deckRepo.existsById(exampleDeck.id())).thenReturn(false);
        String id = exampleDeck.id();
        assertThrows(IllegalArgumentException.class, () -> deckService.deleteDeck(id));
    }

    @Test
    void testGetDeckById() {
        deckService.getDeckById(exampleDeck.id());
        verify(deckRepo).findById(exampleDeck.id());

        when(deckRepo.findById(exampleDeck.id())).thenReturn(Optional.empty());
        assertNull(deckService.getDeckById(exampleDeck.id()));
    }

}
