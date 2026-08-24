// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useInviteCooldowns from "./useInviteCooldowns.ts";

describe("useInviteCooldowns", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
        vi.setSystemTime(new Date("2026-07-21T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("updates every displayed second and clears the cooldown after ten seconds", () => {
        const { result } = renderHook(() => useInviteCooldowns());

        act(() => result.current.startInviteCooldown("other-player"));

        expect(result.current.isInviteCoolingDown("other-player")).toBe(true);
        expect(result.current.getInviteCooldownSeconds("other-player")).toBe(10);

        for (let expectedSeconds = 9; expectedSeconds >= 1; expectedSeconds--) {
            act(() => vi.advanceTimersByTime(1000));
            expect(result.current.getInviteCooldownSeconds("other-player")).toBe(expectedSeconds);
            expect(result.current.isInviteCoolingDown("other-player")).toBe(true);
        }

        act(() => vi.advanceTimersByTime(1000));

        expect(result.current.getInviteCooldownSeconds("other-player")).toBe(0);
        expect(result.current.isInviteCoolingDown("other-player")).toBe(false);
        expect(result.current.inviteCooldownPlayers.has("other-player")).toBe(false);
    });

    it("tracks cooldowns independently for different players", () => {
        const { result } = renderHook(() => useInviteCooldowns());

        act(() => result.current.startInviteCooldown("player-one"));
        act(() => vi.advanceTimersByTime(3000));
        act(() => result.current.startInviteCooldown("player-two"));

        expect(result.current.getInviteCooldownSeconds("player-one")).toBe(7);
        expect(result.current.getInviteCooldownSeconds("player-two")).toBe(10);
    });
});
