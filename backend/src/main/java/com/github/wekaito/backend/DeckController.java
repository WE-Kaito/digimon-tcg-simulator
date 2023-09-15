package com.github.wekaito.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RequestMapping("/api/profile")
@RestController
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;
    private final UserIdService userIdService;

    @GetMapping("/cards")
    public Card[] getCards() {
        return this.deckService.getCards();
    }

    @PostMapping("/decks")
    public void addDeck(@RequestBody DeckWithoutId deckWithoutId) {
        this.deckService.addDeck(deckWithoutId);
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
    public void updateDeck(@PathVariable String id, @RequestBody DeckWithoutId deckWithoutId) {
        this.deckService.updateDeck(id, deckWithoutId);
    }

    @DeleteMapping("/decks/{id}")
    public void deleteDeck(@PathVariable String id) {
        this.deckService.deleteDeck(id);
    }
}
