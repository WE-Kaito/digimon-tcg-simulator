import {handleImageError} from "../../../utils/functions.ts";
import effectAnimation from "../../../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import styled from "@emotion/styled";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import Lottie from "lottie-react";
import {OpenedCardModal} from "../../../utils/types.ts";
import DeleteIcon from '@mui/icons-material/Delete';
import {useDraggable, useDroppable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {useGeneralStates} from "../../../hooks/useGeneralStates.ts";
import {Button} from "@mui/material";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

export default function PlayerTrash() {
    const [myTrash, getCardLocationById, cardIdWithEffect, cardIdWithTarget] = useGameBoardStates((state) => [
        state.myTrash, state.getCardLocationById, state.cardIdWithEffect, state.cardIdWithTarget]);

    const [openedCardModal, setOpenedCardModal] = useGameUIStates((state) => [
        state.openedCardModal, state.setOpenedCardModal]);

    const cardWidth = useGeneralStates((state) => state.cardWidth);

    const effectInTrash = getCardLocationById(cardIdWithEffect ?? "") === "myTrash";
    const targetInTrash = getCardLocationById(cardIdWithTarget ?? "") === "myTrash";

    const isMyTrashOpened = openedCardModal === OpenedCardModal.MY_TRASH;

    function handleClick() {
        setOpenedCardModal(isMyTrashOpened ? false : OpenedCardModal.MY_TRASH);
    }

    const {setNodeRef, isOver} = useDroppable({ id: "myTrash", data: { accept: ["card", "card-stack"] } })

    const topCard = myTrash[myTrash.length - 1];

    const {
        attributes,
        listeners,
        setNodeRef: drag,
        isDragging,
        transform,
    } = useDraggable({
        id: topCard?.id + "_myTrash" + String(openedCardModal), // prevent colliding with id in CardModal
        data: { type: 'card', content: {id: topCard?.id, location: "myTrash", cardNumber: topCard?.cardNumber, cardType: topCard?.cardType, name: topCard?.name} },
    });

    return (
        <Container ref={setNodeRef}>
            {(myTrash.length === 0 || (isDragging && myTrash.length === 1)) && !isMyTrashOpened &&
                <PlaceholderDiv isOver={isOver}>
                    <StyledTrashIcon/>
                </PlaceholderDiv>
            }
            {myTrash.length > 0 && (!isMyTrashOpened || (isDragging && myTrash.length > 1)) && !(isDragging && myTrash.length === 1) &&
                <CardImg src={isDragging ? myTrash[myTrash.length - 2]?.imgUrl : topCard?.imgUrl}
                         alt={"myTrash"} title="Open trash"
                         onClick={handleClick}
                         onError={handleImageError}
                         isOver={isOver}
                         ref={drag}
                         {...attributes} {...listeners}
                />
            }
            {isDragging && !isMyTrashOpened &&
                <img alt={"trashDraggable"} src={topCard?.imgUrl} width={cardWidth}
                     style={{ position: "absolute", transform: CSS.Translate.toString(transform), cursor: "grabbing",
                              filter: "drop-shadow(0px 0px 3px #0c0c0c) brightness(1.1) saturate(1.2)"}}
                />
            }
            {isMyTrashOpened &&
                <StyledButton onClick={handleClick}
                                style={{ background: isOver ? "#6C34FAFF" : undefined}}>
                    <DeleteIcon style={{color: isOver ? "#E7C372FF" : "ghostwhite", fontSize: "250%", }}/>
                </StyledButton>
            }
            <StyledSpan>{myTrash.length}</StyledSpan>
            {effectInTrash && <StyledLottie animationData={effectAnimation} loop={true}/>}
            {targetInTrash && <StyledLottie animationData={targetAnimation} loop={true}/>}
        </Container>
    );
}

const Container = styled.div`
  grid-area: trash;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  transform: translateY(5px);
`;

const PlaceholderDiv = styled.div<{ isOver?: boolean }>`
  height: 100%;
  aspect-ratio: 7 / 10;
  border-radius: 3px;
  background: rgba(${({isOver}) => isOver ? '180, 180, 180' : '15, 15, 15'}, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(${({isOver}) => isOver ? '25, 25, 25' : '220, 220, 220'}, 0.8);
  font-family: Naston, sans-serif;
  transition: all 0.1s ease-in-out;
  cursor: ${({isOver}) => isOver ? 'grabbing' : 'default'};
`;

const CardImg = styled.img<{ isOver?: boolean }>`
  height: 100%;
  aspect-ratio: 7 / 10;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
  filter: drop-shadow(${({isOver}) => isOver ? '0px 0px 1px whitesmoke' : '1px 1px 2px #060e18'});

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

const StyledTrashIcon = styled(DeleteIcon)`
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

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  height: 55%;
  background: #7522F5CC;

  &:hover {
    background: #6C34FAFF;
  }
`;
