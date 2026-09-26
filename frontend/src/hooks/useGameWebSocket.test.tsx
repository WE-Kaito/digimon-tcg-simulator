// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import { useGameUIStates } from "./useGameUIStates.ts";

const websocketMock = vi.hoisted(() => ({
    onMessage: undefined as ((event: { data: string }) => void) | undefined,
    sendMessage: vi.fn(),
}));

vi.mock("react-use-websocket", () => ({
    default: vi.fn(
        (_url: string, options: { onMessage?: (event: { data: string }) => void }) => {
            websocketMock.onMessage = options.onMessage;
            return { sendMessage: websocketMock.sendMessage };
        }
    ),
}));

vi.mock("./useSound.ts", () => ({
    useSound: (selector: (state: Record<string, () => void>) => unknown) =>
        selector(new Proxy({}, { get: () => vi.fn() }) as Record<string, () => void>),
}));

vi.mock("../utils/toasts.ts", () => ({ notifyInfo: vi.fn() }));

import useGameWebSocket from "./useGameWebSocket.ts";

describe("useGameWebSocket surrender handling", () => {
    beforeEach(() => {
        websocketMock.onMessage = undefined;
        websocketMock.sendMessage.mockClear();
        localStorage.clear();
        useGameBoardStates.getState().setGameId("player-one‗player-two");
        useGameUIStates.setState({ isEndDialogOpen: false, endDialogText: "" });
    });

    it("clears the opponent's persisted game ID when surrender is received", () => {
        renderHook(() =>
            useGameWebSocket({
                clearAttackAnimation: null,
                restartAttackAnimation: vi.fn(),
            })
        );

        act(() => websocketMock.onMessage?.({ data: "[SURRENDER]" }));

        expect(useGameBoardStates.getState().gameId).toBe("");
        expect(localStorage.getItem("gameId")).toBeNull();
        expect(useGameUIStates.getState().isEndDialogOpen).toBe(true);
        expect(useGameUIStates.getState().endDialogText).toBe("🎉 Your opponent surrendered!");
    });
});
