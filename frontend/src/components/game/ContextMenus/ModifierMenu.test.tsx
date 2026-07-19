import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import ModifierMenu from "./ModifierMenu";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { CardTypeGame } from "../../../utils/types.ts";

// react-contexify's <Menu>/<Submenu>/<Item> only render their children once
// the menu has been triggered "open" via its internal visibility state, which
// isn't relevant to the SICK/TAUNT checkbox wiring under test here. Stub them
// as plain passthroughs so ModifierMenu's own DOM is testable directly.
vi.mock("react-contexify", () => ({
    Menu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Submenu: ({ children, label }: { children: ReactNode; label: ReactNode }) => (
        <div>
            {label}
            {children}
        </div>
    ),
    Item: ({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) => (
        <div onClick={disabled ? undefined : onClick}>{children}</div>
    ),
}));

const LOCATION = "myDigi1";

function makeCard(keywords: string[], cardType = "Digimon"): CardTypeGame {
    return {
        id: "test-card-1",
        uniqueCardNumber: "BT1-001",
        name: "Test Digimon",
        imgUrl: "https://example.com/card.jpg",
        cardType,
        color: ["Red"],
        cardNumber: "BT1-001",
        restrictions: { chinese: "", english: "", japanese: "", korean: "" },
        illustrator: "",
        dp: 2000,
        level: 3,
        modifiers: { plusDp: 0, plusSecurityAttacks: 0, keywords, colors: ["Red"] },
        isTilted: false,
        isFaceUp: true,
    };
}

function renderMenu(card: CardTypeGame) {
    useGameBoardStates.setState({
        [LOCATION]: [card],
        cardToSend: { card, location: LOCATION },
    } as never);
    const sendSetModifiers = vi.fn();
    render(<ModifierMenu sendSetModifiers={sendSetModifiers} />);
    return { sendSetModifiers };
}

describe("ModifierMenu SICK / TAUNT toggles", () => {
    beforeEach(() => {
        useGameBoardStates.setState({ [LOCATION]: [], cardToSend: null } as never);
    });

    it("supports setting modifiers on Digimon/Option cards", async () => {
        const user = userEvent.setup();
        const card = makeCard([], "Digimon/Option");
        const { sendSetModifiers } = renderMenu(card);

        expect(screen.getByText("Set Modifiers")).toBeInTheDocument();
        await user.click(screen.getByLabelText("(Un)Mark as taunted💢"));
        await user.click(screen.getByText("SAVE VALUES"));

        expect(sendSetModifiers).toHaveBeenCalledWith(
            card.id,
            LOCATION,
            expect.objectContaining({ keywords: ["TAUNT"] })
        );
    });

    it("toggles the SICK checkbox on and includes SICK in the saved keywords", async () => {
        const user = userEvent.setup();
        const card = makeCard([]);
        const { sendSetModifiers } = renderMenu(card);

        const sickCheckbox = screen.getByLabelText("(Un)Mark as sick / stunned 💫") as HTMLInputElement;
        expect(sickCheckbox.checked).toBe(false);

        await user.click(sickCheckbox);
        expect(sickCheckbox.checked).toBe(true);

        await user.click(screen.getByText("SAVE VALUES"));
        expect(sendSetModifiers).toHaveBeenCalledWith(
            card.id,
            LOCATION,
            expect.objectContaining({ keywords: expect.arrayContaining(["SICK"]) })
        );
    });

    it("toggles the TAUNT checkbox on and includes TAUNT in the saved keywords", async () => {
        const user = userEvent.setup();
        const card = makeCard([]);
        const { sendSetModifiers } = renderMenu(card);

        const tauntCheckbox = screen.getByLabelText("(Un)Mark as taunted💢") as HTMLInputElement;
        expect(tauntCheckbox.checked).toBe(false);

        await user.click(tauntCheckbox);
        expect(tauntCheckbox.checked).toBe(true);

        await user.click(screen.getByText("SAVE VALUES"));
        expect(sendSetModifiers).toHaveBeenCalledWith(
            card.id,
            LOCATION,
            expect.objectContaining({ keywords: expect.arrayContaining(["TAUNT"]) })
        );
    });

    it("does not affect the SICK checkbox when toggling TAUNT (regression: duplicate ids)", async () => {
        const user = userEvent.setup();
        const card = makeCard([]);
        renderMenu(card);

        const sickCheckbox = screen.getByLabelText("(Un)Mark as sick / stunned 💫") as HTMLInputElement;
        const tauntCheckbox = screen.getByLabelText("(Un)Mark as taunted💢") as HTMLInputElement;

        await user.click(tauntCheckbox);
        expect(tauntCheckbox.checked).toBe(true);
        expect(sickCheckbox.checked).toBe(false);
    });

    it("unchecking SICK removes it from the saved keywords, clearing the animation trigger", async () => {
        const user = userEvent.setup();
        const card = makeCard(["SICK"]);
        const { sendSetModifiers } = renderMenu(card);

        const sickCheckbox = screen.getByLabelText("(Un)Mark as sick / stunned 💫") as HTMLInputElement;
        expect(sickCheckbox.checked).toBe(true);

        await user.click(sickCheckbox);
        expect(sickCheckbox.checked).toBe(false);

        await user.click(screen.getByText("SAVE VALUES"));
        expect(sendSetModifiers).toHaveBeenCalledWith(card.id, LOCATION, expect.objectContaining({ keywords: [] }));
    });

    it("unchecking TAUNT removes it from the saved keywords, clearing the animation trigger", async () => {
        const user = userEvent.setup();
        const card = makeCard(["TAUNT"]);
        const { sendSetModifiers } = renderMenu(card);

        const tauntCheckbox = screen.getByLabelText("(Un)Mark as taunted💢") as HTMLInputElement;
        expect(tauntCheckbox.checked).toBe(true);

        await user.click(tauntCheckbox);
        expect(tauntCheckbox.checked).toBe(false);

        await user.click(screen.getByText("SAVE VALUES"));
        expect(sendSetModifiers).toHaveBeenCalledWith(card.id, LOCATION, expect.objectContaining({ keywords: [] }));
    });
});
