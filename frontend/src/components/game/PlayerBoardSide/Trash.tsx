import {handleImageError} from "../../../utils/functions.ts";
import effectAnimation from "../../../assets/lotties/activate-effect-animation.json";
import targetAnimation from "../../../assets/lotties/target-animation.json";
import styled from "@emotion/styled";
import {useGame} from "../../../hooks/useGame.ts";
import Lottie from "lottie-react";
import {useRef, useState} from "react";
import {SIDE} from "../../../utils/types.ts";
import DeleteIcon from '@mui/icons-material/Delete';

export default function Trash({side}: {side: SIDE}) {
    const [myTrash, opponentTrash, getCardLocationById, cardIdWithEffect, cardIdWithTarget] = useGame((state) =>
        [state.myTrash, state.opponentTrash, state.getCardLocationById, state.cardIdWithEffect, state.cardIdWithTarget]);

    const isMySide = side === SIDE.MY;
    const trash = isMySide ? myTrash : opponentTrash;
    const effectInTrash = getCardLocationById(cardIdWithEffect ?? "") === `${side}Trash`;
    const targetInTrash = getCardLocationById(cardIdWithTarget ?? "") === `${side}Trash`;

    const [myTrashModal, setMyTrashMoodle] = useState<boolean>(false);
    const [opponentTrashModal, setOpponentTrashMoodle] = useState<boolean>(false);

    function handleClick() {
        if (side === SIDE.MY) {
            setMyTrashMoodle(!myTrashModal);
            setOpponentTrashMoodle(false);
        } else {
            setOpponentTrashMoodle(!opponentTrashModal);
            setMyTrashMoodle(false);
        }
    }
    //TODO: add ref and isOver
    const dropToTrash = useRef<HTMLDivElement>(null);
    const isOverTrash = false;

    return (
        <Container>
            {myTrash.length === 0
                ? <PlaceholderDiv ref={isMySide ? dropToTrash : null}
                                  isOver={isMySide && isOverTrash}>
                    <StyledTrashIcon side={side}/>
                </PlaceholderDiv>
                : <CardImg ref={isMySide ? dropToTrash : null} src={trash[trash.length - 1].imgUrl}
                           alt={"myTrash"} title="Open trash"
                           onClick={handleClick}
                           onError={handleImageError}
                           isOver={isMySide && isOverTrash}/>
            }
            <StyledSpan>{trash.length}</StyledSpan>
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
`;

const PlaceholderDiv = styled.div<{ isOver?: boolean }>`
  height: 100%;
  aspect-ratio: 7 / 10;
  border-radius: 5px;
  border: ${({isOver}) => isOver ? '#8d8d8d' : '#0c0c0c'} solid 2px;
  background: rgba(0, 0, 0, 0.5);
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
  filter: drop-shadow(${({isOver}) => isOver ? '0px 0px 1px whitesmoke' : '1px 1px 2px #060e18'});

  &:hover {
    filter: drop-shadow(0px 0px 3px #af0c3d) brightness(1.1) saturate(1.2);
  }
`;

const StyledSpan = styled.span`
  position: absolute;
  bottom: -26px;
  left: 46%;
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transition: all 0.1s ease;
  @media (max-height: 500px) {
    font-size: 0.8em;
    left: 42.5%;
    bottom: -23px;
  }
`;

const StyledLottie = styled(Lottie)<{ isOpponentTrash?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
`;

const StyledTrashIcon = styled(DeleteIcon)<{ side: SIDE }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${({side}) => side === SIDE.MY ? "0" : "180deg"});
  opacity: 0.5;
  font-size: 2.5em;
  @media (max-height: 500px) {
    font-size: 1.5em;
  }
`;
