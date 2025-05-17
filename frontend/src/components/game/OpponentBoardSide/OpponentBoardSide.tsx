import styled from "@emotion/styled";
import { SIDE } from "../../../utils/types.ts";
import BattleArea from "../BattleArea.tsx";
import OpponentSecurityStack from "./OpponentSecurityStack.tsx";
import OpponentEggDeck from "./OpponentEggDeck.tsx";
import OpponentDeck from "./OpponentDeck.tsx";
import OpponentHand from "./OpponentHand.tsx";
import OpponentTrash from "./OpponentTrash.tsx";
import OpponentEventUtils from "./OpponentEventUtils/OpponentEventUtils.tsx";
import { WSUtils } from "../../../pages/GamePage.tsx";
import PlayerCard from "../PlayerCard.tsx";
import ReportButton from "../ReportButton.tsx";
import { Flag as SurrenderIcon, RestartAlt as RestartIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import RestartRequestModal from "../ModalDialog/RestartRequestModal.tsx";
import SurrenderModal from "../ModalDialog/SurrenderModal.tsx";
import { useState } from "react";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import LinkArea from "../LinkArea.tsx";

export default function OpponentBoardSide({ wsUtils }: { wsUtils?: WSUtils }) {
    const iconWidth = useGeneralStates((state) => state.cardWidth * 0.45);

    const [restartRequestModal, setRestartRequestModal] = useState<boolean>(false);
    const [surrenderModal, setSurrenderModal] = useState<boolean>(false);

    return (
        <LayoutContainer>
            {wsUtils && (
                <>
                    {restartRequestModal && (
                        <RestartRequestModal setRestartRequestModal={setRestartRequestModal} wsUtils={wsUtils} />
                    )}
                    {surrenderModal && <SurrenderModal setSurrenderModal={setSurrenderModal} wsUtils={wsUtils} />}
                    <ReportButton matchInfo={wsUtils.matchInfo} iconFontSize={`${iconWidth}px`} />
                    <StyledIconButton
                        onClick={() => setSurrenderModal(true)}
                        sx={{ color: "blanchedalmond", gridArea: "surrender" }}
                    >
                        <SurrenderIcon sx={{ fontSize: iconWidth }} />
                    </StyledIconButton>
                    <StyledIconButton
                        onClick={() => setRestartRequestModal(true)}
                        sx={{ color: "mediumaquamarine", gridArea: "restart" }}
                    >
                        <RestartIcon sx={{ fontSize: iconWidth }} />
                    </StyledIconButton>
                </>
            )}

            <OpponentSecurityStack />
            <OpponentEggDeck />
            {Array.from({ length: 13 }).map((_, index) => (
                <BattleArea key={"opponentBA" + index} num={index + 1} side={SIDE.OPPONENT} />
            ))}
            {Array.from({ length: 8 }).map((_, index) => (
                <LinkArea key={"opponentLA" + index} num={index + 1} side={SIDE.OPPONENT} wsUtils={wsUtils} />
            ))}
            <BattleArea isBreeding side={SIDE.OPPONENT} />
            <OpponentEventUtils wsUtils={wsUtils} />
            <OpponentTrash />
            <OpponentDeck />
            <OpponentHand />
            <PlayerCard side={SIDE.OPPONENT} wsUtils={wsUtils} />
        </LayoutContainer>
    );
}

const LayoutContainer = styled.div`
    grid-column: 1 / -1;
    grid-row: 1 / 10;
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    grid-template-areas:
        ". . . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . . .               event-utils event-utils event-utils event-utils event-utils event-utils report"
        ". . . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . egg-deck egg-deck event-utils event-utils event-utils event-utils event-utils event-utils surrender"
        ". . . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . egg-deck egg-deck event-utils event-utils event-utils event-utils event-utils event-utils restart"
        "deck deck  BA13 BA13 BA13 BA13 BA12 BA12 BA12 BA12 BA12 BA11 BA11 BA11 BA11 BA11 BA10 BA10 BA10 BA10 BA10 BA9 BA9 BA9 BA9 BA9 breeding breeding player player player player player player player"
        "deck deck  BA13 BA13 BA13 BA13 BA12 BA12 BA12 BA12 BA12 BA11 BA11 BA11 BA11 BA11 BA10 BA10 BA10 BA10 BA10 BA9 BA9 BA9 BA9 BA9 breeding breeding . . . . . . ."
        ". .  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    breeding breeding . . . . . . ."
        "trash trash  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    breeding breeding . . . . . . ."
        "trash trash  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1            . .             . . . . . . ."
        ". .  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    . .             . . . . . . .";
    gap: 1px;
    position: relative;
`;

const StyledIconButton = styled(IconButton)`
    max-width: 100%;
    margin: 0;
    padding: 0;
    opacity: 0.7;
    display: flex;
`;
