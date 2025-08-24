package com.github.wekaito.backend.security;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/recovery/{username}")
    public String getRecoveryQuestion(@PathVariable String username) {
        return mongoUserDetailsService.getRecoveryQuestion(username);
    }

    @PutMapping("/recovery")
    public String changePassword(@Valid @RequestBody PasswordRecovery passwordRecovery) {
        return mongoUserDetailsService.changePasswordWithSafetyAnswer(passwordRecovery);
    }

    @PutMapping("/change-password")
    public void changePassword(@RequestBody String password) {
        mongoUserDetailsService.changePassword(password);
    }

    @PutMapping("/change-question")
    public String changeQuestion(@Valid @RequestBody SafetyQuestionChange safetyQuestionChange) {
        return mongoUserDetailsService.changeQuestion(safetyQuestionChange);
    }

    @PostMapping("/blocked/{username}")
    public String addBlockedAccount(@PathVariable String username) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            if (mongoUserDetailsService.userExists(username)) {
                mongoUserDetailsService.addBlockedAccount(currentUsername, username);
                return "User blocked successfully";
            } else return "Error: User not found";
        } catch (Exception e) {
            return "Error blocking user: " + e.getMessage();
        }
    }

    @DeleteMapping("/blocked/{username}")
    public String removeBlockedAccount(@PathVariable String username) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            boolean removed = mongoUserDetailsService.removeBlockedAccount(currentUsername, username);
            if (removed) return "User unblocked successfully";
            else return "Error: User was not in blocked list";
        } catch (Exception e) {
            return "Error unblocking user: " + e.getMessage();
        }
    }

    @GetMapping("/blocked")
    public List<String> getBlockedAccounts() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return mongoUserDetailsService.getBlockedAccounts(currentUsername);
    }

}
