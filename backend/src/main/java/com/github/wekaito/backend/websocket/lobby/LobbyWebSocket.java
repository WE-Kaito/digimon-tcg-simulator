package com.github.wekaito.backend.websocket.lobby;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.CardService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
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
import java.util.concurrent.ConcurrentLinkedQueue;

@Getter
@Service
@RequiredArgsConstructor
public class LobbyWebSocket extends TextWebSocketHandler {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ConcurrentHashMap<WebSocketSession, Long> lastHeartbeatTimestamps = new ConcurrentHashMap<>();

    private final Set<WebSocketSession> quickPlayQueue = ConcurrentHashMap.newKeySet();

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> globalActiveSessions = ConcurrentHashMap.newKeySet();
    private final Set<Room> rooms = ConcurrentHashMap.newKeySet();

    private final Map<String, Long> emptyRoomTimestamps = new ConcurrentHashMap<>();
    private final Map<String, String> lastPlayerRooms = new ConcurrentHashMap<>(); // username -> roomId

    private final Object quickPlayLock = new Object();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    public final LinkedList<String> globalChatMessages = new LinkedList<>(List.of("【SERVER】: Join our Discord!"));

    @Autowired
    private GameWebSocket gameWebSocket;

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
        if (tryReconnectToRoom(session)) return; // Try to reconnect first

        List<String> userBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(username);

        List<Room> openRooms = rooms.stream()
                .filter(r -> r.getPlayers().size() == 1)
                .filter(r -> !userBlockedAccounts.contains(r.getHostName())) // Filter out rooms created by blocked users
                .toList();
        List<RoomDTO> openRoomsDTO = openRooms.stream().map(this::getRoomDTO).toList();

        sendTextMessage(session, "[ROOMS]:" + objectMapper.writeValueAsString(openRoomsDTO));
        sendTextMessage(session, "[GLOBAL_CHAT]:" + objectMapper.writeValueAsString(globalChatMessages));
        sendTextMessage(session, "[USER_COUNT]:" + getTotalSessionCount());

        globalActiveSessions.add(session);
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
            sendTextMessage(player.getSession(), "[COMPUTE_GAME]:" + gameId);
        }
    }

    @Scheduled(fixedRate = 3000) // 3 seconds
    private void heartbeat() throws IOException {
        broadcastUserCount();
        checkForRejoinableGameRoom();
        broadcastRooms();
    }

    @Scheduled(fixedRate = 30000) // 30 seconds
    private void assignQuickPlay() {
        List<WebSocketSession> players = new ArrayList<>(quickPlayQueue);

        if (players.size() < 2) return; // Not enough players to form a match

        if (players.size() % 2 != 0) players.remove(players.size() - 1); // Make even number of players

        Collections.shuffle(players);

        Queue<WebSocketSession> shuffledPlayers = new ConcurrentLinkedQueue<>(players); // Better semantics for polling

        List <List<WebSocketSession>> matchedPairs = new ArrayList<>();

        WebSocketSession player1 = shuffledPlayers.poll();
        WebSocketSession player2 = shuffledPlayers.poll();
        int attempts = 0;

        while (player1 != null && player2 != null) {
            if (mongoUserDetailsService.checkBlockedByWebSocketSessions(player1, player2)) {
                shuffledPlayers.offer(player2);
                player2 = shuffledPlayers.poll();
                if (attempts >= shuffledPlayers.size()) {
                    // No valid match found for player1, will be ignored this round
                    player1 = shuffledPlayers.poll();
                    attempts = 0;
                } else attempts++;
            } else {
                matchedPairs.add(Arrays.asList(player1, player2));
                player1 = shuffledPlayers.poll();
                player2 = shuffledPlayers.poll();
            }
        }

        for (List<WebSocketSession> pair : matchedPairs) {
            WebSocketSession p1 = pair.get(0);
            WebSocketSession p2 = pair.get(1);

            String username1 = (p1 != null && p1.getPrincipal() != null)
                    ? p1.getPrincipal().getName()
                    : null;
            String username2 = (p2 != null && p2.getPrincipal() != null)
                    ? p2.getPrincipal().getName()
                    : null;

            if (username1 == null || username2 == null) {
                continue; // Skip if usernames are missing
            }

            String newGameId = username1 + "‗" + username2;

            quickPlayQueue.remove(p1);
            quickPlayQueue.remove(p2);

            globalActiveSessions.remove(p1);
            globalActiveSessions.remove(p2);

            try {
                if (p1.isOpen()) sendTextMessage(p1, "[COMPUTE_GAME]:" + newGameId);
            } catch (IOException e) {
                System.err.println("Failed to send message to player1: " + e.getMessage());
            }

            try {
                if (p2.isOpen()) sendTextMessage(p2, "[COMPUTE_GAME]:" + newGameId);
            } catch (IOException e) {
                System.err.println("Failed to send message to player2: " + e.getMessage());
            }
        }
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

    private void checkForRejoinableGameRoom() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            Optional<GameRoom> room = gameWebSocket.findGameRoomBySession(session);
            if (room.isPresent()) sendTextMessage(session, "[RECONNECT_ENABLED]:" + room.get().getRoomId());
            else sendTextMessage(session, "[RECONNECT_DISABLED]");
        }
    }

    private int getTotalSessionCount() {
        int inGameSessionCount = gameWebSocket.gameRooms.size() * 2;
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

        LobbyPlayer player = room.getPlayers().stream()
                .filter(p -> p.getSession().equals(session))
                .findFirst().orElse(null);

        if(player == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You are not in this room.");
            sendTextMessage(session, "[SUCCESS]");
            return;
        }

        player.ready = !player.isReady();

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

        String message = username + ": " + payload.substring("/chatMessage:".length());

        globalChatMessages.add(message);

        if (globalChatMessages.size() > 500) globalChatMessages.removeFirst();

        for (WebSocketSession webSocketSession : globalActiveSessions) {
            sendTextMessage(webSocketSession, "[CHAT_MESSAGE]:" + message);
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
        return rooms.stream().filter(r -> r.getId().equals(roomId)).findFirst().orElse(null);
    }
    
    public void broadcastServerMessage(String message) throws IOException {
        String formattedMessage = "【SERVER】: " + message;

        globalChatMessages.add(formattedMessage);
        
        if (globalChatMessages.size() > 500) globalChatMessages.removeFirst();
        
        for (WebSocketSession session : globalActiveSessions) {
            sendTextMessage(session, "[CHAT_MESSAGE]:" + formattedMessage);
        }
    }
}
