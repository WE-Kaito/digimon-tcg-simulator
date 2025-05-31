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

@Getter
@Service
@RequiredArgsConstructor
public class LobbyService extends TextWebSocketHandler {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<WebSocketSession, Long> lastHeartbeatTimestamps = new HashMap<>();

    private final QuickPlayQueue quickPlayQueue = new QuickPlayQueue();

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> globalActiveSessions = new HashSet<>();
    private final Set<Room> rooms = new HashSet<>();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    @Autowired
    private GameService gameService;

    private synchronized void sendTextMessage(WebSocketSession session, String message) throws IOException {
        if (session == null || !session.isOpen()) return;
        session.sendMessage(new TextMessage(message));
    }

    private synchronized void cleanupUserSession(String username) {
        globalActiveSessions.removeIf(s -> Objects.equals(Objects.requireNonNull(s.getPrincipal()).getName(), username));
        // Also check in rooms
        for (Room room : rooms) {
            room.getPlayers().removeIf(player -> player.getName().equals(username));
        }
        rooms.removeIf(room -> room.getPlayers().isEmpty());
    }

    @Override
    public synchronized void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.isEmpty() || deckService.getDeckById(activeDeck) == null) {
            sendTextMessage(session, "[NO_ACTIVE_DECK]");
            return;
        }

        List<Card> deckCards = deckService.getDeckCardsById(activeDeck);
        if (deckCards.stream().anyMatch(c -> "1110101".equals(c.cardNumber()))) { // fallbackCardNumber defined in useGeneralStates.ts
            sendTextMessage(session, "[BROKEN_DECK]");
            return;
        }

        cleanupUserSession(username);

        if (globalActiveSessions.stream().anyMatch(s -> Objects.equals(Objects.requireNonNull(s.getPrincipal()).getName(), username))) {
            sendTextMessage(session, warning);
            System.out.println("already connected in global: " + username);
            sendTextMessage(session, "[SESSION_ALREADY_CONNECTED]");
            return;
        }

//        if (rooms.stream().anyMatch(room -> room.getPlayers().stream().anyMatch(player -> player.getName().equals(username)))) {
//            sendTextMessage(session, warning);
//            System.out.println("already connected in room: " + username);
//            sendTextMessage(session, "[SESSION_ALREADY_CONNECTED]");
//            return;
//        }

        globalActiveSessions.add(session);

        List<Room> openRooms = rooms.stream().filter(r -> r.getPlayers().size() == 1).toList();
        List <RoomDTO> openRoomsDTO = openRooms.stream().map(this::getRoomDTO).toList();

        sendTextMessage(session, "[ROOMS]:" + objectMapper.writeValueAsString(openRoomsDTO));
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Join our Discord!");
        sendTextMessage(session, "[USER_COUNT]:" + getTotalSessionCount());
    }

    @Override
    public synchronized void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();

        synchronized (rooms) {
            Room playerRoom = rooms.stream()
                    .filter(room -> room.getPlayers().stream().anyMatch(p -> p.getName().equals(username)))
                    .findFirst()
                    .orElse(null);

            if (playerRoom != null) {
                playerRoom.getPlayers().removeIf(player -> player.getName().equals(username));
                if (playerRoom.getPlayers().isEmpty()) {
                    rooms.remove(playerRoom);
                    broadcastRooms();
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

    private void startGame(String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        String roomId = parts[1];
        String gameId = parts[2];

        Room room = getRoomById(roomId);
        assert room != null;

        for (LobbyPlayer player : room.getPlayers()) {
            sendTextMessage(player.getSession(), "[START_GAME]:" + gameId);
        }
    }

    @Scheduled(fixedRate = 15000)
    private synchronized void cleanupStaleSessions() throws IOException {
        long currentTime = System.currentTimeMillis();
        long timeoutThreshold = 15000; // 15 seconds timeout (user sends heartbeat every 5 seconds)

        // globalActiveSessions
        List<WebSocketSession> staleSessions = new ArrayList<>();
        for (WebSocketSession session : globalActiveSessions) {
            Long lastHeartbeat = lastHeartbeatTimestamps.get(session);
            if (lastHeartbeat != null && (currentTime - lastHeartbeat > timeoutThreshold)) {
                 System.out.println("Session considered stale - User: " + Objects.requireNonNull(session.getPrincipal()).getName() +
                     " Last heartbeat: " + (currentTime - lastHeartbeat) + "ms ago");
                staleSessions.add(session);
            }
        }

        for (WebSocketSession session : staleSessions) {
            try {
                session.close(CloseStatus.SESSION_NOT_RELIABLE);
            } catch (IOException e) {
                globalActiveSessions.remove(session);
                lastHeartbeatTimestamps.remove(session);
            }
        }

        // sessions in rooms
        for (Room room : rooms) {
            List<LobbyPlayer> stalePlayers = new ArrayList<>();
            for (LobbyPlayer player : room.getPlayers()) {
                WebSocketSession playerSession = player.getSession();
                Long lastHeartbeat = lastHeartbeatTimestamps.get(playerSession);
                if (lastHeartbeat != null && (currentTime - lastHeartbeat > timeoutThreshold)) {
                    stalePlayers.add(player);
                }
            }

            for (LobbyPlayer player : stalePlayers) {
                 afterConnectionClosed(player.getSession(), CloseStatus.SESSION_NOT_RELIABLE);
                 player.getSession().close(CloseStatus.SESSION_NOT_RELIABLE);
            }
        }
    }

    @Scheduled(fixedRate = 10000) // 10 seconds
    private synchronized void sendHeartbeat() throws IOException {
        broadcastUserCount();
    }

    @Scheduled(fixedRate = 3000) // 3 seconds
    private synchronized void sendReconnectInfo() throws IOException {
        checkForRejoinableGameRoom();
    }

    @Scheduled(fixedRate = 5000) // 5 seconds
    private synchronized void assignQuickPlay() throws IOException {
        startGameQuickPlay();
    }

    private void createRoom(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 4);

        String roomName = parts[1];
        String roomPassword = parts[2];
        Format roomFormat = Format.valueOf(parts[3]);

        Room room = new Room(
                UUID.randomUUID().toString(),
                roomName,
                Objects.requireNonNull(session.getPrincipal()).getName(),
                roomFormat, roomPassword,
                new ArrayList<>());

        rooms.add(room);

        joinRoom(session, room.getId(), true);
        broadcastRooms();
    }

    private synchronized void broadcastRooms() throws IOException {
        // Broadcast to sessions in lobby
        for (WebSocketSession session : globalActiveSessions) {
            // change this when rooms allow more users:
            List<Room> roomsWithOnlyHosts = rooms.stream().filter(r -> r.getPlayers().size() == 1).toList();
            List<RoomDTO> roomDTOs = roomsWithOnlyHosts.stream().map(this::getRoomDTO).toList();

            String roomsJson = objectMapper.writeValueAsString(roomDTOs);

            sendTextMessage(session, "[ROOMS]:" + roomsJson);
        }
    }

    private synchronized void broadcastUserCount() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            sendTextMessage(session, "[USER_COUNT]:" + getTotalSessionCount());
        }
    }

    private synchronized void startGameQuickPlay() throws IOException {
        if (quickPlayQueue.size() < 2) return;

        WebSocketSession player1 = quickPlayQueue.drawRandomSession();
        WebSocketSession player2 = quickPlayQueue.drawRandomSession();

        if (player1 == null || player2 == null) return;

        String newGameId = Objects.requireNonNull(player1.getPrincipal()).getName() + "‗" + Objects.requireNonNull(player2.getPrincipal()).getName();

        globalActiveSessions.remove(player1);
        globalActiveSessions.remove(player2);

        sendTextMessage(player1, "[START_GAME]:" + newGameId);
        sendTextMessage(player2, "[START_GAME]:" + newGameId);

        startGameQuickPlay();
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

    private synchronized void joinRoom(WebSocketSession session, String roomId, boolean host) throws IOException {
        Room room = getRoomById(roomId);

        if (room == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room not found.");
            return;
        }
        if (room.getPlayers().size() >= 3) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Room is full.");
            return;
        }

        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        LobbyPlayer player = new LobbyPlayer(session, username, host);

        room.getPlayers().add(player);

        sendRoomUpdate(room, true);

        String roomJson = objectMapper.writeValueAsString(getRoomDTO(room));
        sendTextMessage(session, "[JOIN_ROOM]:" + roomJson);
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have joined the room " + room.getName() + ".");

        broadcastRooms();
    }

    private void handleJoinRoomAttempt(WebSocketSession session, String roomId) throws IOException {
        String password = getRoomById(roomId).getPassword();
        if (password != null && !password.isEmpty()) sendTextMessage(session, "[PROMPT_PASSWORD]");
        else joinRoom(session, roomId, false);
    }

    private void handlePasswordAttempt(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String passwordInput = parts[2];

        String password = getRoomById(roomId).getPassword();
        assert password != null;

        if (password.equals(passwordInput)) joinRoom(session, roomId, false);
        else sendTextMessage(session, "[WRONG_PASSWORD]");
    }

    private synchronized void leaveRoom(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String userName = parts[2];

        Room room = getRoomById(roomId);
        assert room != null;
        room.getPlayers().removeIf(p -> p.getName().equals(userName));
        if(room.getHostName().equals(userName) && !room.getPlayers().isEmpty()) {
            LobbyPlayer remainingPlayer = room.getPlayers().get(0);
            room.setHostName(remainingPlayer.getName());
            remainingPlayer.setReady(true);
        }

        if (room.getPlayers().isEmpty()) rooms.remove(room);
        else sendRoomUpdate(room);

        sendTextMessage(session, "[LEAVE_ROOM]");
        sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: You have left the room" + room.getName() + ".");

        broadcastRooms();
    }

    private void toggleReady(WebSocketSession session, String roomId) throws IOException {
        Room room = getRoomById(roomId);
        assert room != null;

        LobbyPlayer player = room.getPlayers().stream().filter(p -> p.getSession().equals(session)).findFirst().orElse(null);
        assert player != null;

        player.ready = !player.isReady();
        sendRoomUpdate(room);
        sendTextMessage(session, "[SUCCESS]");
    }

    private void kickPlayer(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String userName = parts[2];

        Room room = getRoomById(roomId);

        LobbyPlayer player = room.getPlayers().stream().filter(p -> p.getName().equals(userName)).findFirst().orElse(null);

        if (player == null) {
            sendTextMessage(session, "[CHAT_MESSAGE]:【SERVER】: Player not found in the room.");
            return;
        }

        room.getPlayers().remove(player);

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
        return rooms.stream().filter(r -> r.getId().equals(roomId)).findFirst().orElse(null);
    }
}
