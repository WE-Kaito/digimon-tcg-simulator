import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OnlinePlayerListItem from "./OnlinePlayerListItem";

describe("OnlinePlayerListItem", () => {
    it("renders the status underneath the player name", () => {
        render(
            <ul>
                <OnlinePlayerListItem name="AgumonFan" status="In lobby" />
            </ul>
        );

        const name = screen.getByText("AgumonFan");
        const status = screen.getByText("In lobby");

        expect(name.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(status).toHaveStyle({ display: "block" });
    });

    it("uses the online-player status typography", () => {
        render(
            <ul>
                <OnlinePlayerListItem name="GabumonFan" status="Deck building" />
            </ul>
        );

        expect(screen.getByText("Deck building")).toHaveStyle({
            color: "rgba(255, 239, 213, 0.62)",
            fontFamily: '"Cousine", monospace',
            fontSize: "0.6em",
            marginRight: "6px",
            whiteSpace: "nowrap",
        });
    });
});
