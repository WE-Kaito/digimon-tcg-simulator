package com.github.wekaito.backend.websocket;

import com.github.wekaito.backend.Card;
import java.util.Arrays;

public record Player(String username, String avatarName, Card[] deck) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Player player = (Player) o;
        return username.equals(player.username) &&
                avatarName.equals(player.avatarName) &&
                Arrays.equals(deck, player.deck);
    }

    @Override
    public int hashCode() {
        int result = username.hashCode();
        result = 31 * result + avatarName.hashCode();
        result = 31 * result + Arrays.hashCode(deck);
        return result;
    }

    @Override
    public String toString() {
        return "Player{" +
                "username='" + username + '\'' +
                ", avatarName='" + avatarName + '\'' +
                ", deck=" + Arrays.toString(deck) +
                '}';
    }
}
