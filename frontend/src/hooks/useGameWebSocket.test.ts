import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Emote, useGameUIStates } from "./useGameUIStates.ts";
import { useGameBoardStates } from "./useGameBoardStates.ts";
import useGameWebSocket from "./useGameWebSocket.ts";

const websocketMock = vi.hoisted(() => ({
    options: undefined as { onMessage: (event: MessageEvent<string>) => void } | undefined,
    sendMessage: vi.fn(),
}));

vi.mock("react-use-websocket", () => ({
    default: (_url: string, options: { onMessage: (event: MessageEvent<string>) => void }) => {
        websocketMock.options = options;
        return { sendMessage: websocketMock.sendMessage };
    },
}));

vi.mock("./useSound.ts", () => ({
    useSound: (selector: (state: Record<string, () => void>) => unknown) =>
        selector(
            new Proxy(
                {},
                {
                    get: () => vi.fn(),
                }
            ) as Record<string, () => void>
        ),
}));

function receive(data: string) {
    act(() => websocketMock.options?.onMessage({ data } as MessageEvent<string>));
}

describe("useGameWebSocket resolving-effects synchronization", () => {
    beforeEach(() => {
        websocketMock.options = undefined;
        websocketMock.sendMessage.mockReset();
        useGameUIStates.setState({
            isResolvingEffects: false,
            isOpponentResolvingEffects: false,
            opponentEmote: null,
        });
        useGameBoardStates.setState({ gameId: "player-one‗player-two", isOpponentOnline: true });
    });

    function mountHook() {
        return renderHook(() =>
            useGameWebSocket({ clearAttackAnimation: null, restartAttackAnimation: vi.fn() })
        );
    }

    it("allows both players to resolve independently", () => {
        mountHook();
        act(() => useGameUIStates.getState().setIsResolvingEffects(true));
        receive("[RESOLVING_EFFECTS]:true");

        expect(useGameUIStates.getState().isResolvingEffects).toBe(true);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(true);

        receive("[MY_RESOLVING_EFFECTS]:false");
        expect(useGameUIStates.getState().isResolvingEffects).toBe(false);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(true);
    });

    it("does not clear the local player's state when the opponent finishes", () => {
        mountHook();
        act(() => useGameUIStates.getState().setIsResolvingEffects(true));
        receive("[RESOLVING_EFFECTS]:true");
        receive("[RESOLVING_EFFECTS]:false");

        expect(useGameUIStates.getState().isResolvingEffects).toBe(true);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(false);
    });

    it("restores both persisted statuses from reconnect synchronization", () => {
        mountHook();
        receive("[MY_RESOLVING_EFFECTS]:true");
        receive("[RESOLVING_EFFECTS]:true");

        expect(useGameUIStates.getState().isResolvingEffects).toBe(true);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(true);
    });

    it("clears the opponent status immediately when the opponent disconnects", () => {
        mountHook();
        receive("[RESOLVING_EFFECTS]:true");
        receive("[OPPONENT_DISCONNECTED]");

        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(false);
        expect(useGameBoardStates.getState().isOpponentOnline).toBe(false);
    });

    it("clears stale statuses when a new game or rematch starts", () => {
        mountHook();
        act(() =>
            useGameUIStates.setState({ isResolvingEffects: true, isOpponentResolvingEffects: true })
        );

        receive("[START_GAME]");

        expect(useGameUIStates.getState().isResolvingEffects).toBe(false);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(false);
    });

    it("clears local state when leaving the game", () => {
        const { unmount } = mountHook();
        act(() =>
            useGameUIStates.setState({ isResolvingEffects: true, isOpponentResolvingEffects: true })
        );

        unmount();

        expect(useGameUIStates.getState().isResolvingEffects).toBe(false);
        expect(useGameUIStates.getState().isOpponentResolvingEffects).toBe(false);
    });

    it("discards a hidden opponent emote when resolving finishes", () => {
        mountHook();
        receive("[RESOLVING_EFFECTS]:true");
        act(() => useGameUIStates.getState().setOpponentEmote(Emote.HELLO));
        receive("[RESOLVING_EFFECTS]:false");

        expect(useGameUIStates.getState().opponentEmote).toBeNull();
    });
});
