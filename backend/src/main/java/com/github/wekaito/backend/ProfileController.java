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
    public Card[] getCards(@RequestParam Optional<String> name, @RequestParam Optional<String> color, @RequestParam Optional<String> type) {
        return this.profileService.fetchCards(name, color, type);
    }

    @PostMapping("/cards")
    public void addDeck(@RequestBody Deck deck) {
        this.profileService.addDeck(deck);
    }

}
