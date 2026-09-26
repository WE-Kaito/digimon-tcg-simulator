import useWebSocket from "react-use-websocket";

export type PlayerStatus = "LOBBY" | "DECKBUILDING" | "TESTING";

export default function usePlayerPresence(status: PlayerStatus) {
    const currentPort = window.location.port;
    const currentUrl = window.location.origin.replace("https://", "");
    const websocketBaseURL =
        currentPort === "5173" ? "ws://localhost:8080/api/ws/lobby" : `wss://${currentUrl}/api/ws/lobby`;
    const websocketURL = `${websocketBaseURL}?status=${status}`;

    useWebSocket(websocketURL, {
        shouldReconnect: () => true,
        onOpen: (event) => (event.target as WebSocket).send(`/setPlayerStatus:${status}`),
        onMessage: (event) => {
            if (typeof event.data === "string" && event.data.startsWith("[USER_COUNT]:")) {
                (event.target as WebSocket).send("/heartbeat/");
            }
        },
    });
}
