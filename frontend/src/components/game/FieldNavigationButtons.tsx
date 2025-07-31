import styled from "@emotion/styled";
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from "@mui/icons-material";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { SIDE } from "../../utils/types.ts";

type FieldNavigationButtonsProps = {
    side: SIDE;
};

export default function FieldNavigationButtons({ side }: FieldNavigationButtonsProps) {
    const fieldOffset = useGameUIStates((state) => state.fieldOffset);
    const setFieldOffset = useGameUIStates((state) => state.setFieldOffset);
    const opponentFieldOffset = useGameUIStates((state) => state.opponentFieldOffset);
    const setOpponentFieldOffset = useGameUIStates((state) => state.setOpponentFieldOffset);
    const isDisabled = useGameUIStates((state) => !!state.arrowTo || !!state.arrowFrom);
    const boardState = useGameBoardStates((state) => state);

    // Use the appropriate offset and setter based on which side this is
    const currentOffset = side === SIDE.MY ? fieldOffset : opponentFieldOffset;
    const setCurrentOffset = side === SIDE.MY ? setFieldOffset : setOpponentFieldOffset;

    const canGoBackward = currentOffset > 0;
    const canGoForward = currentOffset < 8;

    const currentStart = currentOffset + 1;
    const currentEnd = currentOffset + 8;

    // Check for cards on non-visible fields
    const checkForCardsInRange = (startField: number, endField: number) => {
        for (let i = startField; i <= endField; i++) {
            const fieldLocation = `${side}Digi${i}` as keyof typeof boardState;
            const cards = boardState[fieldLocation] as any[];
            if (cards && cards.length > 0) {
                return true;
            }
        }
        return false;
    };

    // Check if there are cards in fields that would be visible if we went backward
    const hasCardsToLeft = canGoBackward && checkForCardsInRange(1, currentStart - 1);

    // Check if there are cards in fields that would be visible if we went forward
    const hasCardsToRight = canGoForward && checkForCardsInRange(currentEnd + 1, 16);

    // For opponent side, visually flip the navigation direction
    const isOpponent = side === SIDE.OPPONENT;

    const handlePrevious = () => {
        if (canGoBackward) {
            setCurrentOffset(currentOffset - 1);
        }
    };

    const handleNext = () => {
        if (canGoForward) {
            setCurrentOffset(currentOffset + 1);
        }
    };

    const handleJumpToStart = () => {
        setCurrentOffset(0);
    };

    const handleJumpToEnd = () => {
        setCurrentOffset(8);
    };

    // Visually flipped handlers for opponent side
    const leftButtonHandler = isOpponent ? handleNext : handlePrevious;
    const rightButtonHandler = isOpponent ? handlePrevious : handleNext;
    const leftJumpHandler = isOpponent ? handleJumpToEnd : handleJumpToStart;
    const rightJumpHandler = isOpponent ? handleJumpToStart : handleJumpToEnd;

    const leftButtonDisabled = isOpponent ? !canGoForward : !canGoBackward;
    const rightButtonDisabled = isOpponent ? !canGoBackward : !canGoForward;
    const leftJumpDisabled = isOpponent ? currentOffset === 8 : currentOffset === 0;
    const rightJumpDisabled = isOpponent ? currentOffset === 0 : currentOffset === 8;

    const leftButtonCards = isOpponent ? hasCardsToRight : hasCardsToLeft;
    const rightButtonCards = isOpponent ? hasCardsToLeft : hasCardsToRight;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                transform: "translateY(-2px)",
            }}
        >
            {isOpponent && (
                <FieldRangeIndicator>
                    {currentStart}-{currentEnd}
                </FieldRangeIndicator>
            )}
            <Container>
                {/*<OffsetIndicator>0</OffsetIndicator>*/}
                <NavigationButton
                    onClick={leftJumpHandler}
                    disabled={isDisabled || leftJumpDisabled}
                    className={!leftJumpDisabled ? "button" : ""}
                    aria-label={isOpponent ? "Jump to last fields" : "Jump to first fields"}
                    hasCards={leftButtonCards}
                    isOpponent={isOpponent}
                >
                    <FirstPage sx={{ fontSize: 14 }} />
                </NavigationButton>

                <NavigationButton
                    onClick={leftButtonHandler}
                    disabled={isDisabled || leftButtonDisabled}
                    className={!leftButtonDisabled ? "button" : ""}
                    aria-label={isOpponent ? "Next fields" : "Previous fields"}
                    hasCards={leftButtonCards}
                    isOpponent={isOpponent}
                >
                    <ChevronLeft sx={{ fontSize: 16 }} />
                </NavigationButton>

                <NavigationButton
                    onClick={rightButtonHandler}
                    disabled={isDisabled || rightButtonDisabled}
                    className={!rightButtonDisabled ? "button" : ""}
                    aria-label={isOpponent ? "Previous fields" : "Next fields"}
                    hasCards={rightButtonCards}
                    isOpponent={isOpponent}
                >
                    <ChevronRight sx={{ fontSize: 16 }} />
                </NavigationButton>

                <NavigationButton
                    onClick={rightJumpHandler}
                    disabled={isDisabled || rightJumpDisabled}
                    className={!rightJumpDisabled ? "button" : ""}
                    aria-label={isOpponent ? "Jump to first fields" : "Jump to last fields"}
                    hasCards={rightButtonCards}
                    isOpponent={isOpponent}
                >
                    <LastPage sx={{ fontSize: 14 }} />
                </NavigationButton>
                {/*<OffsetIndicator>8</OffsetIndicator>*/}
            </Container>
            {!isOpponent && (
                <FieldRangeIndicator>
                    {currentStart}-{currentEnd}
                </FieldRangeIndicator>
            )}
        </div>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
    height: 100%;
    width: 100%;
    justify-content: center;
`;

const NavigationButton = styled.button<{
    disabled: boolean;
    hasCards?: boolean;
    isOpponent?: boolean;
}>`
    background: ${({ hasCards, isOpponent }) =>
        hasCards ? (isOpponent ? "rgba(255, 69, 0, 0.4)" : "rgba(102, 205, 170, 0.4)") : "rgba(12, 21, 16, 0.4)"};
    border: 1px solid
        ${({ hasCards, isOpponent }) =>
            hasCards
                ? isOpponent
                    ? "rgba(255, 69, 0, 0.8)"
                    : "rgba(102, 205, 170, 0.8)"
                : "rgba(124, 124, 118, 0.4)"};
    border-radius: 3px;
    color: ${({ disabled, hasCards, isOpponent }) =>
        disabled ? "#666" : hasCards ? (isOpponent ? "orangered" : "mintcream") : "blanchedalmond"};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    min-width: 20px;
    height: 20px;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    &:hover:not(:disabled) {
        background: ${({ hasCards, isOpponent }) =>
            hasCards
                ? isOpponent
                    ? "rgba(255, 69, 0, 0.6)"
                    : "rgba(102, 205, 170, 0.6)"
                : "rgba(26, 179, 201, 0.35)"};
        border-color: ${({ hasCards, isOpponent }) =>
            hasCards ? (isOpponent ? "rgba(255, 69, 0, 1)" : "rgba(102, 205, 170, 1)") : "rgba(26, 179, 201, 0.6)"};
    }

    &:disabled {
        pointer-events: none;
    }
`;

const FieldRangeIndicator = styled.div`
    color: blanchedalmond;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    min-width: 30px;
    opacity: 0.8;
`;
//
// const OffsetIndicator = styled.div`
//     color: rgba(255, 255, 255, 0.6);
//     font-size: 9px;
//     font-weight: bold;
//     text-align: center;
//     min-width: 12px;
//     opacity: 0.7;
//     display: flex;
//     align-items: center;
//     justify-content: center;
// `;
