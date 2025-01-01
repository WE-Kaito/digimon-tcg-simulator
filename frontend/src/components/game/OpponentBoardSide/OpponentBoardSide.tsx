import styled from "@emotion/styled";
import {SIDE} from "../../../utils/types.ts";
import BattleArea from "../PlayerBoardSide/BattleArea.tsx";
import OpponentSecurityStack from "./OpponentSecurityStack.tsx";
import OpponentEggDeck from "./OpponentEggDeck.tsx";
import OpponentDeck from "./OpponentDeck.tsx";
import OpponentHand from "./OpponentHand.tsx";
import OpponentTrash from "./OpponentTrash.tsx";
import OpponentEventUtils from "./OpponentEventUtils/OpponentEventUtils.tsx";
import {WSUtils} from "../../../pages/GamePage.tsx";

export default function OpponentBoardSide({ wsUtils }: { wsUtils?: WSUtils }) {
    return (
        <LayoutContainer>
            <OpponentSecurityStack />
            <OpponentEggDeck/>
            {Array.from({ length: 15 }).map((_, index) => (
                <BattleArea key={"opponentBA" + index} num={index + 1} side={SIDE.OPPONENT}/>
            ))}
            <BattleArea isBreeding side={SIDE.OPPONENT}/>
            <OpponentEventUtils wsUtils={wsUtils}/>
            <OpponentTrash />
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
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . event-utils event-utils event-utils event-utils trash trash deck-utils deck deck ."
          ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . event-utils event-utils event-utils event-utils trash trash deck-utils deck deck .";
  gap: 1px;
  position: relative;
`;
