package com.github.wekaito.backend.security;

import com.github.wekaito.backend.IdService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class MongoUserDetailsService implements UserDetailsService {

    private final MongoUserRepository mongoUserRepository;

    private final String[] BadWords = {"abuse", "analsex", "ballsack", "bastard", "bestiality", "biatch", "bitch", "blowjob", "boob", "fuck", "fuuck", "rape", "whore"};

    private final IdService idService = new IdService();

    String exceptionMessage = " not found";

    public MongoUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return mongoUserRepository.findByUsername(username).orElseThrow(() ->
                new UsernameNotFoundException("User " + username + exceptionMessage));
    }

    private MongoUser getUserByUsername(String username){
        return mongoUserRepository.findByUsername(username).orElseThrow(() ->
                new UsernameNotFoundException("User " + username + exceptionMessage));
    }

    private String getEncodedPassword(String password) {
        PasswordEncoder encoder = new Argon2PasswordEncoder(16, 32, 8, 1 << 16, 4);
        return encoder.encode(password);
    }

    public String getUserIdByUsername(String username){
        return getUserByUsername(username).id();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MongoUser mongoUser = getUserByUsername(username);
        return new User(mongoUser.username(), mongoUser.password(), Collections.emptyList());
    }

    public String registerNewUser(RegistrationUser registrationUser){
        if (mongoUserRepository.findByUsername(registrationUser.username()).isPresent()) {
            return "Username already exists!";
        }

        for (String badWord : BadWords) {
            if (registrationUser.username().toLowerCase().contains(badWord)) {
                return "Invalid username!";
            }
        }

        MongoUser newUser = new MongoUser(
                idService.createId(),
                registrationUser.username(),
                getEncodedPassword(registrationUser.password()),
                registrationUser.question(),
                registrationUser.answer(),
                "",
                "AncientIrismon"
        );
        mongoUserRepository.save(newUser);

        return "Successfully registered!";
    }

    public void setActiveDeck(String deckId) {
        MongoUser mongoUser = getCurrentUser();
        MongoUser updatedUser = new MongoUser(
                mongoUser.id(),
                mongoUser.username(),
                mongoUser.password(),
                mongoUser.question(),
                mongoUser.answer(),
                deckId,
                mongoUser.avatarName()
        );
        mongoUserRepository.save(updatedUser);
    }

    public String getActiveDeck() { return getCurrentUser().activeDeckId(); }

    public String getActiveDeck(String username) {
        return getUserByUsername(username).activeDeckId();
    }

    public void setAvatar(String avatarName) {
        MongoUser mongoUser = getCurrentUser();
        MongoUser updatedUser = new MongoUser(
                mongoUser.id(),
                mongoUser.username(),
                mongoUser.password(),
                mongoUser.question(),
                mongoUser.answer(),
                mongoUser.activeDeckId(),
                avatarName
        );
        mongoUserRepository.save(updatedUser);
    }

    public String getAvatar() { return getCurrentUser().avatarName(); }

    public String getAvatar(String username) {
        return getUserByUsername(username).avatarName();
    }

    public String getRecoveryQuestion(String username) {
        if (mongoUserRepository.findByUsername(username).isEmpty()) {
            return "User not found!";
        }
        return getUserByUsername(username).question();
    }

    public String changePassword(PasswordRecovery passwordRecovery) {
        MongoUser mongoUser = getUserByUsername(passwordRecovery.username());
        if (!mongoUser.answer().equals(passwordRecovery.answer())) {
            return "Answer didn't match!";
        } else {
            MongoUser updatedUser = new MongoUser(
                    mongoUser.id(),
                    mongoUser.username(),
                    getEncodedPassword(passwordRecovery.newPassword()),
                    mongoUser.question(),
                    mongoUser.answer(),
                    mongoUser.activeDeckId(),
                    mongoUser.avatarName()
            );
            mongoUserRepository.save(updatedUser);
            return "Password changed!";
        }
    }

    public String changeQuestion(SafetyQuestionChange safetyQuestionChange) {
        MongoUser mongoUser = getCurrentUser();
            MongoUser updatedUser = new MongoUser(
                    mongoUser.id(),
                    mongoUser.username(),
                    mongoUser.password(),
                    safetyQuestionChange.question(),
                    safetyQuestionChange.answer(),
                    mongoUser.activeDeckId(),
                    mongoUser.avatarName()
            );
            mongoUserRepository.save(updatedUser);
            return "Safety question changed!";

    }
}
