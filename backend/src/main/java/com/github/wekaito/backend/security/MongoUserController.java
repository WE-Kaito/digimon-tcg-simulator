package com.github.wekaito.backend.security;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/user")
public class MongoUserController {

    private final MongoUserDetailsService mongoUserDetailsService;

    @GetMapping("/me")
    public String getUserInfo() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/login")
    public String login() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/logout")
    public void logout() {
        SecurityContextHolder.clearContext();
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegistrationUser registrationUser) {
        return mongoUserDetailsService.registerNewUser(registrationUser);
    }

    @PutMapping("/active-deck/{deckId}")
    public void setActiveDeck(@PathVariable String deckId) {
        mongoUserDetailsService.setActiveDeck(deckId);
    }

    @GetMapping("/active-deck")
    public String getActiveDeck() {
        return mongoUserDetailsService.getActiveDeck();
    }

    @PutMapping("/avatar/{avatarName}")
    public void setAvatar(@PathVariable String avatarName){
        mongoUserDetailsService.setAvatar(avatarName);
    }

    @GetMapping("/avatar")
    public String getAvatar() {
        return mongoUserDetailsService.getAvatar();
    }

    @PutMapping("/sleeve/{sleeveName}")
    public void setSleeve(@PathVariable String sleeveName){
        mongoUserDetailsService.setSleeve(sleeveName);
    }

    @GetMapping("/sleeve")
    public String getSleeve() {
        return mongoUserDetailsService.getSleeve();
    }

    @GetMapping("/recovery/{username}")
    public String getRecoveryQuestion(@PathVariable String username) {
        return mongoUserDetailsService.getRecoveryQuestion(username);
    }

    @PutMapping("/recovery")
    public String changePassword(@RequestBody PasswordChange passwordChange) {
        return mongoUserDetailsService.changePassword(passwordChange);
    }

}
