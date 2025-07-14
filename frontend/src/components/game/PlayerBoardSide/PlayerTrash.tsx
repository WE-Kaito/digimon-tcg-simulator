import { handleImageError } from "../../../utils/functions.ts";
import effectAnimation from "../../../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import Lottie from "lottie-react";
import CloseTrashIcon from "@mui/icons-material/DeleteForever";
import TrashIcon from "@mui/icons-material/Delete";
import { useDraggable } from "@dnd-kit/core";
// import { useDroppable } from "@dnd-kit/core";
import { useDroppableReactDnd } from "../../../hooks/useDroppableReactDnd.ts";
import { OpenedCardModal, useGameUIStates } from "../../../hooks/useGameUIStates.ts";

export default function PlayerTrash() {
    const myTrash = useGameBoardStates((state) => state.myTrash);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);

    const openedCardModal = useGameUIStates((state) => state.openedCardModal);
    const setOpenedCardModal = useGameUIStates((state) => state.setOpenedCardModal);

    const effectInTrash = getCardLocationById(cardIdWithEffect ?? "") === "myTrash";
    const targetInTrash = getCardLocationById(cardIdWithTarget ?? "") === "myTrash";

    const isMyTrashOpened = openedCardModal === OpenedCardModal.MY_TRASH;
    const isMySecurityOpened = openedCardModal === OpenedCardModal.MY_SECURITY;

    function handleClick() {
        setOpenedCardModal(isMyTrashOpened ? false : OpenedCardModal.MY_TRASH);
    }

    const { setNodeRef, isOver } = useDroppableReactDnd({ 
        id: "myTrash", 
        data: { accept: ["card", "card-stack"] },
    });

    const topCard = myTrash[myTrash.length - 1];

    const {
        attributes,
        listeners,
        setNodeRef: drag,
        isDragging,
    } = useDraggable({
        id: topCard?.id + "_myTrash" + String(openedCardModal), // prevent colliding with id in CardModal
        data: {
            type: "card",
            content: {
                id: topCard?.id,
                location: "myTrash",
                cardNumber: topCard?.cardNumber,
                cardType: topCard?.cardType,
                name: topCard?.name,
                imgSrc: topCard?.imgUrl,
                isFaceUp: true,
            },
        },
    });

    return (
        <Container ref={setNodeRef as any}>
            {(myTrash.length === 0 || (isDragging && myTrash.length === 1)) && !isMyTrashOpened && (
                <PlaceholderDiv isOver={isOver}>
                    <StyledTrashIcon />
                </PlaceholderDiv>
            )}
            {myTrash.length > 0 &&
                (!isMyTrashOpened || (isDragging && myTrash.length > 1)) &&
                !(isDragging && myTrash.length === 1) && (
                    <CardImg
                        className={isMySecurityOpened ? undefined : "custom-hand-cursor"}
                        style={{ cursor: isMySecurityOpened ? "not-allowed" : undefined }}
                        src={isDragging ? myTrash[myTrash.length - 2]?.imgUrl : topCard?.imgUrl}
                        alt={"myTrash"}
                        title="Open trash"
                        onClick={isMySecurityOpened ? undefined : handleClick}
                        onError={handleImageError}
                        isOver={isOver}
                        ref={drag}
                        {...attributes}
                        {...listeners}
                    />
                )}
            {isMyTrashOpened && (
                <StyledCloseButtonDiv onClick={handleClick} className={"button"}>
                    <CloseTrashIcon style={{ color: "ghostwhite", fontSize: "250%" }} />
                </StyledCloseButtonDiv>
            )}
            <StyledSpan>{myTrash.length}</StyledSpan>
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
    transform: translateY(10%) scale(1.1);
`;

const PlaceholderDiv = styled.div<{ isOver?: boolean }>`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 3px;
    background: rgba(${({ isOver }) => (isOver ? "180, 180, 180" : "15, 15, 15")}, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(${({ isOver }) => (isOver ? "25, 25, 25" : "220, 220, 220")}, 0.8);
    font-family: Naston, sans-serif;
    transition: all 0.1s ease-in-out;
`;

const CardImg = styled.img<{ isOver?: boolean }>`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 5px;
    transition: all 0.1s ease-in-out;
    filter: drop-shadow(${({ isOver }) => (isOver ? "0px 0px 1px whitesmoke" : "1px 1px 2px #060e18")});
    scale: 1.1;

    &:hover {
        filter: drop-shadow(0px 0px 3px #af0c3d) brightness(1.1) saturate(1.2);
    }
`;

const StyledSpan = styled.span`
    position: absolute;
    bottom: -30px;
    left: 46%;
    font-family: Awsumsans, sans-serif;
    font-style: italic;
    transition: all 0.1s ease;
    pointer-events: none;
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
    color: ghostwhite;

    @media (max-height: 500px) {
        font-size: 1.25em;
    }
`;

const StyledCloseButtonDiv = styled.div`
    height: 100%;
    aspect-ratio: 7 / 10;
    border-radius: 5px;
    background: rgba(66, 22, 185, 0.82);
    box-shadow: inset 0 0 5px 2px rgba(245, 245, 245, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.15s;

    &:hover {
        background: rgba(73, 25, 218, 0.82);
        box-shadow: inset 0 0 2px 2px rgba(213, 213, 213, 0.3);
    }
`;
