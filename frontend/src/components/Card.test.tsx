import { describe, expect, it, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Card from "./Card";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { CardTypeGame } from "../utils/types.ts";

const LOCATION = "myDigi1";

function makeCard(keywords: string[]): CardTypeGame {
    return {
        id: "test-card-1",
        uniqueCardNumber: "BT1-001",
        name: "Test Digimon",
        imgUrl: "https://example.com/card.jpg",
        cardType: "Digimon",
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

function renderCard(card: CardTypeGame) {
    useGameBoardStates.setState({ [LOCATION]: [card] } as never);
    return renderCardView(card);
}

function renderCardView(card: CardTypeGame) {
    return render(
        <DndProvider backend={HTML5Backend}>
            <Card card={card} location={LOCATION} index={0} />
        </DndProvider>
    );
}

function getStoredCard() {
    return (useGameBoardStates.getState()[LOCATION] as CardTypeGame[])[0];
}

function cardView(card: CardTypeGame) {
    return (
        <DndProvider backend={HTML5Backend}>
            <Card card={card} location={LOCATION} index={0} />
        </DndProvider>
    );
}

describe("Card keyword animations", () => {
    beforeEach(() => {
        useGameBoardStates.setState({ [LOCATION]: [] } as never);
    });

    it("renders no keyword animation when there are no keywords", () => {
        renderCard(makeCard([]));
        expect(screen.queryByAltText("suspended")).not.toBeInTheDocument();
        expect(screen.queryByTestId("taunt-pulse-overlay")).not.toBeInTheDocument();
    });

    it("renders the SICK animation when SICK is toggled on", () => {
        renderCard(makeCard(["SICK"]));
        expect(screen.getByAltText("suspended")).toBeInTheDocument();
        expect(screen.queryByTestId("taunt-pulse-overlay")).not.toBeInTheDocument();
    });

    it("renders the TAUNT animation when TAUNT is toggled on", () => {
        renderCard(makeCard(["TAUNT"]));
        expect(screen.getByTestId("taunt-pulse-overlay")).toBeInTheDocument();
        expect(screen.queryByAltText("suspended")).not.toBeInTheDocument();
    });

    it("clears the SICK animation when the keyword is removed", () => {
        const card = makeCard(["SICK"]);
        const view = renderCard(card);
        expect(screen.getByAltText("suspended")).toBeInTheDocument();

        act(() => {
            useGameBoardStates.getState().setModifiers(card.id, LOCATION, {
                ...card.modifiers,
                keywords: [],
            });
        });
        view.rerender(cardView(getStoredCard()));

        expect(screen.queryByAltText("suspended")).not.toBeInTheDocument();
    });

    it("clears the TAUNT animation when the keyword is removed", () => {
        const card = makeCard(["TAUNT"]);
        const view = renderCard(card);
        expect(screen.getByTestId("taunt-pulse-overlay")).toBeInTheDocument();

        act(() => {
            useGameBoardStates.getState().setModifiers(card.id, LOCATION, {
                ...card.modifiers,
                keywords: [],
            });
        });
        view.rerender(cardView(getStoredCard()));

        expect(screen.queryByTestId("taunt-pulse-overlay")).not.toBeInTheDocument();
    });

    it("switches from the SICK animation to the TAUNT animation when keywords change", () => {
        const card = makeCard(["SICK"]);
        const view = renderCard(card);
        expect(screen.getByAltText("suspended")).toBeInTheDocument();

        act(() => {
            useGameBoardStates.getState().setModifiers(card.id, LOCATION, {
                ...card.modifiers,
                keywords: ["TAUNT"],
            });
        });
        view.rerender(cardView(getStoredCard()));

        expect(screen.queryByAltText("suspended")).not.toBeInTheDocument();
        expect(screen.getByTestId("taunt-pulse-overlay")).toBeInTheDocument();
    });
});
