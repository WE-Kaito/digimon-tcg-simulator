package com.github.wekaito.backend.websocket.game.models;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class GameRoomEmptyEvent extends ApplicationEvent {
    private final String roomId;

    public GameRoomEmptyEvent(Object source, String roomId) {
        super(source);
        this.roomId = roomId;
    }

}
