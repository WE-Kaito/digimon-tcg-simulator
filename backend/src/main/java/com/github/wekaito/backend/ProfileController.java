package com.github.wekaito.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RequestMapping("/api/profile")
@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/cards")
    public Card[] fetchCards(@RequestParam Optional<String> name, @RequestParam Optional<String> color, @RequestParam Optional<String> type) {
        return this.profileService.fetchCards(name, color, type);
    }

    @PostMapping("/decks")
    public void addDeck(@RequestBody DeckWithoutId deckWithoutId) {
        this.profileService.addDeck(deckWithoutId);
    }

    @GetMapping("/decks")
    public Deck[] getDecks() {
        return this.profileService.getDecks();
    }

    @PutMapping("/decks/{id}")
    public void updateDeck(@PathVariable String id, @RequestBody DeckWithoutId deckWithoutId) {
        this.profileService.updateDeck(id, deckWithoutId);
    }
}
