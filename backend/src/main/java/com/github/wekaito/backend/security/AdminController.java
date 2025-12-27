package com.github.wekaito.backend.security;

import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.lobby.LobbyWebSocket;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MongoUserDetailsService mongoUserDetailsService;
    private final MongoUserRepository mongoUserRepository;
    
    @Autowired
    private LobbyWebSocket lobbyWebSocket;
    
    @Autowired
    private GameWebSocket gameWebSocket;

    @PutMapping("/ban/{username}")
    public ResponseEntity<String> banUser(@PathVariable String username) {
        try {
            if (!mongoUserDetailsService.userExists(username)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Error: User not found");
            }

            mongoUserDetailsService.setUserRole(username, Role.ROLE_BANNED);
            return ResponseEntity
                    .ok("User " + username + " has been banned successfully");

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error banning user: " + e.getMessage());
        }
    }

    @PutMapping("/unban/{username}")
    public String unbanUser(@PathVariable String username) {
        try {
            if (!mongoUserDetailsService.userExists(username)) {
                return "Error: User not found";
            }
            mongoUserDetailsService.setUserRole(username, Role.ROLE_USER);
            return "User " + username + " has been unbanned successfully";
        } catch (Exception e) {
            return "Error unbanning user: " + e.getMessage();
        }
    }

    @PutMapping("/promote/{username}")
    public String promoteUser(@PathVariable String username) {
        try {
            if (!mongoUserDetailsService.userExists(username)) {
                return "Error: User not found";
            }
            mongoUserDetailsService.setUserRole(username, Role.ROLE_ADMIN);
            return "User " + username + " has been promoted to admin successfully";
        } catch (Exception e) {
            return "Error promoting user: " + e.getMessage();
        }
    }

    @PutMapping("/demote/{username}")
    public String demoteUser(@PathVariable String username) {
        try {
            if (!mongoUserDetailsService.userExists(username)) {
                return "Error: User not found";
            }
            mongoUserDetailsService.setUserRole(username, Role.ROLE_USER);
            return "User " + username + " has been demoted from admin successfully";
        } catch (Exception e) {
            return "Error demoting user: " + e.getMessage();
        }
    }

    @GetMapping("/users")
    public List<UserStatusDTO> getAllUsers() {
        return mongoUserRepository.findAll().stream()
                .map(user -> new UserStatusDTO(
                        user.username(),
                        user.role()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/banned")
    public List<String> getBannedUsers() {
        return mongoUserRepository.findAll().stream()
                .filter(user -> user.role() == Role.ROLE_BANNED)
                .map(MongoUser::username)
                .collect(Collectors.toList());
    }

    @GetMapping("/admins")
    public List<String> getAdminUsers() {
        return mongoUserRepository.findAll().stream()
                .filter(user -> user.role() == Role.ROLE_ADMIN)
                .map(MongoUser::username)
                .collect(Collectors.toList());
    }

    @PostMapping("/server-message")
    public ResponseEntity<Void> sendServerMessage(@RequestBody ServerMessageDTO serverMessageDTO) {
        try {
            lobbyWebSocket.broadcastServerMessage(serverMessageDTO.message);
            gameWebSocket.broadcastServerMessageToAllGameRooms(serverMessageDTO.message);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/chat/{messageId}")
    public ResponseEntity<String> deleteMessage(@PathVariable String messageId) {
        try {
            boolean removed = lobbyWebSocket.removeMessageById(messageId);
            if (removed) {
                return ResponseEntity.ok("Message deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting message: " + e.getMessage());
        }
    }

    public record UserStatusDTO(String username, Role role) {}

    public record ServerMessageDTO(String message) {}
}