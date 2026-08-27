package com.github.wekaito.backend.websocket.lobby;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.ChatMessage;
import com.github.wekaito.backend.CardService;
import com.github.wekaito.backend.DeckService;
import com.github.wekaito.backend.security.MongoUserDetailsService;
import com.github.wekaito.backend.websocket.OnlinePlayerCountChangedEvent;
import com.github.wekaito.backend.websocket.game.GameWebSocket;
import com.github.wekaito.backend.websocket.game.GameLobbyReturnEvent;
import com.github.wekaito.backend.websocket.game.models.GameRoom;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Service
@RequiredArgsConstructor
public class LobbyWebSocket extends TextWebSocketHandler {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ConcurrentHashMap<WebSocketSession, Long> lastHeartbeatTimestamps = new ConcurrentHashMap<>();

    private final Set<WebSocketSession> quickPlayQueue = ConcurrentHashMap.newKeySet();
    private final Map<String, String> lastQuickPlayOpponents = new ConcurrentHashMap<>();

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> globalActiveSessions = ConcurrentHashMap.newKeySet();
    private final Map<WebSocketSession, PlayerStatus> playerStatuses = new ConcurrentHashMap<>();
    private final Set<Room> rooms = ConcurrentHashMap.newKeySet();
    private final Set<PendingGameInvite> pendingGameInvites = ConcurrentHashMap.newKeySet();
    private final Map<PendingGameInvite, Long> gameInviteCooldowns = new ConcurrentHashMap<>();

    private static final long GAME_INVITE_COOLDOWN_MS = 10_000;
    private static final long ABANDONED_ROOM_GRACE_PERIOD_MS = 30_000;

    private final Map<String, Long> emptyRoomTimestamps = new ConcurrentHashMap<>();
    private final Map<WebSocketSession, String> lastPlayerRooms = new ConcurrentHashMap<>(); // username -> roomId
    private final Map<String, String> gameLobbyRoomByUsername = new ConcurrentHashMap<>();
    private final Set<String> roomsWithActiveGames = ConcurrentHashMap.newKeySet();

    private final Object quickPlayLock = new Object();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    public final LinkedList<ChatMessage> globalChatMessages = new LinkedList<>(List.of(new ChatMessage("Join our Discord!", "【SERVER】")));

    private final GameWebSocket gameWebSocket;

    private void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if (session == null || !session.isOpen()) return;
        session.sendMessage(new TextMessage(message));
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        Principal principal = session.getPrincipal();
        if (principal == null) return;

        lastHeartbeatTimestamps.put(session, System.currentTimeMillis());

        String username = principal.getName();
        PlayerStatus initialStatus = getRequestedPlayerStatus(session);

        if (initialStatus != PlayerStatus.LOBBY) {
            registerActiveSession(session, username, initialStatus);
            broadcastUserCount();
            return;
        }

        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.isEmpty() || deckService.getDeckById(activeDeck) == null) {
            sendTextMessage(session, "[NO_ACTIVE_DECK]");
            return;
        }

        // TODO: change this along with limited card check
        List<Card> deckCards = deckService.getMainDeckCardsById(activeDeck);
        if (deckCards.stream().anyMatch(c -> "1110101".equals(c.cardNumber()))) {
            sendTextMessage(session, "[BROKEN_DECK]");
            return;
        }

        synchronized (quickPlayLock) {
            quickPlayQueue.removeIf(queuedSession -> hasUsername(queuedSession, username));
        }
        registerActiveSession(session, username, PlayerStatus.LOBBY);
        broadcastUserCount();
        if (tryReconnectToRoom(session)) {
            sendReconnectStatus(session);
            return;
        }

        List<String> userBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(username);

        List<Room> openRooms = rooms.stream()
                .filter(r -> r.getPlayers().size() == 1)
                .filter(r -> !userBlockedAccounts.contains(r.getHostName())) // Filter out rooms created by blocked users
                .toList();
        List<RoomDTO> openRoomsDTO = openRooms.stream().map(this::getRoomDTO).toList();

        sendTextMessage(session, "[ROOMS]:" + objectMapper.writeValueAsString(openRoomsDTO));
        sendGlobalChatHistory(session);
        synchronized (quickPlayLock) {
            pruneQuickPlayQueue();
            sendTextMessage(session, "[USER_COUNT_QUICK_PLAY]:" + quickPlayQueue.size());
        }
        sendReconnectStatus(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        Principal principal = session.getPrincipal();
        if (principal != null) {
            String username = principal.getName();

            Room playerRoom = rooms.stream()
                    .filter(room -> room.getPlayers().stream().anyMatch(p -> p.getName().equals(username)))
                    .findFirst()
                    .orElse(null);

            if (playerRoom != null) {
                if (roomsWithActiveGames.contains(playerRoom.getId())) {
                    lastHeartbeatTimestamps.remove(session);
                    quickPlayQueue.remove(session);
                    globalActiveSessions.remove(session);
                    return;
                }

                synchronized (playerRoom) {
                    // Store which room the player was in for potential reconnect
                    lastPlayerRooms.put(session, playerRoom.getId());

                    playerRoom.getPlayers().removeIf(player -> player.getName().equals(username));
                    sendRoomUpdate(playerRoom);

                    if (playerRoom.getPlayers().isEmpty()) {
                        // Mark room as empty with timestamp instead of removing immediately
                        emptyRoomTimestamps.put(playerRoom.getId(), System.currentTimeMillis());
                    }
                }
            }
        }

        lastHeartbeatTimestamps.remove(session);
        globalActiveSessions.remove(session);
        playerStatuses.remove(session);

        synchronized (quickPlayLock) {
            if (quickPlayQueue.remove(session)) broadcastQuickPlayCount();
        }
        broadcastRooms();
        broadcastUserCount();
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();

        if (payload.equals("/heartbeat/")) {
            lastHeartbeatTimestamps.put(session, System.currentTimeMillis());
            return;
        }

        if (payload.startsWith("/setPlayerStatus:")) {
            setPlayerStatus(session, payload.substring("/setPlayerStatus:".length()));
            return;
        }

        if (payload.equals("/requestUserCount")) {
            broadcastUserCount();
            return;
        }

        if (payload.startsWith("/createRoom:")) createRoom(session, payload);

        if (payload.startsWith("/joinRoom:")) handleJoinRoomAttempt(session, payload.split(":")[1]);

        if (payload.startsWith("/password:")) handlePasswordAttempt(session, payload);

        if (payload.startsWith("/leave:")) leaveRoom(session, payload);

        if (payload.startsWith("/kick:")) kickPlayer(session, payload);

        if (payload.startsWith("/toggleReady:")) toggleReady(session, payload.split(":")[1]);

        if (payload.equals("/quickPlay")) {
            joinQuickPlayQueue(session);
            return;
        }

        if (payload.equals("/cancelQuickPlay")) {
            cancelQuickPlayQueue(session);
            return;
        }

        if (payload.startsWith("/startGame:")) startGame(session, payload);

        if (payload.startsWith("/chatMessage:")) handleChatMessage(session, payload);

        if (payload.startsWith("/roomChatMessage:")) handleRoomChatMessage(session, payload);

        if (payload.startsWith("/inviteToGame:")) handleGameInvite(session, payload);

        if (payload.startsWith("/cancelGameInvite:")) handleCancelGameInvite(session, payload);

        if (payload.startsWith("/gameInviteResponse:")) handleGameInviteResponse(session, payload);
    }

    private void handleGameInvite(WebSocketSession session, String payload) throws IOException {
        Principal principal = session.getPrincipal();
        String[] parts = payload.split(":", 2);
        if (principal == null || parts.length < 2) return;

        String inviter = principal.getName();
        String invitedPlayer = parts[1];
        if (invitedPlayer.isBlank() || invitedPlayer.equals(inviter)) return;

        PendingGameInvite invite = new PendingGameInvite(inviter, invitedPlayer);
        Long cooldownExpiresAt = gameInviteCooldowns.get(invite);
        if (cooldownExpiresAt != null) {
            if (cooldownExpiresAt > System.currentTimeMillis()) return;
            gameInviteCooldowns.remove(invite, cooldownExpiresAt);
        }

        for (WebSocketSession activeSession : globalActiveSessions) {
            Principal activePrincipal = activeSession.getPrincipal();
            if (activePrincipal != null && activePrincipal.getName().equals(invitedPlayer)) {
                if (!pendingGameInvites.add(invite)) return;
                sendTextMessage(activeSession, "[GAME_INVITE]:" + inviter);
                ChatMessage inviteNotice = new ChatMessage(
                        inviter + " is inviting to you a match. Please check your notifications to respond.",
                        "【SERVER】"
                );
                sendTextMessage(activeSession, "[CHAT_MESSAGE]:" + objectMapper.writeValueAsString(inviteNotice));
                ChatMessage confirmation = new ChatMessage(
                        "You have invited " + invitedPlayer + " to a match. Please wait for the other player to respond.",
                        "【SERVER】"
                );
                sendTextMessage(session, "[CHAT_MESSAGE]:" + objectMapper.writeValueAsString(confirmation));
                return;
            }
        }

        sendTextMessage(session, "[GAME_INVITE_RESPONSE]:" + invitedPlayer + ":false");
    }

    private void handleCancelGameInvite(WebSocketSession session, String payload) throws IOException {
        Principal principal = session.getPrincipal();
        String[] parts = payload.split(":", 2);
        if (principal == null || parts.length < 2) return;

        String inviter = principal.getName();
        String invitedPlayer = parts[1];
        PendingGameInvite invite = new PendingGameInvite(inviter, invitedPlayer);
        if (!pendingGameInvites.remove(invite)) return;
        gameInviteCooldowns.put(invite, System.currentTimeMillis() + GAME_INVITE_COOLDOWN_MS);

        for (WebSocketSession activeSession : globalActiveSessions) {
            Principal activePrincipal = activeSession.getPrincipal();
            if (activePrincipal != null && activePrincipal.getName().equals(invitedPlayer)) {
                sendTextMessage(activeSession, "[GAME_INVITE_CANCELLED]:" + inviter);
                break;
            }
        }
    }

    private void handleGameInviteResponse(WebSocketSession session, String payload) throws IOException {
        Principal principal = session.getPrincipal();
        String[] parts = payload.split(":", 3);
        if (principal == null || parts.length < 3) return;

        String invitedPlayer = principal.getName();
        String inviter = parts[1];
        boolean accepted = Boolean.parseBoolean(parts[2]);
        if (!pendingGameInvites.remove(new PendingGameInvite(inviter, invitedPlayer))) return;

        WebSocketSession inviterSession = null;
        for (WebSocketSession activeSession : globalActiveSessions) {
            Principal activePrincipal = activeSession.getPrincipal();
            if (activePrincipal != null && activePrincipal.getName().equals(inviter)) {
                inviterSession = activeSession;
                break;
            }
        }

        if (inviterSession == null) return;
        sendTextMessage(inviterSession, "[GAME_INVITE_RESPONSE]:" + invitedPlayer + ":" + accepted);

        if (accepted) {
            String gameId = inviter + "‗" + invitedPlayer;
            if (!gameWebSocket.createGameRoom(gameId, inviter, invitedPlayer)) {
                sendTextMessage(inviterSession, "[CHAT_MESSAGE]:【SERVER】: Unable to create the game.");
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Unable to create the game.");
                return;
            }
            sendTextMessage(inviterSession, "[COMPUTE_GAME]:" + gameId);
            sendTextMessage(session, "[COMPUTE_GAME]:" + gameId);
            lastPlayerRooms.remove(inviterSession);
            lastPlayerRooms.remove(session);
        }
    }

    private record PendingGameInvite(String inviter, String invitedPlayer) {}

    @EventListener
    public void handleGameLobbyReturn(GameLobbyReturnEvent event) {
        String roomId = gameLobbyRoomByUsername.get(event.returningUsername());
        Room room = roomId == null ? null : getRoomById(roomId);
        if (room == null || !room.getHostName().equals(event.returningUsername())) return;

        synchronized (room) {
            room.getPlayers().removeIf(player -> event.disconnectedUsernames().contains(player.getName()));
            event.disconnectedUsernames().forEach(username -> gameLobbyRoomByUsername.remove(username, roomId));
        }

        roomsWithActiveGames.remove(roomId);
        try {
            sendRoomUpdate(room);
        } catch (IOException e) {
            System.err.println("Unable to broadcast lobby cleanup for room " + roomId + ": " + e.getMessage());
        }
    }

    private boolean tryReconnectToRoom(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        String gameLobbyRoomId = gameLobbyRoomByUsername.get(username);
        if (gameLobbyRoomId != null) {
            Room gameLobbyRoom = getRoomById(gameLobbyRoomId);
            if (gameLobbyRoom != null) {
                boolean gameIsActive = gameWebSocket.findGameRoomBySession(session).isPresent();
                boolean returningPlayerIsHost = gameLobbyRoom.getHostName().equals(username);

                synchronized (gameLobbyRoom) {
                    gameLobbyRoom.getPlayers().removeIf(player -> player.getName().equals(username));
                    gameLobbyRoom.getPlayers().add(new LobbyPlayer(session, username, returningPlayerIsHost));

                    if (returningPlayerIsHost && !gameIsActive) {
                        List<LobbyPlayer> disconnectedPlayers = gameLobbyRoom.getPlayers().stream()
                                .filter(player -> !player.getName().equals(username))
                                .filter(player -> !player.getSession().isOpen())
                                .toList();

                        gameLobbyRoom.getPlayers().removeAll(disconnectedPlayers);
                        disconnectedPlayers.forEach(player -> {
                            gameLobbyRoomByUsername.remove(player.getName(), gameLobbyRoomId);
                            lastPlayerRooms.remove(player.getSession());
                        });
                    }
                }
                if (gameIsActive) {
                    roomsWithActiveGames.add(gameLobbyRoomId);
                } else {
                    roomsWithActiveGames.remove(gameLobbyRoomId);
                }
                sendTextMessage(session, "[JOIN_ROOM]:" + objectMapper.writeValueAsString(getRoomDTO(gameLobbyRoom)));
                sendRoomUpdate(gameLobbyRoom);
                return true;
            }
            gameLobbyRoomByUsername.remove(username, gameLobbyRoomId);
        }

        // Check if player was previously in a room using lastPlayerRooms map
        String previousRoomId = lastPlayerRooms.get(session);
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
                ChatMessage reconnectMessage = new ChatMessage("Reconnected to your previous room.", "【SERVER】");
                sendTextMessage(session, "[CHAT_MESSAGE]:" + objectMapper.writeValueAsString(reconnectMessage));

                // Update room for all players
                sendRoomUpdate(previousRoom);
                return true; // Reconnection successful
            } else {
                // Room no longer exists, remove the mapping
                lastPlayerRooms.remove(session);
            }
        }
        return false; // No reconnection happened
    }

    private void startGame(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        if (parts.length < 3 || session.getPrincipal() == null) return;

        String roomId = parts[1];

        Room room = getRoomById(roomId);
        if (room == null || room.getPlayers().size() != 2) return;
        if (!room.getHostName().equals(session.getPrincipal().getName())) return;

        List<String> usernames = room.getPlayers().stream().map(LobbyPlayer::getName).toList();
        String requestedGameId = parts[2];
        String gameId = usernames.get(0) + "‗" + usernames.get(1);
        boolean requestedPlayersMatch = new HashSet<>(Arrays.asList(requestedGameId.split("‗")))
                .equals(new HashSet<>(usernames));
        if (!requestedPlayersMatch || !gameWebSocket.createGameRoom(gameId, usernames.get(0), usernames.get(1))) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Unable to create the game.");
            return;
        }

        gameWebSocket.prepareGame(gameId);

        for (LobbyPlayer player : room.getPlayers()) {
            gameLobbyRoomByUsername.put(player.getName(), roomId);
            sendTextMessage(player.getSession(), "[COMPUTE_ROOM_GAME]:" + gameId + ":" + roomId);
            lastPlayerRooms.remove(player.getSession());
        }

        roomsWithActiveGames.add(roomId);
        emptyRoomTimestamps.remove(roomId);
    }

    @Scheduled(fixedRate = 5000) // 5 seconds
    private void shortIntervalOperations() throws IOException {
        long now = System.currentTimeMillis();
        gameInviteCooldowns.entrySet().removeIf(entry -> entry.getValue() <= now);
        checkForRejoinableGameRoom();
        broadcastRooms();
    }

    @Scheduled(fixedRate = 5000) // fallback in case a WebSocket lifecycle event is missed
    private void userCountFallback() throws IOException {
        broadcastUserCount();
    }

    @Scheduled(fixedRate = 30000) // 30 seconds
    private void longIntervalOperations() throws IOException {
        checkConnectionAndCleanup();
        reconcileQuickPlayQueue();
    }

    private void checkConnectionAndCleanup() throws IOException {
        long now = System.currentTimeMillis();

        for (Map.Entry<WebSocketSession, Long> entry : lastHeartbeatTimestamps.entrySet()) {
            WebSocketSession session = entry.getKey();
            long lastHeartbeat = entry.getValue();

            if (now - lastHeartbeat > 30000) { // 30 seconds timeout
                afterConnectionClosed(session, CloseStatus.SESSION_NOT_RELIABLE);
            }
        }
    }

    private void joinQuickPlayQueue(WebSocketSession session) throws IOException {
        synchronized (quickPlayLock) {
            pruneQuickPlayQueue();

            Principal principal = session.getPrincipal();
            if (principal == null || !session.isOpen()) return;

            String username = principal.getName();
            quickPlayQueue.removeIf(queuedSession -> hasUsername(queuedSession, username));
            quickPlayQueue.add(session);
            sendTextMessage(session, "[QUICK_PLAY_QUEUED]");

            assignQuickPlay(session);
            broadcastQuickPlayCount();
        }
    }

    private void cancelQuickPlayQueue(WebSocketSession session) throws IOException {
        synchronized (quickPlayLock) {
            Principal principal = session.getPrincipal();
            if (principal != null) {
                String username = principal.getName();
                quickPlayQueue.removeIf(queuedSession -> hasUsername(queuedSession, username));
            } else {
                quickPlayQueue.remove(session);
            }
            sendTextMessage(session, "[QUICK_PLAY_CANCELLED]");
            broadcastQuickPlayCount();
        }
    }

    private void reconcileQuickPlayQueue() throws IOException {
        synchronized (quickPlayLock) {
            pruneQuickPlayQueue();
            assignQuickPlay(null);
            broadcastQuickPlayCount();
        }
    }

    private void pruneQuickPlayQueue() {
        quickPlayQueue.removeIf(session -> !session.isOpen() || session.getPrincipal() == null);

        Set<String> queuedUsernames = new HashSet<>();
        quickPlayQueue.removeIf(session -> !queuedUsernames.add(session.getPrincipal().getName()));
    }

    private boolean hasUsername(WebSocketSession session, String username) {
        Principal principal = session.getPrincipal();
        return principal != null && principal.getName().equals(username);
    }

    private void broadcastQuickPlayCount() throws IOException {
        String message = "[USER_COUNT_QUICK_PLAY]:" + quickPlayQueue.size();
        for (WebSocketSession activeSession : globalActiveSessions) sendTextMessage(activeSession, message);
    }

    private void assignQuickPlay(WebSocketSession priorityPlayer) {
        List<WebSocketSession> players = new ArrayList<>(quickPlayQueue);

        if (players.size() < 2) return; // Not enough players to form a match

        Collections.shuffle(players);

        // Match the player who just joined first. This lets them avoid their previous
        // opponent when multiple compatible players are already waiting.
        if (priorityPlayer != null && players.remove(priorityPlayer)) players.add(0, priorityPlayer);

        List <List<WebSocketSession>> matchedPairs = new ArrayList<>();

        while (players.size() >= 2) {
            WebSocketSession player1 = players.remove(0);
            List<WebSocketSession> compatiblePlayers = players.stream()
                    .filter(player2 -> !mongoUserDetailsService.checkBlockedByWebSocketSessions(player1, player2))
                    .toList();

            if (compatiblePlayers.isEmpty()) continue;

            String player1Username = getUsername(player1);
            String previousOpponent = lastQuickPlayOpponents.get(player1Username);
            List<WebSocketSession> preferredPlayers = compatiblePlayers.stream()
                    .filter(player2 -> !Objects.equals(previousOpponent, getUsername(player2)))
                    .toList();

            // Fall back to the only available opponent instead of making both players wait.
            WebSocketSession player2 = (preferredPlayers.isEmpty() ? compatiblePlayers : preferredPlayers).get(0);
            players.remove(player2);
            matchedPairs.add(List.of(player1, player2));
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
            gameWebSocket.prepareGame(newGameId);

            if (!gameWebSocket.createGameRoom(newGameId, username1, username2)) {
                continue;
            }

            lastQuickPlayOpponents.put(username1, username2);
            lastQuickPlayOpponents.put(username2, username1);

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

    private String getUsername(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        return principal == null ? null : principal.getName();
    }

    @Scheduled(fixedRate = 10000) // 10 seconds
    private void cleanUpEmptyRooms() throws IOException {
        reconcileAbandonedRooms(System.currentTimeMillis());

        broadcastRooms();
    }

    void reconcileAbandonedRooms(long currentTime) {
        for (Room room : rooms) {
            if (roomsWithActiveGames.contains(room.getId())) {
                emptyRoomTimestamps.remove(room.getId());
                continue;
            }

            if (isAbandonedRoom(room)) {
                emptyRoomTimestamps.putIfAbsent(room.getId(), currentTime);
            } else {
                emptyRoomTimestamps.remove(room.getId());
            }
        }

        List<String> roomsToRemove = emptyRoomTimestamps.entrySet().stream()
                .filter(entry -> currentTime - entry.getValue() > ABANDONED_ROOM_GRACE_PERIOD_MS)
                .map(Map.Entry::getKey)
                .toList();

        for (String roomId : roomsToRemove) {
            emptyRoomTimestamps.remove(roomId);
            roomsWithActiveGames.remove(roomId);
            rooms.removeIf(room -> room.getId().equals(roomId));
            gameLobbyRoomByUsername.entrySet().removeIf(entry -> entry.getValue().equals(roomId));
            lastPlayerRooms.entrySet().removeIf(entry -> entry.getValue().equals(roomId));
        }
    }

    private boolean isAbandonedRoom(Room room) {
        if (room.getPlayers().isEmpty()) return true;
        if (room.getPlayers().size() != 1) return false;
        return !hasActiveLobbySession(room.getHostName());
    }

    private boolean hasActiveLobbySession(String username) {
        return globalActiveSessions.stream().anyMatch(session ->
                session.isOpen() &&
                session.getPrincipal() != null &&
                session.getPrincipal().getName().equals(username) &&
                playerStatuses.getOrDefault(session, PlayerStatus.LOBBY) == PlayerStatus.LOBBY
        );
    }

    private void createRoom(WebSocketSession session, String payload) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        String[] parts = payload.split(":", 4);

        String roomName = parts[1];
        String roomPassword = parts[2];
        boolean restrictionsApplied = Objects.equals(parts[3], "true");

        Room room = new Room(
                UUID.randomUUID().toString(),
                roomName,
                username,
                restrictionsApplied,
                roomPassword,
                new ArrayList<>());

        rooms.add(room);

        joinRoom(session, room.getId(), true);
        broadcastRooms();
    }

    private void broadcastRooms() throws IOException {
        List<Room> roomsWithOnlyHosts;

        roomsWithOnlyHosts = rooms.stream()
                .filter(r -> r.getPlayers().size() == 1)
                .filter(r -> !roomsWithActiveGames.contains(r.getId()))
                .filter(r -> hasActiveLobbySession(r.getHostName()))
                .toList();


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
        Map<String, PlayerStatus> onlinePlayerStatuses = new HashMap<>();

        globalActiveSessions.stream()
                .filter(session -> session.getPrincipal() != null)
                .forEach(session -> onlinePlayerStatuses.put(
                        Objects.requireNonNull(session.getPrincipal()).getName(),
                        playerStatuses.getOrDefault(session, PlayerStatus.LOBBY)
                ));

        rooms.stream()
                .filter(room -> room.getPlayers().size() >= 2)
                .flatMap(room -> room.getPlayers().stream())
                .forEach(player -> onlinePlayerStatuses.put(player.getName(), PlayerStatus.GAME_ROOM));

        gameWebSocket.gameRooms.values().forEach(gameRoom -> {
            onlinePlayerStatuses.put(gameRoom.getPlayer1().username(), PlayerStatus.MATCH);
            onlinePlayerStatuses.put(gameRoom.getPlayer2().username(), PlayerStatus.MATCH);
        });

        List<OnlinePlayerDTO> onlinePlayers = onlinePlayerStatuses.entrySet().stream()
                .map(entry -> new OnlinePlayerDTO(entry.getKey(), entry.getValue().displayText))
                .sorted(Comparator.comparing(OnlinePlayerDTO::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
        String lobbyPlayersMessage = "[LOBBY_PLAYERS]:" + objectMapper.writeValueAsString(onlinePlayers);
        String userCountMessage = "[USER_COUNT]:" + getTotalSessionCount();
        String quickPlayCountMessage = "[USER_COUNT_QUICK_PLAY]:" + quickPlayQueue.size();

        for (WebSocketSession session : globalActiveSessions) {
            sendTextMessage(session, userCountMessage);
            sendTextMessage(session, quickPlayCountMessage);
            sendTextMessage(session, lobbyPlayersMessage);
        }
    }

    private void setPlayerStatus(WebSocketSession session, String requestedStatus) throws IOException {
        try {
            PlayerStatus status = PlayerStatus.valueOf(requestedStatus);
            if (status == PlayerStatus.MATCH || status == PlayerStatus.GAME_ROOM) return;
            playerStatuses.put(session, status);
            broadcastUserCount();
        } catch (IllegalArgumentException ignored) {
            // Ignore unknown client-provided statuses.
        }
    }

    private void registerActiveSession(WebSocketSession session, String username, PlayerStatus status) {
        globalActiveSessions.removeIf(existingSession -> {
            boolean belongsToUser = existingSession.getPrincipal() != null &&
                    Objects.equals(existingSession.getPrincipal().getName(), username);
            if (belongsToUser) playerStatuses.remove(existingSession);
            return belongsToUser;
        });
        playerStatuses.put(session, status);
        globalActiveSessions.add(session);
    }

    private PlayerStatus getRequestedPlayerStatus(WebSocketSession session) {
        if (session.getUri() == null || session.getUri().getQuery() == null) return PlayerStatus.LOBBY;

        return Arrays.stream(session.getUri().getQuery().split("&"))
                .filter(parameter -> parameter.startsWith("status="))
                .map(parameter -> parameter.substring("status=".length()))
                .map(status -> {
                    try {
                        PlayerStatus parsedStatus = PlayerStatus.valueOf(status);
                        return parsedStatus == PlayerStatus.MATCH ? PlayerStatus.LOBBY : parsedStatus;
                    } catch (IllegalArgumentException ignored) {
                        return PlayerStatus.LOBBY;
                    }
                })
                .findFirst()
                .orElse(PlayerStatus.LOBBY);
    }

    private enum PlayerStatus {
        LOBBY("In lobby"),
        GAME_ROOM("In Game Room"),
        MATCH("In a match"),
        DECKBUILDING("Deck building"),
        TESTING("Testing");

        private final String displayText;

        PlayerStatus(String displayText) {
            this.displayText = displayText;
        }
    }

    @EventListener
    public void handleOnlinePlayerCountChanged(OnlinePlayerCountChangedEvent ignored) {
        try {
            broadcastUserCount();
        } catch (IOException e) {
            System.err.println("Failed to broadcast online player count: " + e.getMessage());
        }
    }

    private void checkForRejoinableGameRoom() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            sendReconnectStatus(session);
        }
    }

    private void sendReconnectStatus(WebSocketSession session) throws IOException {
        Optional<GameRoom> room = gameWebSocket.findReconnectableGameRoomBySession(session);
        if (room.isPresent()) sendTextMessage(session, "[RECONNECT_ENABLED]:" + room.get().getRoomId());
        else sendTextMessage(session, "[RECONNECT_DISABLED]");
    }

    private int getTotalSessionCount() {
        Set<String> activePlayerNames = new HashSet<>();

        globalActiveSessions.stream()
                .map(WebSocketSession::getPrincipal)
                .filter(Objects::nonNull)
                .map(Principal::getName)
                .forEach(activePlayerNames::add);

        gameWebSocket.gameRooms.values().stream()
                .flatMap(gameRoom -> gameRoom.getSessions().stream())
                .filter(WebSocketSession::isOpen)
                .map(WebSocketSession::getPrincipal)
                .filter(Objects::nonNull)
                .map(Principal::getName)
                .forEach(activePlayerNames::add);

        return activePlayerNames.size();
    }

    private RoomDTO getRoomDTO(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getName(),
                room.getHostName(),
                room.isRestrictionsApplied(),
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

            sendRoomUpdate(room, true);
        }

        broadcastRooms();
        broadcastUserCount();
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
        String[] parts = payload.split(":", 4);
        if (parts.length < 2) return;

        String roomId = parts[1];
        String shouldCleanLastRoom = parts.length >= 4 ? parts[3] : "true";

        if (shouldCleanLastRoom.equals("false")) return;

        Principal principal = session.getPrincipal();
        String userName = principal != null
                ? principal.getName()
                : parts.length >= 3 ? parts[2] : null;

        lastPlayerRooms.remove(session);
        if (userName != null) gameLobbyRoomByUsername.remove(userName);

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[LEAVE_ROOM]");
            sendGlobalChatHistory(session);
            broadcastRooms();
            broadcastUserCount();
            return;
        }

        boolean roomIsEmpty;
        synchronized (room) {
            room.getPlayers().removeIf(p -> p.getName().equals(userName));

            if (room.getHostName().equals(userName) && !room.getPlayers().isEmpty()) {
                LobbyPlayer remainingPlayer = room.getPlayers().get(0);
                room.setHostName(remainingPlayer.getName());
                remainingPlayer.setReady(true);
            }

            roomIsEmpty = room.getPlayers().isEmpty();

            if (roomIsEmpty) {
                emptyRoomTimestamps.put(room.getId(), System.currentTimeMillis());
                rooms.remove(room);
            }
        }

        // A leave is complete once server state is updated. A stale remaining
        // player's socket must not prevent the leaving client from exiting.
        sendTextMessage(session, "[LEAVE_ROOM]");
        if (!roomIsEmpty) {
            try {
                sendRoomUpdate(room);
            } catch (IOException e) {
                System.err.println("Unable to broadcast room update after leave for room " + roomId + ": " + e.getMessage());
            }
        }
        sendGlobalChatHistory(session);
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have left the room " + room.getName() + ".");
        broadcastRooms();
        broadcastUserCount();
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
            lastPlayerRooms.remove(session);
            gameLobbyRoomByUsername.remove(userName);
        }

        sendRoomUpdate(room);

        sendTextMessage(player.getSession(), "[KICKED]");
        sendGlobalChatHistory(player.getSession());
        sendTextMessage(player.getSession(), "[CHAT_MESSAGE]:【SERVER】: You have been kicked from the room " + room.getName() + ".");

        sendTextMessage(session, "[SUCCESS]");
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have kicked " + userName + ".");

        broadcastRooms();
        broadcastUserCount();
    }

    private void handleChatMessage(WebSocketSession session, String payload) throws IOException {
        if (payload.substring("/chatMessage:".length()).trim().isEmpty()) return;

        Principal principal = session.getPrincipal();
        if (principal == null) return;

        String username = principal.getName();

        String messageContent = payload.substring("/chatMessage:".length());
        ChatMessage chatMessage = new ChatMessage(messageContent, username);

        globalChatMessages.add(chatMessage);

        if (globalChatMessages.size() > 500) globalChatMessages.removeFirst();

        for (WebSocketSession webSocketSession : globalActiveSessions) {
            if (canReceiveChatMessage(webSocketSession, chatMessage)) {
                sendTextMessage(webSocketSession, "[CHAT_MESSAGE]:" + objectMapper.writeValueAsString(chatMessage));
            }
        }
    }

    private void handleRoomChatMessage(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        String messageContent = parts[1];
        String roomId = parts[2];
        Principal principal = session.getPrincipal();
        if (principal == null) return;

        String userName = principal.getName();

        Room room = getRoomById(roomId);
        if (room == null) return;

        ChatMessage chatMessage = new ChatMessage(messageContent, userName);

        for (LobbyPlayer player : room.getPlayers()) {
            if (canReceiveChatMessage(player.getSession(), chatMessage)) {
                sendTextMessage(player.getSession(), "[CHAT_MESSAGE_ROOM]:" + objectMapper.writeValueAsString(chatMessage));
            }
        }
    }

    private void sendGlobalChatHistory(WebSocketSession session) throws IOException {
        sendTextMessage(session, "[GLOBAL_CHAT]:" + objectMapper.writeValueAsString(getVisibleGlobalChatMessages(session)));
    }

    List<ChatMessage> getVisibleGlobalChatMessages(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal == null) return List.copyOf(globalChatMessages);

        Set<String> blockedAccounts = new HashSet<>(
                mongoUserDetailsService.getBlockedAccounts(principal.getName())
        );

        return globalChatMessages.stream()
                .filter(message -> "【SERVER】".equals(message.author()) || !blockedAccounts.contains(message.author()))
                .toList();
    }

    private boolean canReceiveChatMessage(WebSocketSession recipient, ChatMessage message) {
        Principal principal = recipient.getPrincipal();
        if (principal == null || "【SERVER】".equals(message.author())) return true;

        return !mongoUserDetailsService.getBlockedAccounts(principal.getName()).contains(message.author());
    }

    private Room getRoomById(String roomId) {
        return rooms.stream().filter(r -> r.getId().equals(roomId)).findFirst().orElse(null);
    }
    
    public void broadcastServerMessage(String message) throws IOException {
        ChatMessage serverMessage = new ChatMessage(message, "【SERVER】");

        globalChatMessages.add(serverMessage);
        
        if (globalChatMessages.size() > 500) globalChatMessages.removeFirst();
        
        for (WebSocketSession session : globalActiveSessions) {
            sendTextMessage(session, "[CHAT_MESSAGE]:" + objectMapper.writeValueAsString(serverMessage));
        }

        for (Room room : rooms) {
            for (LobbyPlayer player : room.getPlayers()) {
                sendTextMessage(player.getSession(), "[CHAT_MESSAGE_ROOM]:" + objectMapper.writeValueAsString(serverMessage));
            }
        }
    }
    
    public boolean removeMessageById(String messageId) throws IOException {
        boolean removed = globalChatMessages.removeIf(msg -> msg.id().equals(messageId));
        
        if (removed) {
            // Broadcast message deletion to all connected clients
            for (WebSocketSession session : globalActiveSessions) {
                sendTextMessage(session, "[MESSAGE_DELETED]:" + messageId);
            }
        }
        
        return removed;
    }
}
