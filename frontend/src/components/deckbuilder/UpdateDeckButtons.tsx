import styled from "@emotion/styled";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";

type AddDeckButtonProps = {
    deckName: string;
    currentDeckLength: number;
    setCurrentDeckLength: Dispatch<SetStateAction<number>>;
    isEditMode?: boolean;
};

export default function UpdateDeckButtons(props: AddDeckButtonProps) {
    const { deckName, currentDeckLength, setCurrentDeckLength, isEditMode } = props;

    const decks = useGeneralStates((state) => state.decks);
    const saveDeck = useGeneralStates((state) => state.saveDeck);
    const isSaving = useGeneralStates((state) => state.isSaving);

    const handleSaveDeck = () => saveDeck(deckName, setCurrentDeckLength);

    // Edit Mode
    const deleteDeck = useGeneralStates((state) => state.deleteDeck);
    const idOfDeckToEdit = useGeneralStates((state) => state.idOfDeckToEdit);
    const updateDeck = useGeneralStates((state) => state.updateDeck);
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    return isEditMode ? (
        <>
            <Button onClick={() => idOfDeckToEdit && updateDeck(idOfDeckToEdit, deckName)}>
                <StyledSpanSaveDeck>SAVE CHANGES</StyledSpanSaveDeck>
            </Button>
            {decks.length > 1 && (
                <DeleteButton
                    isDeleting={isDeleting}
                    onClick={() => {
                        if (isDeleting && idOfDeckToEdit) deleteDeck(idOfDeckToEdit, navigate);
                        setIsDeleting(!isDeleting);
                    }}
                >
                    <StyledSpanSaveDeck
                        style={
                            isDeleting
                                ? { fontSize: 16, letterSpacing: 1, textDecoration: "double underline cyan" }
                                : {}
                        }
                    >
                        {isDeleting ? "DELETE PERMANENTLY?" : "DELETE"}
                    </StyledSpanSaveDeck>
                </DeleteButton>
            )}
        </>
    ) : (
        <Button disabled={isSaving || decks.length >= 16} onClick={handleSaveDeck}>
            <StyledSpanSaveDeck>
                {decks.length >= 16 ? "16/16 Decks" : `SAVE (${currentDeckLength}/16)`}
            </StyledSpanSaveDeck>
        </Button>
    );
}

const StyledSpanSaveDeck = styled.span`
    font-family: "League Spartan", sans-serif;
    letter-spacing: 2px;
    font-size: 18px;
    text-shadow: 0 -1px 1px rgba(2, 38, 19, 0.25);
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    outline: 1px solid #242424;
    border: 2px solid transparent;

    border-image: linear-gradient(to bottom right, rgba(255, 255, 255, 0.7) 0%, rgba(157, 157, 157, 0.7) 100%) 1;

    width: 200px;
    height: 36px;
    background: linear-gradient(
        to bottom,
        rgba(63, 207, 157, 0.5) 0%,
        rgba(48, 217, 127, 0.7) 50%,
        rgba(20, 100, 72, 0.9) 100%
    );
    color: ghostwhite;
    padding: 0.5rem 1rem;

    //
    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(9, 8, 8, 0.3);

    &:hover {
        color: ghostwhite;
        background: linear-gradient(
            to bottom,
            rgba(55, 229, 168, 0.5) 0%,
            rgba(33, 229, 148, 0.7) 50%,
            rgba(21, 112, 95, 0.9) 100%
        );
    }

    &:active {
        background: linear-gradient(
            to bottom,
            rgba(56, 236, 215, 0.5) 0%,
            rgba(32, 236, 212, 0.7) 50%,
            rgba(19, 126, 136, 0.9) 100%
        );
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    &:disabled {
        background: #27292d;
        pointer-events: none;
    }

    @media (max-width: 550px) {
        width: 180px;
    }

    @media (max-width: 420px) {
        width: 170px;
        scale: 0.9;
    }
`;

const DeleteButton = styled(Button)<{ isDeleting?: boolean }>`
    width: 220px;

    filter: ${({ isDeleting }) => (isDeleting ? "invert(1) brightness(2)" : "unset")};

    background: linear-gradient(
        to bottom,
        rgba(220, 20, 60, 0.5) 0%,
        rgba(178, 0, 55, 0.7) 50%,
        rgba(120, 0, 35, 0.9) 100%
    );

    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        background: linear-gradient(
            to bottom,
            rgba(230, 30, 70, 0.5) 0%,
            rgba(190, 0, 60, 0.7) 50%,
            rgba(130, 0, 40, 0.9) 100%
        );
    }

    &:active {
        background: linear-gradient(
            to bottom,
            rgba(240, 40, 80, 0.5) 0%,
            rgba(200, 0, 65, 0.7) 50%,
            rgba(140, 0, 45, 0.9) 100%
        );
    }
`;
