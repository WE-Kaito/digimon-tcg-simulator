import styled from "@emotion/styled";
import { SIDE } from "../../../utils/types.ts";
import BattleArea from "../PlayerBoardSide/BattleArea.tsx";
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
            {Array.from({ length: 15 }).map((_, index) => (
                <BattleArea key={"opponentBA" + index} num={index + 1} side={SIDE.OPPONENT} />
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
        ". . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand event-utils event-utils event-utils event-utils event-utils . restart . surrender . report player player player player"
        ". . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand event-utils event-utils event-utils event-utils event-utils . . . . . . player player player player"
        ". . . . . . . . . hand hand hand hand hand hand hand hand hand hand hand . . . . . trash trash . deck deck . player player player player"
        ". . breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 . trash trash . deck deck . player player player player"
        ". . breeding breeding BA11 BA11 BA11 BA11 BA12 BA12 BA12 BA12 BA13 BA13 BA13 BA13 BA14 BA14 BA14 BA14 BA15 BA15 BA15 BA15 . . . . . . . . . . ."
        "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
        "egg-deck egg-deck breeding breeding BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
        ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . ."
        ". SS SS . BA1 BA1 BA2 BA2 BA3 BA3 BA4 BA4 BA5 BA5 BA6 BA6 BA7 BA7 BA8 BA8 BA9 BA9 BA10 BA10 . . . . . . . . . . .";
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
