package com.github.wekaito.backend.websocket.lobby;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.web.socket.WebSocketSession;

class QuickPlayQueue {
    private final List<WebSocketSession> queue = new ArrayList<>();

    public synchronized void add(WebSocketSession session) {
        if (!queue.contains(session)) queue.add(session);
    }

    public synchronized void remove(WebSocketSession session) {
        queue.remove(session);
    }

    public synchronized WebSocketSession drawRandomSession() {
        if (queue.isEmpty()) return null;

        int randomIndex = ThreadLocalRandom.current().nextInt(queue.size());

        return queue.remove(randomIndex);
    }

    public synchronized boolean isEmpty() {
        return queue.isEmpty();
    }

    public synchronized int size() {
        return queue.size();
    }
}
