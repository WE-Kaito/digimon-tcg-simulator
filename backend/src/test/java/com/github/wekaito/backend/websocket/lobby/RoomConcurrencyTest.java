package com.github.wekaito.backend.websocket.lobby;

import org.junit.jupiter.api.Test;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class RoomConcurrencyTest {

    @Test
    void onlyOneConcurrentStartTransitionWins() throws Exception {
        Room room = new Room("room-id", "Room", "host", false, "", List.of());
        CyclicBarrier start = new CyclicBarrier(3);
        CountDownLatch finished = new CountDownLatch(2);
        AtomicInteger winners = new AtomicInteger();

        Runnable contender = () -> {
            try {
                start.await();
                if (room.transition(Room.State.LOBBY, Room.State.STARTING)) winners.incrementAndGet();
            } catch (Exception exception) {
                throw new RuntimeException(exception);
            } finally {
                finished.countDown();
            }
        };
        new Thread(contender).start();
        new Thread(contender).start();
        start.await();
        finished.await();

        assertThat(winners.get()).isEqualTo(1);
        assertThat(room.getState()).isEqualTo(Room.State.STARTING);
    }

    @Test
    void snapshotsRemainStableWhileBothPlayersReconnect() throws Exception {
        Room room = new Room(
                "room-id", "Room", "host", false, "",
                new ArrayList<>(List.of(
                        new LobbyPlayer(session("host-0", "host"), "host", true),
                        new LobbyPlayer(session("guest-0", "guest"), "guest", false)
                ))
        );
        CyclicBarrier start = new CyclicBarrier(3);
        CountDownLatch finished = new CountDownLatch(2);
        AtomicReference<Throwable> failure = new AtomicReference<>();

        Thread hostReconnect = new Thread(() -> replaceRepeatedly(room, "host", start, finished, failure));
        Thread guestReconnect = new Thread(() -> replaceRepeatedly(room, "guest", start, finished, failure));
        hostReconnect.start();
        guestReconnect.start();
        start.await();

        for (int i = 0; i < 1_000; i++) {
            List<LobbyPlayer> snapshot = room.getPlayers();
            assertThat(snapshot).extracting(LobbyPlayer::getName).doesNotHaveDuplicates();
            snapshot.forEach(LobbyPlayer::getGeneration);
        }
        finished.await();

        assertThat(failure.get()).isNull();
        assertThat(room.getPlayers()).extracting(LobbyPlayer::getName)
                .containsExactlyInAnyOrder("host", "guest");
    }

    private void replaceRepeatedly(Room room, String username, CyclicBarrier start,
                                   CountDownLatch finished, AtomicReference<Throwable> failure) {
        try {
            start.await();
            for (int i = 1; i <= 1_000; i++) {
                room.replacePlayer(
                        session(username + "-" + i, username),
                        username,
                        username.equals("host"));
            }
        } catch (Throwable throwable) {
            failure.compareAndSet(null, throwable);
        } finally {
            finished.countDown();
        }
    }

    private WebSocketSession session(String id, String username) {
        Principal principal = () -> username;
        return (WebSocketSession) Proxy.newProxyInstance(
                WebSocketSession.class.getClassLoader(),
                new Class<?>[]{WebSocketSession.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "getId" -> id;
                    case "getPrincipal" -> principal;
                    case "isOpen" -> true;
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> null;
                });
    }
}
