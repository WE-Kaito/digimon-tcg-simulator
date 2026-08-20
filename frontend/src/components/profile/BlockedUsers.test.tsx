import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import BlockedUsers from "./BlockedUsers.tsx";

vi.mock("axios");

describe("BlockedUsers", () => {
    beforeEach(() => {
        vi.mocked(axios.get).mockResolvedValue({ data: [] });
        useGeneralStates.setState({ user: "CurrentUser" });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("disables Add when own username is entered", async () => {
        const user = userEvent.setup();
        render(<BlockedUsers />);

        const input = screen.getByPlaceholderText("Enter username to block");
        const addButton = screen.getByRole("button", { name: "ADD" });

        await user.type(input, " currentuser ");

        expect(addButton).toBeDisabled();
        expect(axios.post).not.toHaveBeenCalled();
    });
});
