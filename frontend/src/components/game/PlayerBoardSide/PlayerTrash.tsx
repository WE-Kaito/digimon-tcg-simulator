import { handleImageError } from "../../../utils/functions.ts";
import effectAnimation from "../../../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import Lottie from "lottie-react";
import CloseTrashIcon from "@mui/icons-material/DeleteForever";
import TrashIcon from "@mui/icons-material/Delete";
import { useDroppableReactDnd } from "../../../hooks/useDroppableReactDnd.ts";
import { OpenedCardDialog, useGameUIStates } from "../../../hooks/useGameUIStates.ts";
import { DragPreviewImage, useDrag } from "react-dnd";
import { useContextMenu } from "react-contexify";
import { getSleeve } from "../../../utils/sleeves.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function PlayerTrash() {
    const myTrash = useGameBoardStates((state) => state.myTrash);
    const getCardLocationById = useGameBoardStates((state) => state.getCardLocationById);
    const cardIdWithEffect = useGameBoardStates((state) => state.cardIdWithEffect);
    const cardIdWithTarget = useGameBoardStates((state) => state.cardIdWithTarget);
    const isOpponentOnline = useGameBoardStates((state) => state.isOpponentOnline);
    const setCardToSend = useGameBoardStates((state) => state.setCardToSend);

    const username = useGeneralStates((state) => state.user);
    const player1 = useGameBoardStates((state) => state.player1);
    const player2 = useGameBoardStates((state) => state.player2);
    const mySleeve = player1.username === username ? player1.mainSleeveName : player2.mainSleeveName;

    const openedCardDialog = useGameUIStates((state) => state.openedCardDialog);
    const setOpenedCardDialog = useGameUIStates((state) => state.setOpenedCardDialog);

    const effectInTrash = getCardLocationById(cardIdWithEffect ?? "") === "myTrash";
    const targetInTrash = getCardLocationById(cardIdWithTarget ?? "") === "myTrash";

    const isMyTrashOpened = openedCardDialog === OpenedCardDialog.MY_TRASH;
    const isMySecurityOpened = openedCardDialog === OpenedCardDialog.MY_SECURITY;

    function handleClick() {
        setOpenedCardDialog(isMyTrashOpened ? false : OpenedCardDialog.MY_TRASH);
    }

    const { setNodeRef, isOver } = useDroppableReactDnd({
        id: "myTrash",
        data: { accept: ["card", "card-stack"] },
    });

    const topCard = myTrash[myTrash.length - 1];

    const [{ isDragging }, dragRef, preview] = useDrag(
        () => ({
            type: "card",
            item: { type: "card", content: { card: topCard, location: "myTrash" } },
            canDrag: isOpponentOnline,
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
        }),
        [location, topCard, isOpponentOnline]
    );

    const { show: showContextMenu } = useContextMenu({ id: "dialogMenu", props: { index: -1, location: "", id: "" } });

    const card = isDragging ? myTrash[myTrash.length - 2] : topCard;

    return (
        <Container ref={setNodeRef as any}>
            <DragPreviewImage
                connect={preview}
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" // Transparent 1x1 GIF
            />
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
                        src={card.isFaceUp ? card.imgUrl : getSleeve(card.cardType, mySleeve)}
                        alt={"myTrash"}
                        title="Open trash"
                        onClick={isMySecurityOpened ? undefined : handleClick}
                        onError={handleImageError}
                        isOver={isOver}
                        ref={dragRef as any}
                        onContextMenu={(e) => {
                            setCardToSend({ card, location: "myTrash" });
                            showContextMenu({
                                event: e,
                                props: { index: -1, location: "myTrash", id: topCard.id, name: topCard.name },
                            });
                        }}
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
