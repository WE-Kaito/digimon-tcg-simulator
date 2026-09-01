package com.github.wekaito.backend.websocket.lobby;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("custom_rooms")
public record RoomSnapshot(
        @Id String id,
        String name,
        String hostName,
        boolean restrictionsApplied,
        String password,
        @Indexed(expireAfter = "0s") Instant expiresAt
) {
    static RoomSnapshot from(Room room, Instant expiresAt) {
        return new RoomSnapshot(
                room.getId(),
                room.getName(),
                room.getHostName(),
                room.isRestrictionsApplied(),
                room.getPassword(),
                expiresAt
        );
    }
}
