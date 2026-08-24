import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Emote, useGameUIStates } from "../../../../hooks/useGameUIStates.ts";
import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import PlayerEventUtils from "./PlayerEventUtils.tsx";

vi.mock("lottie-react", () => ({ default: () => <div data-testid="starting-player" /> }));
vi.mock("./Mulligan.tsx", () => ({ default: () => <div>Mulligan prompt</div> }));
vi.mock("./PlayerAttackResolve.tsx", () => ({ default: () => <div>Counter and attack prompt</div> }));
vi.mock("../../OpponentBoardSide/OpponentEventUtils/OpponentAttackResolve.tsx", () => ({
    default: () => <div>Block prompt</div>,
}));
vi.mock("./UnsuspendAllButton.tsx", () => ({ default: () => <div>Unsuspend prompt</div> }));
vi.mock("../../EmoteRender.tsx", () => ({ default: () => <div>Emote</div> }));

const sendMessage = vi.fn();
const wsUtils = {
    matchInfo: { gameId: "player-one‗player-two", user: "player-one", opponentName: "player-two" },
    sendMessage,
} as never;

describe("PlayerEventUtils resolving-effects control", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useGameUIStates.setState({
            isResolvingEffects: false,
            isOpponentResolvingEffects: false,
            myEmote: null,
            opponentEmote: null,
        });
        useGameBoardStates.setState({ isOpponentOnline: true });
    });

    it("shows the status immediately, sends the update, and changes the clock to a checkmark", () => {
        render(<PlayerEventUtils wsUtils={wsUtils} />);

        fireEvent.click(screen.getByLabelText("Start resolving effects"));

        expect(screen.getByText("Resolving Effects")).toBeInTheDocument();
        expect(screen.getByLabelText("Finish resolving effects")).toBeInTheDocument();
        expect(screen.getByTestId("TaskAltTwoToneIcon")).toBeInTheDocument();
        expect(sendMessage).toHaveBeenCalledWith("player-one‗player-two:/resolvingEffects:true");
    });

    it("clears the status and restores the clock when resolving finishes", () => {
        render(<PlayerEventUtils wsUtils={wsUtils} />);
        fireEvent.click(screen.getByLabelText("Start resolving effects"));
        fireEvent.click(screen.getByLabelText("Finish resolving effects"));

        expect(screen.queryByText("Resolving Effects")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Start resolving effects")).toBeInTheDocument();
        expect(screen.getByTestId("AccessTimeFilledTwoToneIcon")).toBeInTheDocument();
        expect(sendMessage).toHaveBeenLastCalledWith("player-one‗player-two:/resolvingEffects:false");
    });

    it("replaces existing prompts and restores them after resolving", () => {
        render(<PlayerEventUtils wsUtils={wsUtils} />);
        const prompts = ["Mulligan prompt", "Counter and attack prompt", "Block prompt", "Unsuspend prompt"];
        prompts.forEach((prompt) => expect(screen.getByText(prompt)).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText("Start resolving effects"));
        prompts.forEach((prompt) => expect(screen.queryByText(prompt)).not.toBeInTheDocument());
        expect(screen.getByText("Resolving Effects")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Finish resolving effects"));
        prompts.forEach((prompt) => expect(screen.getByText(prompt)).toBeInTheDocument());
    });

    it("does not reveal an emote received while resolving after the status finishes", () => {
        render(<PlayerEventUtils wsUtils={wsUtils} />);
        fireEvent.click(screen.getByLabelText("Start resolving effects"));

        act(() => useGameUIStates.getState().setMyEmote(Emote.HELLO));
        expect(screen.getByText("Resolving Effects")).toBeInTheDocument();
        expect(screen.queryByText("Emote")).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Finish resolving effects"));
        expect(screen.queryByText("Emote")).not.toBeInTheDocument();
    });

    it("does not crash or create unsynchronized local state without wsUtils", () => {
        render(<PlayerEventUtils />);

        expect(() => fireEvent.click(screen.getByLabelText("Start resolving effects"))).not.toThrow();
        expect(screen.queryByText("Resolving Effects")).not.toBeInTheDocument();
        expect(useGameUIStates.getState().isResolvingEffects).toBe(false);
    });
});
