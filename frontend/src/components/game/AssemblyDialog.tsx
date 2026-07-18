import styled from "@emotion/styled";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useEffect, useState } from "react";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { handleImageError } from "../../utils/functions.ts";
import { CardTypeGame } from "../../utils/types.ts";

type Props = {
    open: boolean;
    hasEmptyField: boolean;
    onCancel: () => void;
    onConfirm: (cards: CardTypeGame[]) => void;
};

export default function AssemblyDialog({ open, hasEmptyField, onCancel, onConfirm }: Props) {
    const myTrash = useGameBoardStates((state) => state.myTrash);
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!open) {
            setSelectedCardIds([]);
            setIsMinimized(false);
        }
    }, [open]);

    function toggleCard(cardId: string) {
        setSelectedCardIds((currentIds) =>
            currentIds.includes(cardId) ? currentIds.filter((id) => id !== cardId) : [...currentIds, cardId]
        );
    }

    function handleConfirm() {
        const selectedCards = selectedCardIds
            .map((cardId) => myTrash.find((card) => card.id === cardId))
            .filter((card): card is CardTypeGame => card !== undefined);
        onConfirm(selectedCards);
    }

    return (
        <>
            <Dialog
                open={open && !isMinimized}
                onClose={(_, reason) => {
                    if (reason === "backdropClick") {
                        setIsMinimized(true);
                        return;
                    }
                    onCancel();
                }}
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
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "Naston, sans-serif",
                    }}
                >
                    Assembly
                    <IconButton
                        aria-label="Minimize Assembly dialog"
                        title="Minimize"
                        color="inherit"
                        onClick={() => setIsMinimized(true)}
                    >
                        <MinimizeIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <CardGrid>
                        {myTrash
                            .slice()
                            .reverse()
                            .map((card) => {
                                const selectionIndex = selectedCardIds.indexOf(card.id);
                                const isSelected = selectionIndex !== -1;

                                return (
                                    <CardButton
                                        key={card.id}
                                        type="button"
                                        isSelected={isSelected}
                                        onClick={() => toggleCard(card.id)}
                                        aria-pressed={isSelected}
                                        aria-label={`${isSelected ? "Deselect" : "Select"} ${card.name}`}
                                    >
                                        <CardImage
                                            src={card.imgUrl}
                                            alt={`${card.name} ${card.uniqueCardNumber}`}
                                            onError={handleImageError}
                                        />
                                        {isSelected && <SelectionOrder>{selectionIndex + 1}</SelectionOrder>}
                                    </CardButton>
                                );
                            })}
                        {!myTrash.length && <EmptyTrash>Your trash is empty.</EmptyTrash>}
                    </CardGrid>
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    {!hasEmptyField && <FieldWarning>An empty Digimon field is required.</FieldWarning>}
                    <Button color="inherit" variant="outlined" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!selectedCardIds.length || !hasEmptyField}
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            {open && isMinimized && (
                <>
                    <InteractionLock aria-hidden="true" onContextMenu={(event) => event.preventDefault()} />
                    <MinimizedAssemblyButton
                        variant="contained"
                        startIcon={<OpenInFullIcon />}
                        onClick={() => setIsMinimized(false)}
                    >
                        Resume Assembly
                    </MinimizedAssemblyButton>
                </>
            )}
        </>
    );
}

const InteractionLock = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1299;
    background: transparent;
`;

const MinimizedAssemblyButton = styled(Button)`
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1300;
    background: #173638;
    color: ghostwhite;
    font-family: "Naston", sans-serif;
    border: 1px solid rgba(210, 210, 190, 0.4);

    &:hover {
        background: #21494c;
    }
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    align-content: start;
    gap: 14px;
    min-height: 38vh;
`;

const CardButton = styled.button<{ isSelected: boolean }>`
    position: relative;
    display: block;
    padding: 0;
    border: 3px solid ${({ isSelected }) => (isSelected ? "#55d86c" : "transparent")};
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    overflow: hidden;
    transition:
        border-color 0.12s ease-in-out,
        transform 0.12s ease-in-out;

    &:hover {
        transform: translateY(-2px);
    }

    &:focus-visible {
        outline: 3px solid dodgerblue;
        outline-offset: 2px;
    }
`;

const CardImage = styled.img`
    display: block;
    width: 100%;
    aspect-ratio: 7 / 10;
    object-fit: cover;
`;

const SelectionOrder = styled.span`
    position: absolute;
    top: 6px;
    right: 6px;
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
`;

const EmptyTrash = styled.p`
    grid-column: 1 / -1;
    place-self: center;
    color: rgba(255, 255, 255, 0.7);
    font-family: "League Spartan", sans-serif;
`;

const FieldWarning = styled.span`
    margin-right: auto;
    color: #ffb4ab;
    font-family: "League Spartan", sans-serif;
`;
