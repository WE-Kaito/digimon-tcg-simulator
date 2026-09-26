import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

export type PlayerStatus = "LOBBY" | "DECKBUILDING" | "TESTING";

export default function usePlayerPresence(status: PlayerStatus) {
    const currentPort = window.location.port;
    const currentUrl = window.location.origin.replace("https://", "");
    const websocketBaseURL =
        currentPort === "5173" ? "ws://localhost:8080/api/ws/lobby" : `wss://${currentUrl}/api/ws/lobby`;
    const websocketURL = `${websocketBaseURL}?status=${status}`;

    const websocket = useWebSocket(websocketURL, {
        shouldReconnect: () => true,
        onOpen: (event) => (event.target as WebSocket).send(`/setPlayerStatus:${status}`),
    });

    useEffect(() => {
        if (websocket.readyState !== WebSocket.OPEN) return;

        websocket.sendMessage("/heartbeat/");
        const heartbeatInterval = window.setInterval(() => websocket.sendMessage("/heartbeat/"), 10_000);
        return () => window.clearInterval(heartbeatInterval);
    }, [websocket.readyState, websocket.sendMessage]);
}
