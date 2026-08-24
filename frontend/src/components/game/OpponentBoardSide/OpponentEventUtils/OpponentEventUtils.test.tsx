import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Emote, useGameUIStates } from "../../../../hooks/useGameUIStates.ts";
import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import OpponentEventUtils from "./OpponentEventUtils.tsx";

vi.mock("lottie-react", () => ({ default: () => <div data-testid="starting-player" /> }));
vi.mock("../../EmoteRender.tsx", () => ({ default: () => <div>Opponent emote</div> }));

describe("OpponentEventUtils resolving-effects status", () => {
    beforeEach(() => {
        useGameUIStates.setState({ isOpponentResolvingEffects: false, opponentEmote: null });
        useGameBoardStates.setState({ isOpponentOnline: true });
    });

    it("shows the resolving status on the opponent side", () => {
        render(<OpponentEventUtils />);

        act(() => useGameUIStates.getState().setIsOpponentResolvingEffects(true));

        expect(screen.getByText("Resolving Effects")).toBeInTheDocument();
    });

    it("gives resolving status priority over an emote", () => {
        useGameUIStates.setState({ isOpponentResolvingEffects: true, opponentEmote: Emote.HELLO });
        render(<OpponentEventUtils />);

        expect(screen.getByText("Resolving Effects")).toBeInTheDocument();
        expect(screen.queryByText("Opponent emote")).not.toBeInTheDocument();
    });
});
