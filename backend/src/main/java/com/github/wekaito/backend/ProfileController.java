package com.github.wekaito.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/api/profile")
@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/cards")
    public Card[] getCards() {
        return this.profileService.fetchCards();
    }
}
