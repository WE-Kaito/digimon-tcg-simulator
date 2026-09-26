import { describe, expect, it, vi } from "vitest";
import { handleReconnectStatus } from "./reconnectStatus.ts";

describe("handleReconnectStatus", () => {
    it("enables reconnect only when the server room matches the persisted game ID", () => {
        const setIsRejoinable = vi.fn();
        const setGameId = vi.fn();

        handleReconnectStatus(
            "[RECONNECT_ENABLED]:player-one‗player-two",
            "player-one‗player-two",
            setIsRejoinable,
            setGameId
        );

        expect(setIsRejoinable).toHaveBeenCalledWith(true);
        expect(setGameId).not.toHaveBeenCalled();
    });

    it("does not enable reconnect when there is no persisted game ID", () => {
        const setIsRejoinable = vi.fn();

        handleReconnectStatus("[RECONNECT_ENABLED]:player-one‗player-two", "", setIsRejoinable, vi.fn());

        expect(setIsRejoinable).toHaveBeenCalledWith(false);
    });

    it("disables reconnect and clears a stale persisted game ID", () => {
        const setIsRejoinable = vi.fn();
        const setGameId = vi.fn();

        handleReconnectStatus("[RECONNECT_DISABLED]", "player-one‗player-two", setIsRejoinable, setGameId);

        expect(setIsRejoinable).toHaveBeenCalledWith(false);
        expect(setGameId).toHaveBeenCalledWith("");
    });
});
