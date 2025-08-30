package com.github.wekaito.backend.websocket.lobby;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.CardService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.game.GameService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.annotation.PostConstruct;

@Getter
@Service
@RequiredArgsConstructor
public class LobbyService extends TextWebSocketHandler {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ConcurrentHashMap<WebSocketSession, Long> lastHeartbeatTimestamps = new ConcurrentHashMap<>();

    private final QuickPlayQueue quickPlayQueue = new QuickPlayQueue();

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> globalActiveSessions = ConcurrentHashMap.newKeySet();
    private final Set<Room> rooms = ConcurrentHashMap.newKeySet();

    private final Map<String, Long> emptyRoomTimestamps = new ConcurrentHashMap<>();
    private final Map<String, String> lastPlayerRooms = new ConcurrentHashMap<>(); // username -> roomId

    private final Object quickPlayLock = new Object();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    // Add usernames here that should be filtered from lobby operations
    private static final List<String> FILTERED_USERNAMES = List.of("Altsaber", "Domo", "maxbugs", "JeanArc31", "Relancer", "Humungosaurio2");

    @Autowired
    private GameService gameService;

    @PostConstruct
    public void setupQuickPlayQueue() {
        quickPlayQueue.setFilteredUsernamesSupplier(() -> FILTERED_USERNAMES);
        quickPlayQueue.setBlockedAccountsSupplier(mongoUserDetailsService::getBlockedAccounts);
    }

    private void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if (session == null || !session.isOpen()) return;
        session.sendMessage(new TextMessage(message));
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.isEmpty() || deckService.getDeckById(activeDeck) == null) {
            sendTextMessage(session, "[NO_ACTIVE_DECK]");
            return;
        }

        List<Card> deckCards = deckService.getDeckCardsById(activeDeck);
        if (deckCards.stream().anyMatch(c -> "1110101".equals(c.cardNumber()))) {
            sendTextMessage(session, "[BROKEN_DECK]");
            return;
        }

        globalActiveSessions.removeIf(s -> Objects.equals(Objects.requireNonNull(s.getPrincipal()).getName(), username));
        globalActiveSessions.add(session);

        if (tryReconnectToRoom(session)) return; // Try to reconnect first

        List<String> userBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(username);
        
        List<Room> openRooms = rooms.stream()
                .filter(r -> r.getPlayers().size() == 1)
                .filter(r -> !FILTERED_USERNAMES.contains(r.getHostName())) // Filter out rooms created by filtered users
                .filter(r -> !userBlockedAccounts.contains(r.getHostName())) // Filter out rooms created by blocked users
                .toList();
        List<RoomDTO> openRoomsDTO = openRooms.stream().map(this::getRoomDTO).toList();

        sendTextMessage(session, "[ROOMS]:" + objectMapper.writeValueAsString(openRoomsDTO));
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Join our Discord!");
        sendTextMessage(session, "[USER_COUNT]:" + getTotalSessionCount());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        synchronized (rooms) {
            Room playerRoom = rooms.stream()
                    .filter(room -> room.getPlayers().stream().anyMatch(p -> p.getName().equals(username)))
                    .findFirst()
                    .orElse(null);

            if (playerRoom != null) {
                // Store which room the player was in for potential reconnect
                lastPlayerRooms.put(username, playerRoom.getId());

                playerRoom.getPlayers().removeIf(player -> player.getName().equals(username));
                sendRoomUpdate(playerRoom);

                if (playerRoom.getPlayers().isEmpty()) {
                    // Mark room as empty with timestamp instead of removing immediately
                    emptyRoomTimestamps.put(playerRoom.getId(), System.currentTimeMillis());
                }
            }
        }

        synchronized (quickPlayQueue) {
            quickPlayQueue.remove(session);
        }

        synchronized (globalActiveSessions) {
            globalActiveSessions.remove(session);
        }
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();

        if (payload.equals("/heartbeat/")) {
            lastHeartbeatTimestamps.put(session, System.currentTimeMillis());
            return;
        }

        if (payload.startsWith("/createRoom:")) createRoom(session, payload);

        if (payload.startsWith("/joinRoom:")) handleJoinRoomAttempt(session, payload.split(":")[1]);

        if (payload.startsWith("/password:")) handlePasswordAttempt(session, payload);

        if (payload.startsWith("/leave:")) leaveRoom(session, payload);

        if (payload.startsWith("/kick:")) kickPlayer(session, payload);

        if (payload.startsWith("/toggleReady:")) toggleReady(session, payload.split(":")[1]);

        if (payload.startsWith("/quickPlay")) quickPlayQueue.add(session); // manage representation in Frontend

        if (payload.startsWith("/cancelQuickPlay")) quickPlayQueue.remove(session); // manage representation in Frontend

        if (payload.startsWith("/startGame:")) startGame(payload);

        if (payload.startsWith("/chatMessage:")) handleChatMessage(session, payload);

        if (payload.startsWith("/roomChatMessage:")) handleRoomChatMessage(session, payload);
    }

    private boolean tryReconnectToRoom(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        // Check if player was previously in a room using lastPlayerRooms map
        String previousRoomId = lastPlayerRooms.get(username);
        if (previousRoomId != null) {
            Room previousRoom = getRoomById(previousRoomId);
            if (previousRoom != null) {
                // Cancel room deletion if it was marked as empty
                emptyRoomTimestamps.remove(previousRoomId);

                // Re-add player to the room
                boolean wasHost = previousRoom.getHostName().equals(username);
                LobbyPlayer player = new LobbyPlayer(session, username, wasHost);

                // Remove any existing entries for this player first
                previousRoom.getPlayers().removeIf(p -> p.getName().equals(username));
                previousRoom.getPlayers().add(player);

                // Send room information to player
                String roomJson = objectMapper.writeValueAsString(getRoomDTO(previousRoom));
                sendTextMessage(session, "[JOIN_ROOM]:" + roomJson);
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Reconnected to your previous room.");

                // Update room for all players
                sendRoomUpdate(previousRoom);
                return true; // Reconnection successful
            } else {
                // Room no longer exists, remove the mapping
                lastPlayerRooms.remove(username);
            }
        }
        return false; // No reconnection happened
    }

    private void startGame(String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        String roomId = parts[1];
        String gameId = parts[2];

        Room room = getRoomById(roomId);
        if (room == null) return;

        for (LobbyPlayer player : room.getPlayers()) {
            sendTextMessage(player.getSession(), "[START_GAME]:" + gameId);
        }
    }

    @Scheduled(fixedRate = 3000) // 3 seconds
    private void heartbeat() throws IOException {
        broadcastUserCount();
        checkForRejoinableGameRoom();
        broadcastRooms();
    }

    @Scheduled(fixedRate = 30000) // 30 seconds
    private void assignQuickPlay() throws IOException {
        startGameQuickPlay();
    }

    @Scheduled(fixedRate = 10000) // 10 seconds
    private void cleanUpEmptyRooms() throws IOException {
        long currentTime = System.currentTimeMillis();
        List<String> roomsToRemove = new ArrayList<>();

        synchronized (emptyRoomTimestamps) {
            for (Map.Entry<String, Long> entry : emptyRoomTimestamps.entrySet()) {
                if (currentTime - entry.getValue() > 30000) { // 30 seconds
                    roomsToRemove.add(entry.getKey());
                }
            }

            for (String roomId : roomsToRemove) {
                emptyRoomTimestamps.remove(roomId);
                rooms.removeIf(room -> room.getId().equals(roomId));
            }
        }

        broadcastRooms();
    }

    private void createRoom(WebSocketSession session, String payload) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        leaveAllRoomsQuietly(username);

        String[] parts = payload.split(":", 4);

        String roomName = parts[1];
        String roomPassword = parts[2];
        Format roomFormat = Format.valueOf(parts[3]);

        Room room = new Room(
                UUID.randomUUID().toString(),
                roomName,
                username,
                roomFormat,
                roomPassword,
                new ArrayList<>());

        synchronized (rooms) {
            rooms.add(room);
        }

        joinRoom(session, room.getId(), true);
        broadcastRooms();
    }

    private void leaveAllRoomsQuietly(String username) throws IOException {
        List<Room> roomsWithPlayer = new ArrayList<>();

        synchronized (rooms) {
            for (Room r : rooms) {
                if (r.getPlayers().stream().anyMatch(p -> p.getName().equals(username))) {
                    roomsWithPlayer.add(r);
                }
            }

            for (Room room : roomsWithPlayer) {
                room.getPlayers().removeIf(p -> p.getName().equals(username));

                // change host, if needed
                if (room.getHostName().equals(username) && !room.getPlayers().isEmpty()) {
                    LobbyPlayer remainingPlayer = room.getPlayers().get(0);
                    room.setHostName(remainingPlayer.getName());
                    remainingPlayer.setReady(true);
                }

                if (room.getPlayers().isEmpty()) emptyRoomTimestamps.put(room.getId(), System.currentTimeMillis());
                else sendRoomUpdate(room);
            }
        }

        lastPlayerRooms.remove(username);
    }

    private void broadcastRooms() throws IOException {
        List<Room> roomsWithOnlyHosts;
        synchronized (rooms) {
            roomsWithOnlyHosts = rooms.stream()
                    .filter(r -> r.getPlayers().size() == 1)
                    .filter(r -> !FILTERED_USERNAMES.contains(r.getHostName()))
                    .toList();
        }

        for (WebSocketSession session : globalActiveSessions) {
            String sessionUsername = Objects.requireNonNull(session.getPrincipal()).getName();
            List<String> sessionUserBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(sessionUsername);
            
            // Filter rooms based on current user's blocked accounts
            List<RoomDTO> filteredRoomDTOs = roomsWithOnlyHosts.stream()
                    .filter(r -> !sessionUserBlockedAccounts.contains(r.getHostName()))
                    .map(this::getRoomDTO)
                    .toList();
            
            String personalizedRoomsJson = objectMapper.writeValueAsString(filteredRoomDTOs);
            String personalizedMessage = "[ROOMS]:" + personalizedRoomsJson;
            
            sendTextMessage(session, personalizedMessage);
        }
    }

    private void broadcastUserCount() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            sendTextMessage(session, "[USER_COUNT]:" + getTotalSessionCount());
            sendTextMessage(session, "[USER_COUNT_QUICK_PLAY]:" + quickPlayQueue.size());
        }
    }

    private void startGameQuickPlay() throws IOException {
        List<WebSocketSession> players;

        synchronized (quickPlayLock) {
            players = quickPlayQueue.drawRandomPair();
        }

        if (players == null || players.size() < 2) return;

        WebSocketSession player1 = players.get(0);
        WebSocketSession player2 = players.get(1);

        String newGameId = Objects.requireNonNull(player1.getPrincipal()).getName()
                + "‗"
                + Objects.requireNonNull(player2.getPrincipal()).getName();

        synchronized (globalActiveSessions) {
            globalActiveSessions.remove(player1);
            globalActiveSessions.remove(player2);
        }

        sendTextMessage(player1, "[START_GAME]:" + newGameId);
        sendTextMessage(player2, "[START_GAME]:" + newGameId);
    }

    private void checkForRejoinableGameRoom() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            String matchingRoomId = gameService.gameRooms.keySet().stream()
                    .filter(roomId -> roomId.contains(Objects.requireNonNull(session.getPrincipal()).getName()))
                    .findFirst().orElse(null);
            if (matchingRoomId != null) sendTextMessage(session, "[RECONNECT_ENABLED]:" + matchingRoomId);
            else sendTextMessage(session, "[RECONNECT_DISABLED]");
        }
    }

    private int getTotalSessionCount() {
        int inGameSessionCount = gameService.gameRooms.values().stream().mapToInt(Set::size).sum();
        return globalActiveSessions.size() + inGameSessionCount;
    }

    private RoomDTO getRoomDTO(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getName(),
                room.getHostName(),
                room.getFormat(),
                !room.getPassword().isEmpty(),
                room.getPlayers().stream().map(p -> new LobbyPlayerDTO(
                        p.getName(),
                        mongoUserDetailsService.getAvatar(p.getName()),
                        p.isReady()))
                        .toList());
    }

    private void sendRoomUpdate(Room room, boolean playerJoined) throws IOException {
        String roomJson = objectMapper.writeValueAsString(getRoomDTO(room));
        for (LobbyPlayer p : room.getPlayers()) {
            sendTextMessage(p.getSession(), "[ROOM_UPDATE]:" + roomJson);
            if (playerJoined) sendTextMessage(p.getSession(), "[PLAYER_JOINED]");
        }
    }

    private void sendRoomUpdate(Room room) throws IOException {
        sendRoomUpdate(room, false);
    }

    private void joinRoom(WebSocketSession session, String roomId, boolean host) throws IOException {
        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }
        
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String hostUsername = room.getHostName();

        // Check blocking OUTSIDE synchronized block to avoid deadlock
        if (!host && !hostUsername.equals(username)) {
            List<String> hostBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(hostUsername);
            if (hostBlockedAccounts.contains(username)) {
                sendTextMessage(session, "[SUCCESS]");
                return;
            }
        }
        
        synchronized (room) {
            if (room.getPlayers().size() >= 3) {
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room is full.");
                return;
            }
            if (room.getPlayers().isEmpty() && !host) {
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room no longer exists.");
                return;
            }

            LobbyPlayer player = new LobbyPlayer(session, username, host);
            String roomJson = objectMapper.writeValueAsString(getRoomDTO(room));

            sendTextMessage(session, "[JOIN_ROOM]:" + roomJson);
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have joined the room " + room.getName() + ".");
            room.getPlayers().add(player);
        }

            sendRoomUpdate(room, true);

            broadcastRooms();
    }

    private void handleJoinRoomAttempt(WebSocketSession session, String roomId) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        
        // Filtered users get success message but can't join rooms
        if (FILTERED_USERNAMES.contains(username)) {
            sendTextMessage(session, "[SUCCESS]");
            return;
        }
        
        Room targetRoom = getRoomById(roomId);
        if (targetRoom == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }
        
        String hostUsername = targetRoom.getHostName();
        List<String> hostBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(hostUsername);
        
        // Check if host has blocked the joining user
        if (hostBlockedAccounts.contains(username)) {
            sendTextMessage(session, "[SUCCESS]");
            return;
        }
        
        String password = targetRoom.getPassword();
        if (password != null && !password.isEmpty()) sendTextMessage(session, "[PROMPT_PASSWORD]");
        else joinRoom(session, roomId, false);
    }

    private void handlePasswordAttempt(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String passwordInput = parts[2];
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        if (FILTERED_USERNAMES.contains(username)) {
            sendTextMessage(session, "[SUCCESS]");
            return;
        }

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[SUCCESS]");
            return;
        }
        
        String password = room.getPassword();
        if (password == null || password.isEmpty()) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: This room does not require a password.");
            return;
        }

        if (password.equals(passwordInput)) joinRoom(session, roomId, false);
        else sendTextMessage(session, "[WRONG_PASSWORD]");
    }

    private void leaveRoom(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String userName = parts[2];
        String shouldCleanLastRoom = parts[3];

        if (shouldCleanLastRoom.equals("false")) return;

        lastPlayerRooms.remove(userName);

        Room room = getRoomById(roomId);
        if( room == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }

        synchronized (room) {
            room.getPlayers().removeIf(p -> p.getName().equals(userName));
            if(room.getHostName().equals(userName) && !room.getPlayers().isEmpty()) {
                LobbyPlayer remainingPlayer = room.getPlayers().get(0);
                room.setHostName(remainingPlayer.getName());
                remainingPlayer.setReady(true);
            }

            if (shouldCleanLastRoom.equals("true")) {
                lastPlayerRooms.remove(userName);
            }

            if (room.getPlayers().isEmpty()) {
                emptyRoomTimestamps.put(room.getId(), System.currentTimeMillis());
            } else {
                sendRoomUpdate(room);
            }
        }

        if (room.getPlayers().isEmpty()) rooms.remove(room);
        else sendRoomUpdate(room);

        sendTextMessage(session, "[LEAVE_ROOM]");
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have left the room " + room.getName() + ".");

        broadcastRooms();
    }

    private void toggleReady(WebSocketSession session, String roomId) throws IOException {
        Room room = getRoomById(roomId);

        synchronized (room) {
            LobbyPlayer player = room.getPlayers().stream()
                    .filter(p -> p.getSession().equals(session))
                    .findFirst().orElse(null);

            if(player == null) {
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You are not in this room.");
                sendTextMessage(session, "[SUCCESS]");
                return;
            }

            player.ready = !player.isReady();
        }

        sendRoomUpdate(room);
        sendTextMessage(session, "[SUCCESS]");
    }

    private void kickPlayer(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String userName = parts[2];

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            sendTextMessage(session, "[SUCCESS]");
            return;
        }

        LobbyPlayer player;
        synchronized (room) {
            player = room.getPlayers().stream().filter(p -> p.getName().equals(userName)).findFirst().orElse(null);

            if (player == null) {
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Player not found in the room.");
                sendTextMessage(session, "[SUCCESS]");
                return;
            }

            room.getPlayers().remove(player);
            lastPlayerRooms.remove(userName);
        }

        sendRoomUpdate(room);

        sendTextMessage(player.getSession(), "[KICKED]");
        sendTextMessage(player.getSession(), "[CHAT_MESSAGE]:【SERVER】: You have been kicked from the room " + room.getName() + ".");

        sendTextMessage(session, "[SUCCESS]");
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have kicked " + userName + ".");

        broadcastRooms();
    }

    private void handleChatMessage(WebSocketSession session, String payload) throws IOException {
        if (payload.substring("/chatMessage:".length()).trim().isEmpty()) return;

        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String message = "[CHAT_MESSAGE]:" + username + ": " + payload.substring("/chatMessage:".length());

        for (WebSocketSession webSocketSession : globalActiveSessions) {
            sendTextMessage(webSocketSession, message);
        }
    }

    private void handleRoomChatMessage(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        String chatMessage = parts[1];
        String roomId = parts[2];
        String userName = Objects.requireNonNull(session.getPrincipal()).getName();

        Room room = getRoomById(roomId);
        if (room == null) return;

        for (LobbyPlayer player : room.getPlayers()) {
            sendTextMessage(player.getSession(), "[CHAT_MESSAGE_ROOM]:" + userName + ": " + chatMessage);
        }
    }

    private Room getRoomById(String roomId) {
        synchronized (rooms) {
            return rooms.stream().filter(r -> r.getId().equals(roomId)).findFirst().orElse(null);
        }
    }
}
