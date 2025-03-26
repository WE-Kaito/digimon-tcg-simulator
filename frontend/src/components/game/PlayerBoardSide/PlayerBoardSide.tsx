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
import PhaseIndicator from "../PhaseIndicator.tsx";
import PlayerCard from "../PlayerCard.tsx";

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
            <PlayerCard side={SIDE.MY} wsUtils={wsUtils} />
            <PhaseIndicator wsUtils={wsUtils} />
        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 12 / 21;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-template-areas: 
          "SS-TFU SS SS SS-TFD BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
          "SS-BFU SS SS SS-BFD BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
          ". . breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
          "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
          "egg-deck egg-deck breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 . . . . . . . . . . ."
          "egg-deck-bottom egg-deck-bottom breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 drag-toggle trash trash deck-utils deck deck . player player player player"
          ". . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand . . . . drag-toggle trash trash deck-utils deck deck . player player player player"
          ". phase phase phase phase phase phase . . hand hand hand hand hand hand hand hand hand hand hand event-utils event-utils event-utils event-utils event-utils . . . deck deck . player player player player"
          ". phase phase phase phase phase phase . eye hand hand hand hand hand hand hand hand hand hand hand event-utils event-utils event-utils event-utils event-utils . . tokens . . . player player player player";
        
  gap: 1px;
  position: relative;
  max-height: 100%;
  max-width: 100%;
`;
