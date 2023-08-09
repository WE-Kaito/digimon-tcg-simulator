package com.github.wekaito.backend.websocket;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class PlayerTest {

    @Test
    void testPlayerInitialization() {
        // GIVEN
        String username = "testUser";
        String avatar = "avatar.png";

        // WHEN
        Player player = new Player(username, avatar);

        // THEN
        assertThat(player.username()).isEqualTo(username);
        assertThat(player.avatarName()).isEqualTo(avatar);
    }

    @Test
    void testEquals() {

        Player player1 = new Player("testUser1", "avatar1.png");
        Player player2 = new Player("testUser1", "avatar1.png");

        assertEquals(player1, player2);
    }

    @Test
    void testNotEquals() {
        Player player1 = new Player("testUser1", "avatar1.png");
        Player player2 = new Player("testUser1", "avatar2.png");

        assertNotEquals(player1, player2);
    }

    @Test
    void testHashCode() {
        Player player1 = new Player("testUser1", "avatar1.png");
        Player player2 = new Player("testUser1", "avatar1.png");

        assertEquals(player1.hashCode(), player2.hashCode());
    }

    @Test
    void testNotEqualsHashCode() {
        Player player1 = new Player("testUser1", "avatar1.png");
        Player player2 = new Player("testUser1", "avatar2.png");

        assertNotEquals(player1.hashCode(), player2.hashCode());
    }

    @Test
    void testToString() {
        // GIVEN
        String username = "testUser";
        String avatar = "avatar.png";
        Player player = new Player(username, avatar);

        // WHEN
        String playerString = player.toString();

        // THEN
        assertThat(playerString).contains(username).contains(avatar);
    }
}
