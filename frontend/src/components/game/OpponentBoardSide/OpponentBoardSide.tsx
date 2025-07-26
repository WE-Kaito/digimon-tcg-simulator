import styled from "@emotion/styled";
import { SIDE } from "../../../utils/types.ts";
import BattleArea from "../BattleArea.tsx";
import DigimonField from "../DigimonField.tsx";
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
import RestartRequestModal from "../ModalDialog/RestartRequestModal.tsx";
import SurrenderModal from "../ModalDialog/SurrenderModal.tsx";
import { useState } from "react";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";

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
                    <ReportButton matchInfo={wsUtils.matchInfo} iconFontSize={`${iconWidth - 5}px`} />

                    <PanelButton
                        className={"button"}
                        onClick={() => setSurrenderModal(true)}
                        style={{ gridArea: "surrender", transform: `translate(-4px, -1px)` }}
                    >
                        <SurrenderIcon className={"button"} sx={{ fontSize: iconWidth - 5, color: "blanchedalmond" }} />
                    </PanelButton>
                    <PanelButton
                        className={"button"}
                        onClick={() => setRestartRequestModal(true)}
                        style={{ gridArea: "restart", transform: `translate(-4px, -${iconWidth / 5}px)` }}
                    >
                        <RestartIcon className={"button"} sx={{ fontSize: iconWidth - 5, color: "mediumaquamarine" }} />
                    </PanelButton>
                </>
            )}

            <OpponentSecurityStack />
            <OpponentEggDeck />
            <BattleArea side={SIDE.OPPONENT} wsUtils={wsUtils} />
            <DigimonField isBreeding side={SIDE.OPPONENT} />
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
        ". . . . . . . . hand hand hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . . .               event-utils event-utils event-utils event-utils event-utils event-utils report"
        ". . . . . . . . hand hand hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . egg-deck egg-deck event-utils event-utils event-utils event-utils event-utils event-utils surrender"
        ". . . . . . . . hand hand hand hand hand hand hand hand hand hand hand hand hand . SS SS SS . egg-deck egg-deck event-utils event-utils event-utils event-utils event-utils event-utils restart"
        "deck deck  BA13 BA13 BA13 BA13 BA12 BA12 BA12 BA12 BA12 BA11 BA11 BA11 BA11 BA11 BA10 BA10 BA10 BA10 BA10 BA9 BA9 BA9 BA9 BA9 breeding breeding player player player player player player player"
        "deck deck  BA13 BA13 BA13 BA13 BA12 BA12 BA12 BA12 BA12 BA11 BA11 BA11 BA11 BA11 BA10 BA10 BA10 BA10 BA10 BA9 BA9 BA9 BA9 BA9 breeding breeding . . . . . . ."
        ". .  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    breeding breeding . . . . . . ."
        "trash trash  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    breeding breeding . . . . . . ."
        "trash trash  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1            . .             . . . . . . ."
        ". .  LA8 BA8 BA8 LA7 BA7 BA7 LA6 BA6 BA6 LA5 BA5 BA5 LA4 BA4 BA4 LA3 BA3 BA3 LA2 BA2 BA2 LA1 BA1 BA1                    . .             . . . . . . .";
    gap: 1px;
    position: relative;
`;

const PanelButton = styled.div`
    width: 100%;
    height: 80%;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-left: none;
    border-radius: 0 3px 3px 0;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;

    &:hover {
        background: rgba(26, 179, 201, 0.35);
    }
`;
