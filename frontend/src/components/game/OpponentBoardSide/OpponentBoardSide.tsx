import styled from "@emotion/styled";
import {SIDE} from "../../../utils/types.ts";
import BattleArea from "../PlayerBoardSide/BattleArea.tsx";
import Trash from "../PlayerBoardSide/Trash.tsx";
import SecurityStack from "../PlayerBoardSide/SecurityStack.tsx";
import EventUtils from "../PlayerBoardSide/EventUtils/EventUtils.tsx";
import OpponentEggDeck from "./OpponentEggDeck.tsx";
import OpponentDeck from "./OpponentDeck.tsx";
import OpponentHand from "./OpponentHand.tsx";
import {useDroppable} from "@dnd-kit/core";

export default function OpponentBoardSide() {
    const {setNodeRef, isOver} = useDroppable({ id: "opponentSecurity", data: { accept: ["card"] } });
    return (
        <LayoutContainer>
            <SecurityStack isOpponent dropRef={setNodeRef} isOverOpponent={isOver}/>
            <OpponentEggDeck/>
            {Array.from({ length: 15 }).map((_, index) => (
                <BattleArea key={index} num={index + 1} side={SIDE.OPPONENT}/>
            ))}
            <BattleArea isBreeding side={SIDE.OPPONENT}/>
            <EventUtils isOpponent/>
            <Trash side={SIDE.OPPONENT}/>
            <OpponentDeck />
            <OpponentHand />
        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
  transform: translateY(5px);
  grid-column: 1 / -1;
  grid-row: 1 / 7;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-template-areas: 
          ". . breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand"
          ". . breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand"
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 hand hand hand hand hand hand hand hand hand hand hand"
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . deck deck ."
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 event-utils event-utils event-utils event-utils event-utils trash trash deck-utils deck deck ."
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 event-utils event-utils event-utils event-utils event-utils trash trash deck-utils deck deck .";
  gap: 1px;
  position: relative;
`;
