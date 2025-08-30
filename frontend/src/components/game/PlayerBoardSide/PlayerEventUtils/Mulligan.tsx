import { BootStage } from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import { useGameBoardStates } from "../../../../hooks/useGameBoardStates.ts";
import { ShuffleOnOutlined as ShuffleIcon } from "@mui/icons-material";
import { WSUtils } from "../../../../pages/GamePage.tsx";
import { notifyInfo } from "../../../../utils/toasts.ts";
import { useSettingStates } from "../../../../hooks/useSettingStates.ts";
import { useState } from "react";

export default function Mulligan({ wsUtils, fontSize }: { wsUtils?: WSUtils; fontSize: number }) {
    const bootStage = useGameBoardStates((state) => state.bootStage);

    const [hasDecided, setHasDecided] = useState(false);

    const seenMulliganTutorial = useSettingStates((state) => state.seenMulliganTutorial);
    const setSeenMulliganTutorial = useSettingStates((state) => state.setSeenMulliganTutorial);

    function handleMulligan(mulliganWanted: boolean) {
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【MULLIGAN】`);
        wsUtils?.sendMessage(wsUtils.matchInfo.gameId + ":/mulligan:" + mulliganWanted);

        if (!seenMulliganTutorial && mulliganWanted) {
            notifyInfo("Mulligan will now wait for both players to decide");
            setSeenMulliganTutorial(true);
        }

        setHasDecided(true);
    }

    if (bootStage !== BootStage.MULLIGAN) return <></>;

    return (
        <Container>
            {hasDecided ? (
                <MulliganSpan style={{ top: 3, fontSize }}>Waiting for opponent ...</MulliganSpan>
            ) : (
                <>
                    <MulliganSpan style={{ fontSize: fontSize }}>MULLIGAN?</MulliganSpan>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <MulliganButton onClick={() => handleMulligan(true)} style={{ fontSize }}>
                            YES
                            <ShuffleIcon sx={{ ml: 1 }} />
                        </MulliganButton>
                        <MulliganButton2 onClick={() => handleMulligan(false)} style={{ fontSize }}>
                            NO
                        </MulliganButton2>
                    </div>
                </>
            )}
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    width: 80%;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
`;

const MulliganButton = styled.div`
    border-radius: 3px;
    border: 1px solid rgba(75, 75, 75, 0.6);
    background: rgb(10, 129, 81);
    color: ghostwhite;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Sansation, sans-serif;
    padding: 0 5px 0 5px;
    line-height: 1.2;
    filter: drop-shadow(3px 3px 1px #131313);
    transition: all 0.05s ease;

    svg {
        font-size: 0.8em;
    }

    &:hover {
        cursor: pointer;
        filter: drop-shadow(2px 2px 1px #131313);
        background-color: rgb(8, 147, 105);
        transform: translateY(1px);

        svg {
            color: #7767e7;
            filter: drop-shadow(0 0 3px #131313);
        }
    }

    &:active {
        filter: none;
        background-color: rgb(1, 180, 85);
        transform: translate(1px, 2px);

        svg {
            color: #3842ff;
        }
    }
`;

const MulliganButton2 = styled(MulliganButton)`
    background-color: #9f2747;

    &:hover {
        background-color: #ce345d;
    }

    &:active {
        background-color: #d71649;
    }
`;

const MulliganSpan = styled.span`
    font-family: "League Spartan", sans-serif;
    line-height: 1.2;
    color: rgb(250, 219, 77);
    filter: drop-shadow(2px 2px 1px #131313);
`;
