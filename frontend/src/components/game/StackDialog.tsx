import styled from "@emotion/styled";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useContextMenu } from "react-contexify";
import { useEffect } from "react";
import Card from "../Card.tsx";
import { tamerLocations, useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { CardTypeGame } from "../../utils/types.ts";

/**
 * Displays all cards in a field stack in a centered dialog.
 */
export default function StackDialog() {
    const stackDialog = useGameUIStates((state) => state.stackDialog);
    const setStackDialog = useGameUIStates((state) => state.setStackDialog);

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

    if (!stackDialog) return null;

    const cardsToRender = tamerLocations.includes(stackDialog)
        ? locationCards
        : locationCards.slice().reverse();

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
                        return (
                            <CardContainer key={card.id}>
                                <Card
                                    card={card}
                                    location={stackDialog}
                                    style={{ width: "100%" }}
                                    index={index}
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
                            </CardContainer>
                        );
                    })}
                </CardGrid>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button color="inherit" variant="outlined" onClick={() => setStackDialog(false)}>
                    Close
                </Button>
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

const CardContainer = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 7 / 9.75;
`;
