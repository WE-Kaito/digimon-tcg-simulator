package com.github.wekaito.backend.websocket;

public record Player(String username, String avatarName) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Player player = (Player) o;
        return username.equals(player.username) &&
                avatarName.equals(player.avatarName);
    }

    @Override
    public int hashCode() {
        int result = username.hashCode();
        result = 31 * result + avatarName.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Player{" +
                "username='" + username + '\'' +
                ", avatarName='" + avatarName + '\'' +
                '}';
    }
}
