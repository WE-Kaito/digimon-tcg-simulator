import styled from "@emotion/styled";
import {
    AddModerator as RecoveryIcon,
    Curtains as RevealIcon,
    RestoreFromTrash as TrashFromDeckIcon,
} from "@mui/icons-material";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useSound } from "../../../hooks/useSound.ts";
import { WSUtils } from "../../../pages/GamePage.tsx";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { BootStage } from "../../../utils/types.ts";

export default function DeckUtilButtons({ wsUtils }: { wsUtils?: WSUtils }) {
    const myDeckField = useGameBoardStates((state) => state.myDeckField);
    const opponentReveal = useGameBoardStates((state) => state.opponentReveal);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const moveCardToStack = useGameBoardStates((state) => state.moveCardToStack);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const gameHasStarted = bootStage === BootStage.GAME_IN_PROGRESS;

    const playRevealCardSfx = useSound((state) => state.playRevealCardSfx);
    const playTrashCardSfx = useSound((state) => state.playTrashCardSfx);
    const playUnsuspendSfx = useSound((state) => state.playUnsuspendSfx);

    const iconSize = useGeneralStates((state) => state.cardWidth / 3.5);

    function moveDeckCard(to: string, bottomCard?: boolean) {
        const cardId = bottomCard ? myDeckField[myDeckField.length - 1].id : myDeckField[0].id;
        if (to === "myReveal") {
            playRevealCardSfx();
            wsUtils?.sendSfx("playRevealSfx");
            moveCard(cardId, "myDeckField", "myReveal");
            wsUtils?.sendMoveCard(cardId, "myDeckField", "myReveal");
            if (bottomCard)
                wsUtils?.sendChatMessage(
                    `[FIELD_UPDATE]≔【${myDeckField[myDeckField.length - 1].name}】﹕Deck Bottom ➟ Reveal`
                );
            else wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Reveal`);
        }
        if (to === "myTrash") {
            playTrashCardSfx();
            wsUtils?.sendSfx("playTrashCardSfx");
            moveCard(cardId, "myDeckField", "myTrash");
            wsUtils?.sendMoveCard(cardId, "myDeckField", "myTrash");
            wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Trash`);
        }
        if (to === "mySecurity") {
            playUnsuspendSfx();
            wsUtils?.sendSfx("playUnsuspendCardSfx");
            moveCardToStack("Top", cardId, "myDeckField", "mySecurity", "down");
            wsUtils?.sendMessage(
                `${wsUtils.matchInfo.gameId}:/moveCardToStack:${wsUtils.matchInfo.opponentName}:Top:${cardId}:myDeckField:mySecurity:down`
            );
            wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【Top Deck Card】﹕➟ Security Top`);
        }
    }

    return (
        <Container>
            <StyledButton
                className="button"
                title="Reveal the top card of your deck"
                onClick={() => moveDeckCard("myReveal")}
                disabled={opponentReveal.length > 0 || !gameHasStarted || myDeckField.length === 0}
            >
                <RevealIcon sx={{ fontSize: iconSize }} />
            </StyledButton>
            <StyledButton
                className="button"
                title="Send top card from your deck to Trash"
                onClick={() => moveDeckCard("myTrash")}
                disabled={!gameHasStarted || myDeckField.length === 0}
            >
                <TrashFromDeckIcon sx={{ fontSize: iconSize * 1.25 }} />
            </StyledButton>
            <StyledButton
                className="button"
                title="Send top card from your deck to Security Stack"
                onClick={() => moveDeckCard("mySecurity")}
                disabled={!gameHasStarted || myDeckField.length === 0}
            >
                <RecoveryIcon sx={{ fontSize: iconSize * 0.95 }} />
            </StyledButton>
        </Container>
    );
}

const Container = styled.div`
    grid-area: deck-utils;
    width: 100%;
    height: 100%;
    transform: translateX(50%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
`;

const StyledButton = styled.div<{ disabled?: boolean }>`
    border-radius: 5px;
    position: relative;
    border: none !important;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 75%;
    aspect-ratio: 1;

    background: ${({ disabled }) => (disabled ? "rgba(72, 72, 72, 0.48)" : "var(--blue-button-bg)")};
    pointer-events: ${({ disabled }) => (disabled ? "none" : "unset")};

    color: ghostwhite;

    filter: saturate(0.6);

    opacity: 0.8;

    text-shadow: 0 -2px 1px rgba(0, 0, 0, 0.25);
    //
    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        color: ghostwhite;
        background: var(--blue-button-bg-hover);
        border: none;
        //background-color: #1d7dfc;
        //color: ghostwhite;
        //box-shadow: 0 0 10px rgba(29, 125, 252, 0.5);
    }

    &:active {
        background: var(--blue-button-bg-active);
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    svg {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
`;
