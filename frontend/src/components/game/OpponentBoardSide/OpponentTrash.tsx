import { handleImageError } from "../../../utils/functions.ts";
import effectAnimation from "../../../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import Lottie from "lottie-react";
import TrashIcon from "@mui/icons-material/Delete";
import CloseTrashIcon from "@mui/icons-material/DeleteForever";
import { OpenedCardModal, useGameUIStates } from "../../../hooks/useGameUIStates.ts";

export default function OpponentTrash() {
    const opponentTrash = useGameBoardStates((state) => state.opponentTrash);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);

    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const setOpenedCardModal = useGameUIStates((state) => state.setOpenedCardModal);

    const effectInTrash = getCardLocationById(cardIdWithEffect ?? "") === "opponentTrash";
    const targetInTrash = getCardLocationById(cardIdWithTarget ?? "") === "opponentTrash";

    const isTrashOpened = openedCardModal === OpenedCardModal.OPPONENT_TRASH;

    function handleClick() {
        setOpenedCardModal(isTrashOpened ? false : OpenedCardModal.OPPONENT_TRASH);
    }

    return (
        <Container>
            {opponentTrash.length === 0 && !isTrashOpened && (
                <PlaceholderDiv>
                    <StyledTrashIcon />
                </PlaceholderDiv>
            )}
            {opponentTrash.length > 0 && !isTrashOpened && (
                <CardImg
                    src={opponentTrash[opponentTrash.length - 1]?.imgUrl}
                    alt={"myTrash"}
                    title="Open trash"
                    onClick={handleClick}
                    onError={handleImageError}
                />
            )}
            {isTrashOpened && (
                <StyledCloseButtonDiv onClick={handleClick} className={"button"}>
                    <CloseTrashIcon style={{ color: "ghostwhite", fontSize: "250%" }} />
                </StyledCloseButtonDiv>
            )}
            <StyledSpan>{opponentTrash.length}</StyledSpan>
            {effectInTrash && <StyledLottie animationData={effectAnimation} loop={true} />}
            {targetInTrash && <StyledLottie animationData={targetAnimation} loop={true} />}
        </Container>
    );
}

const Container = styled.div`
    grid-area: trash;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    transform: translateY(-10%);
`;

const PlaceholderDiv = styled.div`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 3px;
    background: rgba(15, 15, 15, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(220, 220, 220, 0.8);
    font-family: Naston, sans-serif;
    transition: all 0.1s ease-in-out;
`;

const CardImg = styled.img<{ isOver?: boolean }>`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    filter: drop-shadow(${({ isOver }) => (isOver ? "0px 0px 1px whitesmoke" : "1px 1px 2px #060e18")});

    &:hover {
        filter: drop-shadow(0px 0px 3px #af0c3d) brightness(1.1) saturate(1.2);
    }
`;

const StyledSpan = styled.span`
    position: absolute;
    top: -25px;
    left: 46%;
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    transition: all 0.1s ease;
    @media (max-height: 500px) {
        font-size: 0.8em;
        left: 42.5%;
        top: -22px;
    }
`;

const StyledLottie = styled(Lottie)<{ isOpponentTrash?: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
`;

const StyledTrashIcon = styled(TrashIcon)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    font-size: 2.5em;
    @media (max-height: 500px) {
        font-size: 1.25em;
    }
`;

const StyledCloseButtonDiv = styled.div`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 5px;
    background: #7c111e;
    box-shadow: inset 0 0 5px 2px rgba(245, 245, 245, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.15s;

    &:hover {
        background: #91182b;
        box-shadow: inset 0 0 2px 2px rgba(213, 213, 213, 0.3);
    }
`;
