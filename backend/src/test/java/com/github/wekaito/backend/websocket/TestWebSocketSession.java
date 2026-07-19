package com.github.wekaito.backend.websocket;

import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketExtension;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.InetSocketAddress;
import java.net.URI;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TestWebSocketSession implements WebSocketSession {
    private final String id;
    private final Principal principal;
    private final List<String> messages = new ArrayList<>();
    private boolean open = true;
    private int textMessageSizeLimit;
    private int binaryMessageSizeLimit;

    public TestWebSocketSession(String id, String username) {
        this.id = id;
        this.principal = () -> username;
    }

    public List<String> getMessages() {
        return messages;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public URI getUri() {
        return URI.create("ws://localhost/test");
    }

    @Override
    public HttpHeaders getHandshakeHeaders() {
        return HttpHeaders.EMPTY;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return new HashMap<>();
    }

    @Override
    public Principal getPrincipal() {
        return principal;
    }

    @Override
    public InetSocketAddress getLocalAddress() {
        return null;
    }

    @Override
    public InetSocketAddress getRemoteAddress() {
        return null;
    }

    @Override
    public String getAcceptedProtocol() {
        return null;
    }

    @Override
    public void setTextMessageSizeLimit(int messageSizeLimit) {
        textMessageSizeLimit = messageSizeLimit;
    }

    @Override
    public int getTextMessageSizeLimit() {
        return textMessageSizeLimit;
    }

    @Override
    public void setBinaryMessageSizeLimit(int messageSizeLimit) {
        binaryMessageSizeLimit = messageSizeLimit;
    }

    @Override
    public int getBinaryMessageSizeLimit() {
        return binaryMessageSizeLimit;
    }

    @Override
    public List<WebSocketExtension> getExtensions() {
        return List.of();
    }

    @Override
    public void sendMessage(WebSocketMessage<?> message) {
        messages.add(message.getPayload().toString());
    }

    @Override
    public boolean isOpen() {
        return open;
    }

    @Override
    public void close() {
        open = false;
    }

    @Override
    public void close(CloseStatus status) {
        open = false;
    }
}
