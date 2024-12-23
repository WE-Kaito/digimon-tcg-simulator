import styled from "@emotion/styled";
import PlayerSecurityStack from "./PlayerSecurityStack.tsx";
import PlayerHand from "./PlayerHand.tsx";
import PlayerDeck from "./PlayerDeck.tsx";
import BattleArea from "./BattleArea.tsx";
import {SIDE} from "../../../utils/types.ts";
import TokenButton from "./TokenButton.tsx";
import PlayerEggDeck from "./PlayerEggDeck.tsx";
import PlayerTrash from "./PlayerTrash.tsx";
import DeckUtilButtons from "./DeckUtilButtons.tsx";
import PlayerEventUtils from "./PlayerEventUtils/PlayerEventUtils.tsx";
import {WSUtils} from "../../../pages/GamePage.tsx";
import DragToggleButton from "./DragToggleButton.tsx";
import SecurityDropSections from "./SecurityDropSections.tsx";

export default function PlayerBoardSide({ wsUtils } : { wsUtils?: WSUtils }) {
    return (
        <LayoutContainer>
            <PlayerEggDeck wsUtils={wsUtils}/>
            {Array.from({ length: 15 }).map((_, index) => (
                <BattleArea key={"playerBA" + index} num={index + 1} side={SIDE.MY} wsUtils={wsUtils}/>
            ))}
            <BattleArea isBreeding side={SIDE.MY} wsUtils={wsUtils}/>
            <SecurityDropSections />
            <PlayerSecurityStack wsUtils={wsUtils} />
            <PlayerEventUtils wsUtils={wsUtils}/>
            <PlayerTrash />
            <DeckUtilButtons wsUtils={wsUtils}/>
            <PlayerDeck wsUtils={wsUtils} />
            <PlayerHand />
            <TokenButton />
            <DragToggleButton/>
        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 9 / 15;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-template-areas: 
          "SS-TFU SS SS SS-TFD BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 drag-toggle event-utils event-utils event-utils event-utils trash trash deck-utils deck deck ."
          "SS-BFU SS SS SS-BFD BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 drag-toggle event-utils event-utils event-utils event-utils trash trash deck-utils deck deck ."
          ". . breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 tokens . . . . . . . deck deck eye"
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 hand hand hand hand hand hand hand hand hand hand hand"
          "egg-deck egg-deck breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand"
          "egg-deck-bottom egg-deck-bottom breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 hand hand hand hand hand hand hand hand hand hand hand";
  gap: 1px;
  position: relative;
  max-height: 100%;
  max-width: 100%;
`;
