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
import jakarta.annotation.PostConstruct;
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
import java.time.Instant;
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
    private static final long ABANDONED_ROOM_GRACE_PERIOD_MS = 120_000;

    private final Map<String, Long> emptyRoomTimestamps = new ConcurrentHashMap<>();
    private final Map<String, String> lastPlayerRooms = new ConcurrentHashMap<>(); // username -> roomId
    private final Map<String, String> gameLobbyRoomByUsername = new ConcurrentHashMap<>();
    private final Set<String> roomsWithActiveGames = ConcurrentHashMap.newKeySet();
    private final Map<String, Set<String>> kickedPlayersByRoomId = new ConcurrentHashMap<>();
    private final Map<String, Long> hostReconnectDeadlines = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Long>> playerReconnectDeadlinesByRoomId = new ConcurrentHashMap<>();
    private final Object roomCreationLock = new Object();

    private static final String KICKED_REJOIN_MESSAGE =
            "[CHAT_MESSAGE]:【SERVER】: You have been removed from the Game Room. " +
                    "You will not be able to rejoin the Game Room at this time.";

    private final Object quickPlayLock = new Object();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    public final LinkedList<ChatMessage> globalChatMessages = new LinkedList<>(List.of(new ChatMessage("Join our Discord!", "【SERVER】")));

    private final GameWebSocket gameWebSocket;

    @Autowired(required = false)
    private RoomSnapshotRepository roomSnapshotRepository;

    @PostConstruct
    void restorePersistedRooms() {
        if (roomSnapshotRepository == null) return;

        Instant now = Instant.now();
        Instant gracePeriodEnd = now.plusMillis(ABANDONED_ROOM_GRACE_PERIOD_MS);
        for (RoomSnapshot snapshot : roomSnapshotRepository.findAll()) {
            if (snapshot.expiresAt() != null && !snapshot.expiresAt().isAfter(now)) {
                roomSnapshotRepository.deleteById(snapshot.id());
                continue;
            }

            Room room = roomFromSnapshot(snapshot);
            rooms.add(room);
            long expiresAtMillis = snapshot.expiresAt() == null
                    ? gracePeriodEnd.toEpochMilli()
                    : snapshot.expiresAt().toEpochMilli();
            emptyRoomTimestamps.put(room.getId(), expiresAtMillis - ABANDONED_ROOM_GRACE_PERIOD_MS);
            persistRoom(room, Instant.ofEpochMilli(expiresAtMillis));
        }
    }

    private void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if (session == null || !session.isOpen()) return;
        try {
            synchronized (session) {
                if (session.isOpen()) session.sendMessage(new TextMessage(message));
            }
        } catch (IllegalStateException ignored) {
            // The socket closed between the isOpen check and the write.
        }
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
                .filter(r -> r.getPlayers().size() <= 1)
                .filter(r -> !r.getPlayers().isEmpty() || emptyRoomTimestamps.containsKey(r.getId()))
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
                    .filter(room -> room.getPlayers().stream().anyMatch(p -> p.getSession().equals(session)))
                    .findFirst()
                    .orElse(null);

            if (playerRoom != null) {
                if (roomsWithActiveGames.contains(playerRoom.getId())) {
                    // Keep the username-to-room association across a browser
                    // refresh even while the game transition is being finalized.
                    lastPlayerRooms.put(username, playerRoom.getId());
                    lastHeartbeatTimestamps.remove(session);
                    quickPlayQueue.remove(session);
                    globalActiveSessions.remove(session);
                    return;
                }

                synchronized (playerRoom) {
                    boolean hostDisconnected = playerRoom.getHostName().equals(username);
                    if (hostDisconnected) {
                        playerRoom.removePlayers(player -> player.getSession().equals(session));
                        long reconnectDeadline = System.currentTimeMillis() + ABANDONED_ROOM_GRACE_PERIOD_MS;
                        hostReconnectDeadlines.put(playerRoom.getId(), reconnectDeadline);
                        lastPlayerRooms.put(username, playerRoom.getId());
                        if (playerRoom.getPlayers().isEmpty()) {
                            emptyRoomTimestamps.put(playerRoom.getId(), System.currentTimeMillis());
                        }
                    } else {
                        playerReconnectDeadlinesByRoomId
                                .computeIfAbsent(playerRoom.getId(), ignored -> new ConcurrentHashMap<>())
                                .put(username, System.currentTimeMillis() + ABANDONED_ROOM_GRACE_PERIOD_MS);
                        lastPlayerRooms.put(username, playerRoom.getId());
                        gameLobbyRoomByUsername.put(username, playerRoom.getId());
                    }
                    sendRoomUpdate(playerRoom);

                    if (hostDisconnected) {
                        persistRoom(
                                playerRoom,
                                Instant.ofEpochMilli(hostReconnectDeadlines.get(playerRoom.getId()))
                        );
                    } else if (playerRoom.getPlayers().isEmpty()) {
                        emptyRoomTimestamps.put(playerRoom.getId(), System.currentTimeMillis());
                        persistRoom(
                                playerRoom,
                                Instant.now().plusMillis(ABANDONED_ROOM_GRACE_PERIOD_MS)
                        );
                    } else {
                        persistCurrentRoomLifecycle(playerRoom);
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
            String gameId = UUID.randomUUID().toString();
            if (!gameWebSocket.createGameRoom(gameId, inviter, invitedPlayer)) {
                sendTextMessage(inviterSession, "[CHAT_MESSAGE]:【SERVER】: Unable to create the game.");
                sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Unable to create the game.");
                return;
            }
            sendTextMessage(inviterSession, "[COMPUTE_GAME]:" + gameId);
            sendTextMessage(session, "[COMPUTE_GAME]:" + gameId);
            lastPlayerRooms.remove(inviter);
            lastPlayerRooms.remove(invitedPlayer);
        }
    }

    private record PendingGameInvite(String inviter, String invitedPlayer) {}

    @EventListener
    public void handleGameLobbyReturn(GameLobbyReturnEvent event) {
        String roomId = gameLobbyRoomByUsername.get(event.returningUsername());
        Room room = roomId == null ? null : getRoomById(roomId);
        if (room == null) return;

        // A closed game or lobby socket only means that the player is between
        // pages/connections. Membership is removed by explicit leave/kick/room
        // destruction, or by the existing reconnect expiry lifecycle.
        roomsWithActiveGames.remove(roomId);
        room.returnToLobby();
        logRoomTransition(room, event.returningUsername(), null, "RETURN_TO_LOBBY");
        Map<String, Long> reconnectDeadlines = playerReconnectDeadlinesByRoomId
                .computeIfAbsent(roomId, ignored -> new ConcurrentHashMap<>());
        long reconnectDeadline = System.currentTimeMillis() + ABANDONED_ROOM_GRACE_PERIOD_MS;
        synchronized (room) {
            room.getPlayers().stream()
                    .filter(player -> !player.getName().equals(room.getHostName()))
                    .filter(player -> !player.getSession().isOpen())
                    .forEach(player -> reconnectDeadlines.putIfAbsent(player.getName(), reconnectDeadline));
        }
        try {
            sendRoomUpdate(room);
        } catch (IOException e) {
            System.err.println("Unable to broadcast lobby cleanup for room " + roomId + ": " + e.getMessage());
        }
    }

    private boolean tryReconnectToRoom(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        String activeGameLobbyRoomId = gameLobbyRoomByUsername.get(username);
        String gameLobbyRoomId = activeGameLobbyRoomId != null
                ? activeGameLobbyRoomId
                : lastPlayerRooms.get(username);
        if (gameLobbyRoomId != null) {
            Room gameLobbyRoom = getRoomById(gameLobbyRoomId);
            if (gameLobbyRoom != null) {
                boolean gameIsActive = gameWebSocket.findGameRoomBySession(session).isPresent();
                boolean returningPlayerIsHost = gameLobbyRoom.getHostName().equals(username);

                synchronized (gameLobbyRoom) {
                    LobbyPlayer replacement = gameLobbyRoom.replacePlayer(session, username, returningPlayerIsHost);
                    logRoomTransition(gameLobbyRoom, username, replacement, "RECONNECT");
                    removePlayerReconnectDeadline(gameLobbyRoomId, username);

                    if (returningPlayerIsHost) {
                        hostReconnectDeadlines.remove(gameLobbyRoomId);
                        emptyRoomTimestamps.remove(gameLobbyRoomId);
                        lastPlayerRooms.remove(username, gameLobbyRoomId);
                        persistRoom(gameLobbyRoom, null);
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

        return false;
    }

    private void startGame(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        if (session.getPrincipal() == null) return;
        if (parts.length < 2) {
            rejectStartGame(session, "The start-game request was invalid.");
            return;
        }

        String roomId = parts[1];

        Room room = getRoomById(roomId);
        if (room == null) {
            rejectStartGame(session, "The game room no longer exists.");
            return;
        }

        List<String> usernames;
        List<LobbyPlayer> activePlayers;
        synchronized (room) {
            boolean membershipChanged = normalizeRoomMembership(room);
            if (membershipChanged) sendRoomUpdate(room);

            if (room.getPlayers().size() != 2) {
                rejectStartGame(session, "The game requires exactly two distinct players.");
                return;
            }
            if (!room.getHostName().equals(session.getPrincipal().getName())) {
                rejectStartGame(session, "Only the room host can start the game.");
                return;
            }
            if (!room.transition(Room.State.LOBBY, Room.State.STARTING)) {
                rejectStartGame(session, "The room is already starting or currently in a game.");
                return;
            }
            logRoomTransition(room, session.getPrincipal().getName(), null, "STARTING");
            usernames = room.getPlayers().stream().map(LobbyPlayer::getName).toList();

            Map<String, WebSocketSession> activeSessions = new LinkedHashMap<>();
            for (String username : usernames) {
                activeSessions.put(username, getCurrentLobbySession(username));
            }
            if (activeSessions.values().stream().anyMatch(Objects::isNull)) {
                room.transition(Room.State.STARTING, Room.State.LOBBY);
                rejectStartGame(session, "Waiting for both players to reconnect.");
                return;
            }

            Map<String, Boolean> readyByUsername = room.getPlayers().stream().collect(java.util.stream.Collectors.toMap(
                    LobbyPlayer::getName,
                    LobbyPlayer::isReady
            ));
            activePlayers = usernames.stream()
                    .map(username -> new LobbyPlayer(
                            activeSessions.get(username),
                            username,
                            readyByUsername.getOrDefault(username, false)))
                    .toList();
            room.replacePlayers(activePlayers);
            persistCurrentRoomLifecycle(room);
        }

        String gameId = UUID.randomUUID().toString();
        if (!gameWebSocket.createGameRoom(gameId, usernames.get(0), usernames.get(1))) {
            room.transition(Room.State.STARTING, Room.State.LOBBY);
            rejectStartGame(session, "Unable to create the game.");
            return;
        }

        gameWebSocket.prepareGame(gameId);

        boolean deliveredToAllPlayers = true;
        for (LobbyPlayer player : activePlayers) {
            deliveredToAllPlayers &= trySendTextMessage(
                    player.getSession(),
                    "[COMPUTE_ROOM_GAME]:" + gameId + ":" + roomId);
        }
        if (!deliveredToAllPlayers) {
            gameWebSocket.discardGameRoom(gameId);
            room.transition(Room.State.STARTING, Room.State.LOBBY);
            for (LobbyPlayer player : activePlayers) {
                trySendTextMessage(player.getSession(), "[START_GAME_REJECTED]");
                trySendTextMessage(
                        player.getSession(),
                        "[CHAT_MESSAGE_ROOM]:【SERVER】: Waiting for both players to reconnect.");
            }
            return;
        }

        room.transition(Room.State.STARTING, Room.State.GAME);
        logRoomTransition(room, session.getPrincipal().getName(), null, "GAME");

        for (LobbyPlayer player : activePlayers) {
            gameLobbyRoomByUsername.put(player.getName(), roomId);
            lastPlayerRooms.remove(player.getName());
        }

        roomsWithActiveGames.add(roomId);
        emptyRoomTimestamps.remove(roomId);
    }

    private WebSocketSession getCurrentLobbySession(String username) {
        return globalActiveSessions.stream()
                .filter(WebSocketSession::isOpen)
                .filter(activeSession -> activeSession.getPrincipal() != null)
                .filter(activeSession -> Objects.equals(activeSession.getPrincipal().getName(), username))
                .findFirst()
                .orElse(null);
    }

    private boolean trySendTextMessage(WebSocketSession session, String message) {
        if (session == null || !session.isOpen()) return false;
        try {
            synchronized (session) {
                if (!session.isOpen()) return false;
                session.sendMessage(new TextMessage(message));
                return true;
            }
        } catch (IOException | IllegalStateException ignored) {
            return false;
        }
    }

    private boolean normalizeRoomMembership(Room room) {
        Map<String, LobbyPlayer> uniquePlayers = new LinkedHashMap<>();
        for (LobbyPlayer candidate : room.getPlayers()) {
            LobbyPlayer existing = uniquePlayers.get(candidate.getName());
            if (existing == null || candidate.getSession().isOpen() || !existing.getSession().isOpen()) {
                uniquePlayers.put(candidate.getName(), candidate);
            }
        }
        if (uniquePlayers.size() == room.getPlayers().size()) return false;

        room.replacePlayers(new ArrayList<>(uniquePlayers.values()));
        persistCurrentRoomLifecycle(room);
        return true;
    }

    private void rejectStartGame(WebSocketSession session, String reason) throws IOException {
        sendTextMessage(session, "[START_GAME_REJECTED]");
        sendTextMessage(session, "[CHAT_MESSAGE_ROOM]:【SERVER】: " + reason);
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

            String newGameId = UUID.randomUUID().toString();
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

    // Keep server-side expiry aligned with the second-resolution countdown shown
    // by clients. The server remains authoritative and notifies every occupant.
    @Scheduled(fixedRate = 1000)
    private void cleanUpEmptyRooms() throws IOException {
        reconcileAbandonedRooms(System.currentTimeMillis());

        broadcastRooms();
    }

    void reconcileAbandonedRooms(long currentTime) {
        for (Map.Entry<String, Map<String, Long>> roomEntry : playerReconnectDeadlinesByRoomId.entrySet()) {
            Room room = getRoomById(roomEntry.getKey());
            if (room == null) {
                playerReconnectDeadlinesByRoomId.remove(roomEntry.getKey());
                continue;
            }

            Set<String> expiredUsernames = roomEntry.getValue().entrySet().stream()
                    .filter(entry -> currentTime >= entry.getValue())
                    .map(Map.Entry::getKey)
                    .collect(java.util.stream.Collectors.toSet());
            if (expiredUsernames.isEmpty()) continue;

            synchronized (room) {
                room.removePlayers(player -> expiredUsernames.contains(player.getName()));
                expiredUsernames.forEach(username -> {
                    gameLobbyRoomByUsername.remove(username, room.getId());
                    lastPlayerRooms.remove(username, room.getId());
                    roomEntry.getValue().remove(username);
                });
                persistCurrentRoomLifecycle(room);
            }
            if (roomEntry.getValue().isEmpty()) playerReconnectDeadlinesByRoomId.remove(room.getId());
        }

        for (Room room : rooms) {
            if (roomsWithActiveGames.contains(room.getId())) {
                emptyRoomTimestamps.remove(room.getId());
                continue;
            }

            if (room.getPlayers().isEmpty()) {
                emptyRoomTimestamps.putIfAbsent(room.getId(), currentTime);
            } else {
                emptyRoomTimestamps.remove(room.getId());
            }
        }

        Set<String> roomsToRemove = new HashSet<>(emptyRoomTimestamps.entrySet().stream()
                .filter(entry -> currentTime - entry.getValue() > ABANDONED_ROOM_GRACE_PERIOD_MS)
                .map(Map.Entry::getKey)
                .toList());
        hostReconnectDeadlines.entrySet().stream()
                .filter(entry -> currentTime >= entry.getValue())
                .map(Map.Entry::getKey)
                .forEach(roomsToRemove::add);

        for (String roomId : roomsToRemove) {
            Room expiredRoom = getRoomById(roomId);
            List<LobbyPlayer> occupants = expiredRoom == null
                    ? List.of()
                    : new ArrayList<>(expiredRoom.getPlayers());
            emptyRoomTimestamps.remove(roomId);
            hostReconnectDeadlines.remove(roomId);
            playerReconnectDeadlinesByRoomId.remove(roomId);
            roomsWithActiveGames.remove(roomId);
            kickedPlayersByRoomId.remove(roomId);
            rooms.removeIf(room -> room.getId().equals(roomId));
            gameLobbyRoomByUsername.entrySet().removeIf(entry -> entry.getValue().equals(roomId));
            lastPlayerRooms.entrySet().removeIf(entry -> entry.getValue().equals(roomId));
            deletePersistedRoom(roomId);
            for (LobbyPlayer occupant : occupants) {
                try {
                    sendTextMessage(occupant.getSession(), "[LEAVE_ROOM]");
                    sendGlobalChatHistory(occupant.getSession());
                } catch (IOException ignored) {
                    // The room is already expired; a closed occupant session needs no notification.
                }
            }
        }
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

        synchronized (roomCreationLock) {
            List<Room> previouslyHostedRooms = rooms.stream()
                    .filter(room -> Objects.equals(room.getHostName(), username))
                    .toList();
            for (Room previouslyHostedRoom : previouslyHostedRooms) {
                destroyReplacedHostedRoom(previouslyHostedRoom);
            }

            Room room = new Room(
                    UUID.randomUUID().toString(),
                    roomName,
                    username,
                    restrictionsApplied,
                    roomPassword,
                    new ArrayList<>());

            rooms.add(room);
            joinRoom(session, room.getId(), true);
            persistCurrentRoomLifecycle(room);
        }
        broadcastRooms();
    }

    private void destroyReplacedHostedRoom(Room room) throws IOException {
        String roomId = room.getId();
        List<LobbyPlayer> occupants;
        synchronized (room) {
            occupants = room.clearPlayers();
            rooms.remove(room);
            emptyRoomTimestamps.remove(roomId);
            roomsWithActiveGames.remove(roomId);
            kickedPlayersByRoomId.remove(roomId);
            hostReconnectDeadlines.remove(roomId);
            gameLobbyRoomByUsername.entrySet().removeIf(entry -> Objects.equals(entry.getValue(), roomId));
            lastPlayerRooms.entrySet().removeIf(entry -> Objects.equals(entry.getValue(), roomId));
            deletePersistedRoom(roomId);
        }

        for (LobbyPlayer occupant : occupants) {
            sendTextMessage(occupant.getSession(), "[LEAVE_ROOM]");
            sendGlobalChatHistory(occupant.getSession());
        }
    }

    private void broadcastRooms() throws IOException {
        List<Room> roomsWithOnlyHosts;

        roomsWithOnlyHosts = rooms.stream()
                .filter(r -> r.getPlayers().size() <= 1)
                .filter(r -> !roomsWithActiveGames.contains(r.getId()))
                .filter(r -> !r.getPlayers().isEmpty() || emptyRoomTimestamps.containsKey(r.getId()))
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
                hostReconnectDeadlines.get(room.getId()),
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
            sendTextMessage(session, "[ROOM_NOT_FOUND]");
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }
        
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String hostUsername = room.getHostName();

        if (!host && kickedPlayersByRoomId.getOrDefault(roomId, Set.of()).contains(username)) {
            sendTextMessage(session, "[ROOM_JOIN_REJECTED]");
            sendTextMessage(session, KICKED_REJOIN_MESSAGE);
            return;
        }

        // Check blocking OUTSIDE synchronized block to avoid deadlock
        if (!host && !hostUsername.equals(username)) {
            List<String> hostBlockedAccounts = mongoUserDetailsService.getBlockedAccounts(hostUsername);
            if (hostBlockedAccounts.contains(username)) {
                sendTextMessage(session, "[SUCCESS]");
                return;
            }
        }

        LobbyPlayer joinedPlayer;
        String roomJson;
        synchronized (room) {
            boolean returningHost = Objects.equals(room.getHostName(), username);
            boolean existingMember = room.getPlayers().stream()
                    .anyMatch(player -> Objects.equals(player.getName(), username));

            // Membership is unique by authenticated username. A join from a new
            // browser session replaces the stale session before capacity is checked.
            room.removePlayers(player -> Objects.equals(player.getName(), username));
            removePlayerReconnectDeadline(roomId, username);

            Set<String> occupiedUsernames = room.getPlayers().stream()
                    .map(LobbyPlayer::getName)
                    .collect(java.util.stream.Collectors.toSet());
            occupiedUsernames.add(room.getHostName());
            if (!existingMember && !returningHost && occupiedUsernames.size() >= 2) {
                rejectFullRoom(session);
                return;
            }
            if (room.getPlayers().isEmpty() && !hostReconnectDeadlines.containsKey(roomId)) {
                room.setHostName(username);
                host = true;
            }
            if (returningHost) {
                host = true;
                hostReconnectDeadlines.remove(roomId);
                lastPlayerRooms.remove(username, roomId);
            }

            joinedPlayer = room.replacePlayer(session, username, host);
            roomJson = objectMapper.writeValueAsString(getRoomDTO(room));
            emptyRoomTimestamps.remove(roomId);
        }

        logRoomTransition(room, username, joinedPlayer, "JOIN");
        persistCurrentRoomLifecycle(room);
        sendTextMessage(session, "[JOIN_ROOM]:" + roomJson);
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have joined the room " + room.getName() + ".");
        sendRoomUpdate(room, true);

        broadcastRooms();
        broadcastUserCount();
    }

    private void handleJoinRoomAttempt(WebSocketSession session, String roomId) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        
        Room targetRoom = getRoomById(roomId);
        if (targetRoom == null) {
            sendTextMessage(session, "[ROOM_NOT_FOUND]");
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }

        if (kickedPlayersByRoomId.getOrDefault(roomId, Set.of()).contains(username)) {
            sendTextMessage(session, "[ROOM_JOIN_REJECTED]");
            sendTextMessage(session, KICKED_REJOIN_MESSAGE);
            return;
        }

        synchronized (targetRoom) {
            Set<String> occupiedUsernames = targetRoom.getPlayers().stream()
                    .map(LobbyPlayer::getName)
                    .collect(java.util.stream.Collectors.toSet());
            occupiedUsernames.add(targetRoom.getHostName());
            if (!occupiedUsernames.contains(username) && occupiedUsernames.size() >= 2) {
                rejectFullRoom(session);
                return;
            }
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

    private void rejectFullRoom(WebSocketSession session) throws IOException {
        sendTextMessage(session, "[ROOM_JOIN_REJECTED]");
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room is full.");
    }

    private void handlePasswordAttempt(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String passwordInput = parts[2];

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[ROOM_NOT_FOUND]");
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: The room you are attempting to join no longer exists.");
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

        lastPlayerRooms.remove(userName);
        if (userName != null) gameLobbyRoomByUsername.remove(userName);

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[LEAVE_ROOM]");
            sendGlobalChatHistory(session);
            broadcastRooms();
            broadcastUserCount();
            return;
        }

        boolean hostLeaving;
        List<LobbyPlayer> playersToNotify = List.of();
        synchronized (room) {
            hostLeaving = Objects.equals(room.getHostName(), userName);
            if (hostLeaving) {
                playersToNotify = room.clearPlayers();
                rooms.remove(room);
                emptyRoomTimestamps.remove(room.getId());
                roomsWithActiveGames.remove(room.getId());
                kickedPlayersByRoomId.remove(room.getId());
                hostReconnectDeadlines.remove(room.getId());
                playerReconnectDeadlinesByRoomId.remove(room.getId());
                deletePersistedRoom(room.getId());
            } else {
                removePlayerReconnectDeadline(roomId, userName);
                room.removePlayers(player ->
                        player.getSession().equals(session) || Objects.equals(player.getName(), userName));
                if (room.getPlayers().isEmpty()) {
                    emptyRoomTimestamps.put(room.getId(), System.currentTimeMillis());
                    persistRoom(room, Instant.now().plusMillis(ABANDONED_ROOM_GRACE_PERIOD_MS));
                } else {
                    persistCurrentRoomLifecycle(room);
                }
            }
        }

        if (hostLeaving) {
            for (LobbyPlayer player : playersToNotify) {
                gameLobbyRoomByUsername.remove(player.getName(), roomId);
                lastPlayerRooms.remove(player.getName());
                sendTextMessage(player.getSession(), "[LEAVE_ROOM]");
                sendGlobalChatHistory(player.getSession());
            }
        } else {
            sendTextMessage(session, "[LEAVE_ROOM]");
            sendRoomUpdate(room);
        }
        sendGlobalChatHistory(session);
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have left the room " + room.getName() + ".");
        broadcastRooms();
        broadcastUserCount();
    }

    private void removePlayerReconnectDeadline(String roomId, String username) {
        Map<String, Long> deadlines = playerReconnectDeadlinesByRoomId.get(roomId);
        if (deadlines == null) return;
        deadlines.remove(username);
        if (deadlines.isEmpty()) playerReconnectDeadlinesByRoomId.remove(roomId, deadlines);
    }

    private Room roomFromSnapshot(RoomSnapshot snapshot) {
        return new Room(
                snapshot.id(),
                snapshot.name(),
                snapshot.hostName(),
                snapshot.restrictionsApplied(),
                snapshot.password() == null ? "" : snapshot.password(),
                new ArrayList<>()
        );
    }

    private void persistRoom(Room room, Instant expiresAt) {
        if (roomSnapshotRepository != null) {
            roomSnapshotRepository.save(RoomSnapshot.from(room, expiresAt));
        }
    }

    private void persistCurrentRoomLifecycle(Room room) {
        Long hostReconnectDeadline = hostReconnectDeadlines.get(room.getId());
        Instant expiresAt = hostReconnectDeadline == null
                ? null
                : Instant.ofEpochMilli(hostReconnectDeadline);
        persistRoom(room, expiresAt);
    }

    private void deletePersistedRoom(String roomId) {
        if (roomSnapshotRepository != null) {
            roomSnapshotRepository.deleteById(roomId);
        }
    }

    void setRoomSnapshotRepositoryForTesting(RoomSnapshotRepository repository) {
        this.roomSnapshotRepository = repository;
    }

    private void toggleReady(WebSocketSession session, String roomId) throws IOException {
        Room room = getRoomById(roomId);

        LobbyPlayer player = room == null ? null : room.toggleReady(session);

        if(player == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You are not in this room.");
            sendTextMessage(session, "[SUCCESS]");
            return;
        }

        sendRoomUpdate(room);
        sendTextMessage(session, "[SUCCESS]");
    }

    private void logRoomTransition(Room room, String username, LobbyPlayer player, String action) {
        String sessionId = player == null || player.getSession() == null ? "none" : player.getSession().getId();
        long generation = player == null ? -1 : player.getGeneration();
        System.out.printf(
                "room=%s user=%s session=%s generation=%d state=%s version=%d action=%s%n",
                room.getId(), username, sessionId, generation, room.getState(), room.getVersion(), action);
    }

    private void kickPlayer(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        if (parts.length < 3) return;

        String roomId = parts[1];
        String userName = parts[2];

        Room room = getRoomById(roomId);
        if (room == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            sendTextMessage(session, "[SUCCESS]");
            return;
        }

        String requester = getUsername(session);
        if (!Objects.equals(room.getHostName(), requester) || Objects.equals(requester, userName)) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Only the room host can kick another player.");
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

            room.removePlayers(candidate -> candidate.getName().equals(userName));
            kickedPlayersByRoomId.computeIfAbsent(roomId, ignored -> ConcurrentHashMap.newKeySet()).add(userName);
            removePlayerReconnectDeadline(roomId, userName);
            lastPlayerRooms.remove(userName);
            gameLobbyRoomByUsername.remove(userName);
            persistCurrentRoomLifecycle(room);
        }

        sendRoomUpdate(room);

        sendTextMessage(player.getSession(), "[KICKED]");
        sendGlobalChatHistory(player.getSession());
        sendTextMessage(player.getSession(), KICKED_REJOIN_MESSAGE);

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
