package com.github.wekaito.backend.security;

import com.github.wekaito.backend.StarterDeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import jakarta.annotation.PostConstruct;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MongoUserDetailsService implements UserDetailsService {

    private final MongoUserRepository mongoUserRepository;
    private final MongoTemplate mongoTemplate;
    private final StarterDeckService starterDeckService;

    private static final String[] badWords = {"abuse", "analsex", "ballsack", "bastard", "bestiality", "biatch", "bitch", "blowjob", "fuck", "fuuck", "rape", "whore", "nigger", "nazi", "jews"};

    private static final List<String> BANNED_USERNAMES = List.of("Altsaber", "Domo", "maxbugs", "JeanArc31", "Relancer", "Humungosaurio2", "season1yugioh");
    private static final List<String> ADMIN_USERS = List.of("Kaito", "StargazerVinny", "GhostTurt", "EfzPlayer", "Hercole", "lar_ott", "Lar_ott");

    String exceptionMessage = " not found";
    
    @PostConstruct
    public void migrateUsersToRoleSchema() {
        try {
            // Try to use repository first
            List<MongoUser> allUsers = mongoUserRepository.findAll();
            
            for (MongoUser user : allUsers) {
                if (user.role() == null) {
                    Role role = Role.ROLE_USER;
                    if (BANNED_USERNAMES.contains(user.username())) role = Role.ROLE_BANNED;
                    if (ADMIN_USERS.contains(user.username())) role = Role.ROLE_ADMIN;

                    MongoUser updatedUser = new MongoUser(
                            user.id(),
                            user.username(),
                            user.password(),
                            user.question(),
                            user.answer(),
                            user.activeDeckId(),
                            user.avatarName(),
                            user.blockedAccounts(),
                            role
                    );
                    mongoUserRepository.save(updatedUser);
                }
            }
        } catch (Exception e) {
            // If repository fails due to schema mismatch, use raw MongoDB update
            try {
                Query query = new Query(Criteria.where("role").exists(false));
                Update update = new Update().set("role", Role.ROLE_USER.name());
                mongoTemplate.updateMulti(query, update, "users");
                System.out.println("Successfully migrated users to role schema using MongoTemplate");
            } catch (Exception mongoError) {
                System.err.println("User migration failed completely: " + mongoError.getMessage());
            }
        }
    }

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
        
        if (mongoUser.role() == Role.ROLE_BANNED) {
            throw new UserBannedException("Your account has been suspended.");
        }
        
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(mongoUser.role().name()));
        
        return new User(mongoUser.username(), mongoUser.password(), authorities);
    }

    public String registerNewUser(RegistrationUser registrationUser){
        if (mongoUserRepository.findByUsername(registrationUser.username()).isPresent()) {
            return "Username already exists!";
        }

        for (String badWord : badWords) {
            if (registrationUser.username().toLowerCase().contains(badWord)) {
                return "Invalid username!";
            }
        }

        MongoUser newUser = new MongoUser(
                UUID.randomUUID().toString(),
                registrationUser.username(),
                getEncodedPassword(registrationUser.password()),
                registrationUser.question(),
                registrationUser.answer(),
                UUID.randomUUID().toString(),
                "AncientIrismon",
                Collections.emptyList(),
                Role.ROLE_USER
        );

        starterDeckService.createStarterDecksForUser(newUser.id(), newUser.activeDeckId());

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
                mongoUser.avatarName(),
                mongoUser.blockedAccounts(),
                mongoUser.role()
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
                avatarName,
                mongoUser.blockedAccounts(),
                mongoUser.role()
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

    public void changePassword(String newPassword) {
        MongoUser mongoUser = getCurrentUser();
        MongoUser updatedUser = new MongoUser(
                mongoUser.id(),
                mongoUser.username(),
                getEncodedPassword(newPassword),
                mongoUser.question(),
                mongoUser.answer(),
                mongoUser.activeDeckId(),
                mongoUser.avatarName(),
                mongoUser.blockedAccounts(),
                mongoUser.role()
        );
        mongoUserRepository.save(updatedUser);
    }

    public String changePasswordWithSafetyAnswer(PasswordRecovery passwordRecovery) {
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
                    mongoUser.avatarName(),
                    mongoUser.blockedAccounts(),
                    mongoUser.role()
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
                    mongoUser.avatarName(),
                    mongoUser.blockedAccounts(),
                    mongoUser.role()
            );
            mongoUserRepository.save(updatedUser);
            return "Safety question changed!";

    }

    public void setBlockedAccounts(List<String> blockedAccounts) {
        MongoUser mongoUser = getCurrentUser();
        MongoUser updatedUser = new MongoUser(
                mongoUser.id(),
                mongoUser.username(),
                mongoUser.password(),
                mongoUser.question(),
                mongoUser.answer(),
                mongoUser.activeDeckId(),
                mongoUser.avatarName(),
                blockedAccounts,
                mongoUser.role()
        );
        mongoUserRepository.save(updatedUser);
    }

    public List<String> getBlockedAccounts(String username) {
        MongoUser user = getUserByUsername(username);
        List<String> blockedAccounts = user.blockedAccounts();
        return blockedAccounts != null ? blockedAccounts : Collections.emptyList();
    }

    public boolean checkBlockedByWebSocketSessions(WebSocketSession player1, WebSocketSession player2) {
        String player1Username = (player1 != null && player1.getPrincipal() != null)
                ? player1.getPrincipal().getName()
                : null;
        String player2Username = (player2 != null && player2.getPrincipal() != null)
                ? player2.getPrincipal().getName()
                : null;

        if (player1Username == null || player2Username == null) {
            return false;
        }

        MongoUser user1 = getUserByUsername(player1Username);
        MongoUser user2 = getUserByUsername(player2Username);

        List<String> user1BlockedAccounts = user1.blockedAccounts() != null ? user1.blockedAccounts() : Collections.emptyList();
        List<String> user2BlockedAccounts = user2.blockedAccounts() != null ? user2.blockedAccounts() : Collections.emptyList();

        return user1BlockedAccounts.contains(player2Username) || user2BlockedAccounts.contains(player1Username);
    }
    
    public boolean userExists(String username) {
        return mongoUserRepository.findByUsername(username).isPresent();
    }
    
    public void addBlockedAccount(String currentUsername, String usernameToBlock) {
        MongoUser mongoUser = getUserByUsername(currentUsername);
        List<String> blockedAccounts = new ArrayList<>(mongoUser.blockedAccounts() != null ? mongoUser.blockedAccounts() : Collections.emptyList());
        if (!blockedAccounts.contains(usernameToBlock)) {
            blockedAccounts.add(usernameToBlock);
            setBlockedAccounts(blockedAccounts);
        }
    }
    
    public boolean removeBlockedAccount(String currentUsername, String usernameToUnblock) {
        MongoUser mongoUser = getUserByUsername(currentUsername);
        List<String> blockedAccounts = new ArrayList<>(mongoUser.blockedAccounts() != null ? mongoUser.blockedAccounts() : Collections.emptyList());
        boolean removed = blockedAccounts.remove(usernameToUnblock);
        if (removed) {
            setBlockedAccounts(blockedAccounts);
        }
        return removed;
    }
    
    public boolean isAdmin() {
        return getCurrentUser().role() == Role.ROLE_ADMIN;
    }
    
    public boolean isBanned() {
        return getCurrentUser().role() == Role.ROLE_BANNED;
    }
    
    public void setUserRole(String username, Role role) {
        MongoUser mongoUser = getUserByUsername(username);
        MongoUser updatedUser = new MongoUser(
                mongoUser.id(),
                mongoUser.username(),
                mongoUser.password(),
                mongoUser.question(),
                mongoUser.answer(),
                mongoUser.activeDeckId(),
                mongoUser.avatarName(),
                mongoUser.blockedAccounts(),
                role
        );
        mongoUserRepository.save(updatedUser);
    }
}
