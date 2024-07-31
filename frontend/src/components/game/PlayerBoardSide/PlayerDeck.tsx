import styled from "@emotion/styled";
import deckBackSrc from "../../../assets/deckBack.png";
import { Phase } from "../../../utils/types.ts";
import { getSleeve } from "../../../utils/sleeves.ts";
import { useGame } from "../../../hooks/useGame.ts";
import { useContextMenu } from "react-contexify";
import { ChangeHistoryTwoTone as TriangleIcon } from "@mui/icons-material";

//TODO: nextPhase as Prop and add refs as shown:
/**
 * <Container>
 *             <StyledSpan>{myDeckField.length}</StyledSpan>
 *
 *             {mySleeve !== "Default" && <SleeveImg alt="sleeve" src={getSleeve(mySleeve)}/>}
 *
 *             <DeckImg ref={dropToDeck} alt="deck" src={deckBackSrc} isOver={isOverDeckTop}
 *                      onClick={handleClick} onContextMenu={(e) => showDeckMenu({event: e})}
 *             />
 *
 *             <DeckBottomZone ref={dropToDeckBottom} isOver={isOverBottom}>
 *                 <DBZSpan isOver={isOverBottom} canDrop={canDropToDeckBottom}>
 *                     <TriangleIcon sx={{ fontSize: 10 }}/>
 *                     <TriangleIcon sx={{ fontSize: 10 }}/>
 *                     <TriangleIcon sx={{ fontSize: 10 }}/>
 *                 </DBZSpan>
 *             </DeckBottomZone>
 *         </Container>
 */
export default function PlayerDeck() {
    const [myDeckField, mySleeve, nextPhaseTrigger] = useGame((state) => [state.myDeckField, state.mySleeve, state.nextPhaseTrigger]);
    const moveCard = useGame((state) => state.moveCard); // temporary
    const {show: showDeckMenu} = useContextMenu({id: "deckMenu"});

    function handleClick() {
        // nextPhaseTrigger(nextPhase, Phase.DRAW);
        // moveDeckCard("myHand")
        moveCard(myDeckField[0].id, "myDeckField", "myHand"); // temporary
    }

    return (
        <Container>
            <StyledSpan>{myDeckField.length}</StyledSpan>

            {mySleeve !== "Default" && <SleeveImg alt="sleeve" src={getSleeve(mySleeve)}/>}

            <DeckImg alt="deck" src={deckBackSrc} isOver={false}
                     onClick={handleClick} onContextMenu={(e) => showDeckMenu({event: e})}
            />

            <DeckBottomZone isOver={false}>
                    <TriangleIcon sx={{ fontSize: 12 }}/>
                    <TriangleIcon sx={{ fontSize: 12 }}/>
                    <TriangleIcon sx={{ fontSize: 12 }}/>
            </DeckBottomZone>
        </Container>
    );
}

const Container = styled.div`
  grid-area: deck;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const StyledSpan = styled.span`
  width: 100%;
  position: absolute;
  top: -21px;
  left: 52%;
  transform: translateX(-50%);
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  transition: all 0.1s ease;
  @media (max-height: 500px) {
    font-size: 0.8em;
    top: -18px;
  }
`;

const DeckImg = styled.img<{ isOver?: boolean }>`
  height: 66.67%;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;
  z-index: 2;
  filter: ${({isOver}) => isOver ? "drop-shadow(0 0 1px #eceaea) saturate(1.1) brightness(0.95)" : "none"};

  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const SleeveImg = styled.img<{ gameHasStarted?: boolean }>`
  position: absolute;
  height: 64.5%;
  top: 1px;
  left: 49%;
  transform: translateX(-50%);
  border-radius: 5px;
  z-index: 3;
  pointer-events: none;
`;

const DeckBottomZone = styled.div<{ isOver: boolean }>`
  z-index: 1;
  height: 20%;
  transform: translate(1px,-5%);
  width: 78%;
  border-radius: 5px;
  border: ${({isOver}) => isOver ? "#DAD8D5E0 solid 2px" : "#0c0c0c dashed 2px"};
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  @media (max-height: 500px) {
    gap: 1px;
    svg {
      font-size: 0.5em;
    }
  }
`;
