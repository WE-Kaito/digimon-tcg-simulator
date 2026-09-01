import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeneralStates } from "./useGeneralStates.ts";

vi.mock("axios");
vi.mock("../utils/toasts.ts", () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
}));

describe("active deck state", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useGeneralStates.setState({
            activeDeckId: "deck-one",
            isActiveDeckLoaded: true,
            isActiveDeckChanging: false,
        });
    });

    it("updates optimistically while persistence is pending", async () => {
        let resolveRequest!: () => void;
        vi.mocked(axios.put).mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = () => resolve({ data: undefined });
            })
        );

        const request = useGeneralStates.getState().setActiveDeck("deck-two");

        expect(useGeneralStates.getState()).toMatchObject({
            activeDeckId: "deck-two",
            isActiveDeckChanging: true,
        });

        resolveRequest();
        await expect(request).resolves.toBe(true);
        expect(useGeneralStates.getState()).toMatchObject({
            activeDeckId: "deck-two",
            isActiveDeckChanging: false,
            isActiveDeckLoaded: true,
        });
    });

    it("rolls back when persistence fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.mocked(axios.put).mockRejectedValue(new Error("network failure"));

        await expect(useGeneralStates.getState().setActiveDeck("deck-two")).resolves.toBe(false);

        expect(useGeneralStates.getState()).toMatchObject({
            activeDeckId: "deck-one",
            isActiveDeckChanging: false,
            isActiveDeckLoaded: true,
        });
    });

    it("returns the active deck after loading it", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: "deck-two" });

        await expect(useGeneralStates.getState().getActiveDeck()).resolves.toBe("deck-two");
        expect(useGeneralStates.getState()).toMatchObject({
            activeDeckId: "deck-two",
            isActiveDeckLoaded: true,
        });
    });
});
