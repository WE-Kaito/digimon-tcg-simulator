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

    private final QuickPlayQueue quickPlayQueue = new QuickPlayQueue();

    private final MongoUserDetailsService mongoUserDetailsService;
    private final DeckService deckService;
    private final CardService cardService;

    private final Set<WebSocketSession> globalActiveSessions = new HashSet<>();
    private final Set<Room> rooms = new HashSet<>();

    private final String warning = "[CHAT_MESSAGE]:【SERVER】: ⚠ The server detected multiple connections for the same user. Make sure to only use one tab per account. ⚠";

    @Autowired
    private GameService gameService;

    @Override
    public synchronized void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        String activeDeck = mongoUserDetailsService.getActiveDeck(username);
        if (activeDeck.equals("") || deckService.getDeckById(activeDeck) == null) {
            session.sendMessage(new TextMessage("[NO_ACTIVE_DECK]"));
            return;
        }

        List<Card> deckCards = deckService.getDeckCardsById(activeDeck);
        if (deckCards.stream().anyMatch(c -> "1110101".equals(c.cardNumber()))) { // fallbackCardNumber defined in useGeneralStates.ts
            session.sendMessage(new TextMessage("[BROKEN_DECK]"));
            return;
        }

        if (globalActiveSessions.stream().anyMatch(s -> Objects.equals(Objects.requireNonNull(s.getPrincipal()).getName(), username))) {
            session.sendMessage(new TextMessage(warning));
            // System.out.println("already connected in global: " + username);
            // session.sendMessage(new TextMessage("[SESSION_ALREADY_CONNECTED]"));
            // return;
        }

        if (rooms.stream().anyMatch(room -> room.getPlayers().stream().anyMatch(player -> player.getName().equals(username)))) {
            session.sendMessage(new TextMessage(warning));
            // System.out.println("already connected in room: " + username);
            // session.sendMessage(new TextMessage("[SESSION_ALREADY_CONNECTED]"));
            // return;
        }

        globalActiveSessions.add(session);
        List<Room> openRooms = rooms.stream().filter(r -> r.getPlayers().size() == 1).toList();
        List <RoomDTO> openRoomsDTO = openRooms.stream().map(this::getRoomDTO).toList();
        session.sendMessage(new TextMessage("[ROOMS]:" + objectMapper.writeValueAsString(openRoomsDTO)));
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: Join our Discord!"));
        session.sendMessage(new TextMessage("[USER_COUNT]:" + getTotalSessionCount()));
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

        if (payload.equals("/heartbeat/")) return;

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
            player.getSession().sendMessage(new TextMessage("[START_GAME]:" + gameId));
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

    private void broadcastRooms() throws IOException {
        // Broadcast to sessions in lobby
        for (WebSocketSession session : globalActiveSessions) {
            // change this when rooms allow more users:
            List<Room> roomsWithOnlyHosts = rooms.stream().filter(r -> r.getPlayers().size() == 1).toList();
            List<RoomDTO> roomDTOs = roomsWithOnlyHosts.stream().map(this::getRoomDTO).toList();

            String roomsJson = objectMapper.writeValueAsString(roomDTOs);

            session.sendMessage(new TextMessage("[ROOMS]:" + roomsJson));
        }
    }

    private void broadcastUserCount() throws IOException {
        // Broadcast to sessions in lobby
        for (WebSocketSession session : globalActiveSessions) {
            session.sendMessage(new TextMessage("[USER_COUNT]:" + (getTotalSessionCount())));
        }

        // Broadcast to sessions in rooms
        List<WebSocketSession> sessionsInRooms = rooms.stream()
                .flatMap(room -> room.getPlayers().stream())
                .map(LobbyPlayer::getSession)
                .toList();
        for (WebSocketSession session : sessionsInRooms) {
            session.sendMessage(new TextMessage("[USER_COUNT]:" + (getTotalSessionCount())));
        }
    }

    private void startGameQuickPlay() throws IOException {
        if (quickPlayQueue.size() < 2) return;

        WebSocketSession player1 = quickPlayQueue.drawRandomSession();
        WebSocketSession player2 = quickPlayQueue.drawRandomSession();

        if (player1 == null || player2 == null) return;

        String newGameId = Objects.requireNonNull(player1.getPrincipal()).getName() + "‗" + Objects.requireNonNull(player2.getPrincipal()).getName();

        globalActiveSessions.remove(player1);
        globalActiveSessions.remove(player2);

        player1.sendMessage(new TextMessage("[START_GAME]:" + newGameId));
        player2.sendMessage(new TextMessage("[START_GAME]:" + newGameId));

        startGameQuickPlay();
    }

    private void checkForRejoinableGameRoom() throws IOException {
        for (WebSocketSession session : globalActiveSessions) {
            String matchingRoomId = gameService.gameRooms.keySet().stream()
                    .filter(roomId -> roomId.contains(Objects.requireNonNull(session.getPrincipal()).getName()))
                    .findFirst().orElse(null);
            if (matchingRoomId != null) session.sendMessage(new TextMessage("[RECONNECT_ENABLED]:" + matchingRoomId));
            else session.sendMessage(new TextMessage("[RECONNECT_DISABLED]"));
        }
    }

    private int getTotalSessionCount() {
        int roomSessionCount = rooms.stream().mapToInt(r -> r.getPlayers().size()).sum();
        int inGameSessionCount = gameService.gameRooms.values().stream().mapToInt(Set::size).sum();
        return globalActiveSessions.size() + roomSessionCount + inGameSessionCount;
    }

    private RoomDTO getRoomDTO(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getName(),
                room.getHostName(),
                room.getFormat(),
                room.getPassword().length() > 0,
                room.getPlayers().stream().map(p -> new LobbyPlayerDTO(
                        p.getName(),
                        mongoUserDetailsService.getAvatar(p.getName()),
                        p.isReady()))
                        .toList());
    }

    private void sendRoomUpdate(Room room, boolean playerJoined) throws IOException {
        String roomJson = objectMapper.writeValueAsString(getRoomDTO(room));
        for (LobbyPlayer p : room.getPlayers()) {
            p.getSession().sendMessage(new TextMessage("[ROOM_UPDATE]:" + roomJson));
            if (playerJoined) p.getSession().sendMessage(new TextMessage("[PLAYER_JOINED]"));
        }
    }

    private void sendRoomUpdate(Room room) throws IOException {
        sendRoomUpdate(room, false);
    }

    private void joinRoom(WebSocketSession session, String roomId, boolean host) throws IOException {
        Room room = getRoomById(roomId);

        if (room == null) {
            session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: Room not found."));
            return;
        }
        if (room.getPlayers().size() >= 3) {
            session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: Room is full."));
            return;
        }

        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        LobbyPlayer player = new LobbyPlayer(session, username, host);

        room.getPlayers().add(player);

        sendRoomUpdate(room, true);

        globalActiveSessions.remove(session);

        String roomJson = objectMapper.writeValueAsString(getRoomDTO(room));
        session.sendMessage(new TextMessage("[JOIN_ROOM]:" + roomJson));
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: You have joined the room."));

        broadcastRooms();
    }

    private void handleJoinRoomAttempt(WebSocketSession session, String roomId) throws IOException {
        String password = getRoomById(roomId).getPassword();
        assert password != null;
        if (password.length() > 0) {
            session.sendMessage(new TextMessage("[PROMPT_PASSWORD]"));
        } else {
            joinRoom(session, roomId, false);
        }
    }

    private void handlePasswordAttempt(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String passwordInput = parts[2];

        String password = getRoomById(roomId).getPassword();
        assert password != null;

        if (password.equals(passwordInput)) {
            joinRoom(session, roomId, false);
        } else {
            session.sendMessage(new TextMessage("[WRONG_PASSWORD]"));
        }
    }

    private void leaveRoom(WebSocketSession session, String payload) throws IOException {
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

        session.sendMessage(new TextMessage("[LEAVE_ROOM]"));
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: You have left the room."));

        globalActiveSessions.add(session);
        broadcastRooms();
    }

    private void toggleReady(WebSocketSession session, String roomId) throws IOException {
        Room room = getRoomById(roomId);
        assert room != null;

        LobbyPlayer player = room.getPlayers().stream().filter(p -> p.getSession().equals(session)).findFirst().orElse(null);
        assert player != null;

        player.ready = !player.isReady();
        sendRoomUpdate(room);
        session.sendMessage(new TextMessage("[SUCCESS]"));
    }

    private void kickPlayer(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":");
        String roomId = parts[1];
        String userName = parts[2];

        Room room = getRoomById(roomId);
        assert room != null;

        LobbyPlayer player = room.getPlayers().stream().filter(p -> p.getName().equals(userName)).findFirst().orElse(null);
        assert player != null;

        room.getPlayers().remove(player);

        sendRoomUpdate(room);

        player.getSession().sendMessage(new TextMessage("[KICKED]"));
        player.getSession().sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: You have been kicked from the room."));

        session.sendMessage(new TextMessage("[SUCCESS]"));
        session.sendMessage(new TextMessage("[CHAT_MESSAGE]:【SERVER】: You have kicked " + userName + " from the room."));

        globalActiveSessions.add(player.getSession());
        broadcastRooms();
    }

    private void handleChatMessage(WebSocketSession session, String payload) throws IOException {
        if (payload.substring("/chatMessage:".length()).trim().length() == 0) return;

        String username = Objects.requireNonNull(session.getPrincipal()).getName();
        TextMessage textMessage = new TextMessage("[CHAT_MESSAGE]:" + username + ": " + payload.substring("/chatMessage:".length()));

        for (WebSocketSession webSocketSession : globalActiveSessions) {
            webSocketSession.sendMessage(textMessage);
        }
    }

    private void handleRoomChatMessage(WebSocketSession session, String payload) throws IOException {
        String[] parts = payload.split(":", 3);
        String chatMessage = parts[1];
        String roomId = parts[2];
        String userName = Objects.requireNonNull(session.getPrincipal()).getName();

        Room room = getRoomById(roomId);
        assert room != null;

        for (LobbyPlayer player : room.getPlayers()) {
            player.getSession().sendMessage(new TextMessage("[CHAT_MESSAGE]:" + userName + ": " + chatMessage));
        }
    }

    private Room getRoomById(String roomId) {
        return rooms.stream().filter(r -> r.getId().equals(roomId)).findFirst().orElse(null);
    }
}
