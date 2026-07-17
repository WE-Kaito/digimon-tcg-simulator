import styled from "@emotion/styled";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LibraryAddCheckTwoTone as SelectStackIcon } from "@mui/icons-material";
import { useContextMenu } from "react-contexify";
import { useEffect, useState } from "react";
import Card from "../Card.tsx";
import { tamerLocations, useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useSound } from "../../hooks/useSound.ts";
import { CardTypeGame } from "../../utils/types.ts";
import type { WSUtils } from "../../pages/GamePage.tsx";

/**
 * Displays all cards in a field stack in a centered dialog.
 */
export default function StackDialog({ wsUtils }: { wsUtils?: WSUtils }) {
    const stackDialog = useGameUIStates((state) => state.stackDialog);
    const setStackDialog = useGameUIStates((state) => state.setStackDialog);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

    const locationCards = useGameBoardStates((state) =>
        stackDialog ? (state[stackDialog as keyof typeof state] as CardTypeGame[]) : []
    );

    const { show: showCardMenu } = useContextMenu({
        id: stackDialog !== false && stackDialog.includes("opponent") ? "dialogMenuOpponent" : "dialogMenu",
        props: { index: -1, location: "", id: "" },
    });

    useEffect(() => {
        if (stackDialog && !locationCards.length) setStackDialog(false);
    }, [locationCards, stackDialog, setStackDialog]);

    useEffect(() => setSelectedCardIds([]), [stackDialog]);

    if (!stackDialog) return null;

    const isOwnStack = stackDialog.startsWith("my");

    const cardsToRender = tamerLocations.includes(stackDialog)
        ? locationCards
        : locationCards.slice().reverse();

    function toggleCard(cardId: string) {
        if (!isOwnStack) return;
        setSelectedCardIds((currentIds) =>
            currentIds.includes(cardId) ? currentIds.filter((id) => id !== cardId) : [...currentIds, cardId]
        );
    }

    function selectCardAndFollowing(cardId: string) {
        if (!isOwnStack) return;
        const cardIndex = cardsToRender.findIndex((card) => card.id === cardId);
        if (cardIndex === -1) return;
        setSelectedCardIds(cardsToRender.slice(cardIndex).map((card) => card.id));
    }

    function trashSelectedCards() {
        if (!stackDialog || !isOwnStack || !selectedCardIds.length) return;

        const selectedCards = selectedCardIds
            .map((cardId) => locationCards.find((card) => card.id === cardId))
            .filter((card): card is CardTypeGame => card !== undefined);

        selectedCards.forEach((card) => {
            moveCard(card.id, stackDialog, "myTrash");
            wsUtils?.sendMoveCard(card.id, stackDialog, "myTrash");
        });

        playTrashCardSfx();
        wsUtils?.sendSfx("playTrashCardSfx");
        wsUtils?.sendChatMessage(
            `[FIELD_UPDATE]≔${selectedCards.map((card) => `【${card.name}】`).join("")}﹕Stack ➟ Trash`
        );
        setStackDialog(false);
    }

    return (
        <Dialog
            open
            onClose={() => setStackDialog(false)}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        background: "#173638",
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.025), rgba(0,0,0,0.06))",
                        border: "1px solid rgba(210, 210, 190, 0.4)",
                        color: "ghostwhite",
                        minHeight: "50vh",
                        maxHeight: "85vh",
                    },
                },
            }}
        >
            <DialogTitle sx={{ fontFamily: "Naston, sans-serif" }}>Show Stack</DialogTitle>
            <DialogContent dividers>
                <CardGrid>
                    {cardsToRender.map((card) => {
                        const index = locationCards.findIndex((locationCard) => locationCard.id === card.id);
                        const selectionIndex = selectedCardIds.indexOf(card.id);
                        const isSelected = selectionIndex !== -1;
                        return (
                            <CardContainer
                                key={card.id}
                                isSelected={isSelected}
                                isSelectable={isOwnStack}
                                onClickCapture={(event) => {
                                    if ((event.target as Element).closest("[data-select-stack]")) return;
                                    toggleCard(card.id);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") toggleCard(card.id);
                                }}
                                role={isOwnStack ? "button" : undefined}
                                tabIndex={isOwnStack ? 0 : undefined}
                                aria-pressed={isOwnStack ? isSelected : undefined}
                                aria-label={isOwnStack ? `${isSelected ? "Deselect" : "Select"} ${card.name}` : undefined}
                            >
                                <Card
                                    card={card}
                                    location={stackDialog}
                                    style={{ width: "100%" }}
                                    index={index}
                                    disableDragging
                                    onContextMenu={(event) =>
                                        showCardMenu({
                                            event,
                                            props: {
                                                index,
                                                location: stackDialog,
                                                id: card.id,
                                                name: card.name,
                                            },
                                        })
                                    }
                                />
                                {isOwnStack && (
                                    <SelectFollowingButton
                                        type="button"
                                        data-select-stack
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            selectCardAndFollowing(card.id);
                                        }}
                                        aria-label={`Select ${card.name} and all cards beneath it`}
                                        title="Select this card and all cards beneath it"
                                    >
                                        <SelectStackIcon sx={{ fontSize: 25 }} />
                                    </SelectFollowingButton>
                                )}
                                {isSelected && <SelectionOrder>{selectionIndex + 1}</SelectionOrder>}
                            </CardContainer>
                        );
                    })}
                </CardGrid>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
                <Button color="inherit" variant="outlined" onClick={() => setStackDialog(false)}>
                    Close
                </Button>
                {isOwnStack && (
                    <Button color="error" variant="contained" disabled={!selectedCardIds.length} onClick={trashSelectedCards}>
                        Trash
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    align-content: start;
    gap: 14px;
    min-height: 38vh;
`;

const CardContainer = styled.div<{ isSelected: boolean; isSelectable: boolean }>`
    position: relative;
    width: 100%;
    aspect-ratio: 7 / 9.75;
    box-sizing: border-box;
    border: 3px solid ${({ isSelected }) => (isSelected ? "#55d86c" : "transparent")};
    border-radius: 8px;
    cursor: ${({ isSelectable }) => (isSelectable ? "pointer" : "default")};
    transition: border-color 0.12s ease-in-out, transform 0.12s ease-in-out;

    &:hover {
        transform: ${({ isSelectable }) => (isSelectable ? "translateY(-2px)" : "none")};
    }

    &:focus-visible {
        outline: 3px solid dodgerblue;
        outline-offset: 2px;
    }
`;

const SelectionOrder = styled.span`
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 5;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 2px solid white;
    border-radius: 50%;
    background: #15803d;
    color: white;
    font-family: Naston, sans-serif;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 2px 5px black;
    pointer-events: none;
`;

const SelectFollowingButton = styled.button`
    position: absolute;
    right: 5px;
    bottom: 5px;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 4px;
    background: rgba(12, 21, 16, 0.82);
    color: ghostwhite;
    cursor: pointer;

    &:hover {
        background: rgba(65, 135, 211, 0.92);
    }

    &:focus-visible {
        outline: 3px solid dodgerblue;
        outline-offset: 2px;
    }
`;
