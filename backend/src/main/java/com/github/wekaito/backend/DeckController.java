package com.github.wekaito.backend;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/profile")
@RestController
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;
    private final CardService cardService;
    private final UserIdService userIdService;

    @GetMapping("/cards")
    public List<Card> getCards() {
        return this.cardService.getCards();
    }

    @PostMapping("/decks")
    public String addDeck(@RequestBody @Valid DeckWithoutId deckWithoutId) {
        if (deckWithoutId.color().equals("undefined") || deckWithoutId.decklist().get(0) == null) {
            return "There was an error while saving the deck.";
        }
        this.deckService.addDeck(deckWithoutId);
        return "Deck saved successfully.";
    }

    @GetMapping("/decks")
    public List<Deck> getDecks() {
        return this.deckService.getDecksByAuthorId(userIdService.getCurrentUserId());
    }

    @GetMapping("/decks/{id}")
    public Deck getDeckById(@PathVariable String id) {
        return this.deckService.getDeckById(id);
    }

    @PutMapping("/decks/{id}")
    public void updateDeck(@PathVariable String id, @RequestBody @Valid DeckWithoutId deckWithoutId) {
        this.deckService.updateDeck(id, deckWithoutId);
    }

    @DeleteMapping("/decks/{id}")
    public void deleteDeck(@PathVariable String id) {
        this.deckService.deleteDeck(id);
    }
}
