// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { WSUtils } from "../../pages/GamePage.tsx";
import type { CardTypeGame } from "../../utils/types.ts";
import CardStack from "./CardStack.tsx";

vi.mock("../Card.tsx", () => ({
    default: ({ wsUtils }: { wsUtils?: WSUtils }) => (
        <div data-testid="stack-card" data-has-websocket={Boolean(wsUtils)} />
    ),
}));

vi.mock("react-awesome-reveal", () => ({
    Fade: ({ children }: { children: ReactNode }) => children,
}));

const card = {
    id: "target-card",
    name: "Target Digimon",
    isFaceUp: true,
    isTilted: false,
} as CardTypeGame;

const wsUtils = {
    matchInfo: { gameId: "player1‗player2", user: "player1", opponentName: "player2" },
    sendMessage: vi.fn(),
} as unknown as WSUtils;

describe("CardStack opponent targeting support", () => {
    afterEach(cleanup);

    it.each(["opponentDigi1", "opponentDigi17"])(
        "passes WebSocket utilities to an opponent card at %s",
        (location) => {
            render(
                <CardStack
                    cards={[card]}
                    location={location}
                    opponentSide
                    wsUtils={wsUtils}
                />
            );

            expect(screen.getByTestId("stack-card").getAttribute("data-has-websocket")).toBe("true");
        }
    );
});
