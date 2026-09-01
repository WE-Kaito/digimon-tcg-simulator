package com.github.wekaito.backend.websocket.lobby;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomSnapshotRepository extends MongoRepository<RoomSnapshot, String> {
}
