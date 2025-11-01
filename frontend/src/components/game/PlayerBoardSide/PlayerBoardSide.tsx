import styled from "@emotion/styled";
import PlayerSecurityStack from "./PlayerSecurityStack.tsx";
import PlayerHand from "./PlayerHand.tsx";
import PlayerDeck from "./PlayerDeck.tsx";
import BattleArea from "../BattleArea.tsx";
import BreedingArea from "../BreedingArea.tsx";
import FieldNavigationButtons from "../FieldNavigationButtons.tsx";
import { SIDE } from "../../../utils/types.ts";
import TokenButton from "./TokenButton.tsx";
import PlayerEggDeck from "./PlayerEggDeck.tsx";
import PlayerTrash from "./PlayerTrash.tsx";
import DeckUtilButtons from "./DeckUtilButtons.tsx";
import PlayerEventUtils from "./PlayerEventUtils/PlayerEventUtils.tsx";
import { WSUtils } from "../../../pages/GamePage.tsx";
import DragToggleButton from "./DragToggleButton.tsx";
import PlayerCard from "../PlayerCard.tsx";
import { useEffect, useRef } from "react";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

export default function PlayerBoardSide({ wsUtils }: { wsUtils?: WSUtils }) {
    const setCardWidth = useGeneralStates((state) => state.setCardWidth);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const updateWidth = () => setCardWidth(ref.current!.clientWidth);

        updateWidth(); // initial setzen

        const observer = new ResizeObserver(updateWidth);
        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [ref, setCardWidth]);

    return (
        <LayoutContainer>
            <PlayerEggDeck wsUtils={wsUtils} />
            <BattleArea side={SIDE.MY} wsUtils={wsUtils} />
            <BreedingArea side={SIDE.MY} wsUtils={wsUtils} ref={ref} />
            <FieldNavigationContainer>
                <FieldNavigationButtons side={SIDE.MY} />
            </FieldNavigationContainer>

            <PlayerSecurityStack wsUtils={wsUtils} />

            <PlayerEventUtils wsUtils={wsUtils} />
            <PlayerTrash />
            <DeckUtilButtons wsUtils={wsUtils} />
            <PlayerDeck wsUtils={wsUtils} />
            <PlayerHand />
            <TokenButton />
            <DragToggleButton />
            <PlayerCard side={SIDE.MY} wsUtils={wsUtils} />
        </LayoutContainer>
    );
}

const FieldNavigationContainer = styled.div`
    grid-area: field-nav;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
`;

const LayoutContainer = styled.div`
    grid-column: 1 / -1;
    grid-row: 12 / 21;
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    grid-template-areas:
        " tokens tokens                               BA1 BA1 LA1 BA2 BA2 LA2 BA3 BA3 LA3 BA4 BA4 LA4 BA5 BA5 LA5 BA6 BA6 LA6 BA7 BA7 LA7 BA8 BA8 LA8 field-nav field-nav . . . . . . ."
        " tokens tokens                               BA1 BA1 LA1 BA2 BA2 LA2 BA3 BA3 LA3 BA4 BA4 LA4 BA5 BA5 LA5 BA6 BA6 LA6 BA7 BA7 LA7 BA8 BA8 LA8 trash trash . . . . . . ."
        " breeding breeding                   BA1 BA1 LA1 BA2 BA2 LA2 BA3 BA3 LA3 BA4 BA4 LA4 BA5 BA5 LA5 BA6 BA6 LA6 BA7 BA7 LA7 BA8 BA8 LA8 trash trash . . . . . . ."
        " breeding breeding                   BA1 BA1 LA1 BA2 BA2 LA2 BA3 BA3 LA3 BA4 BA4 LA4 BA5 BA5 LA5 BA6 BA6 LA6 BA7 BA7 LA7 BA8 BA8 LA8 . . . . . . . . ."
        " breeding breeding BA9 BA9 BA9 BA9 BA9 BA10 BA10 BA10 BA10 BA10 BA11 BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 drag-toggle . . .  . . . . ."
        " breeding breeding BA9 BA9 BA9 BA9 BA9 BA10 BA10 BA10 BA10 BA10 BA11 BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 drag-toggle . player player player player player player player"
        " egg-deck egg-deck               SS SS SS SS SS   hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand . deck deck deck-utils .              event-utils event-utils event-utils event-utils event-utils event-utils ."
        " egg-deck egg-deck               SS SS SS SS SS   hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand . deck deck deck-utils .                   event-utils event-utils event-utils event-utils event-utils event-utils emote"
        " egg-deck-bottom egg-deck-bottom SS SS SS SS SS hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand hand eye deck deck deck-utils .             event-utils event-utils event-utils event-utils event-utils event-utils .";

    gap: 1px;
    position: relative;
    max-height: 100%;
    max-width: 100%;
`;
