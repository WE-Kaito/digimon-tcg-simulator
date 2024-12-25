import {BootStage} from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import {useGameBoardStates} from "../../../../hooks/useGameBoardStates.ts";
import {useSound} from "../../../../hooks/useSound.ts";
import { ShuffleOnOutlined as ShuffleIcon } from "@mui/icons-material";
import {WSUtils} from "../../../../pages/GamePage.tsx";

export default function Mulligan({wsUtils, fontSize}: { wsUtils?: WSUtils, fontSize: number }) {
    const [getOpponentReady, bootStage, mulligan, setBootStage] = useGameBoardStates((state) =>
        [state.getOpponentReady, state.bootStage, state.mulligan, state.setBootStage]);
    const [playShuffleDeckSfx] = useSound((state) => [state.playShuffleDeckSfx]);

    function handleMulligan(mulliganWanted: boolean) {
        if (mulliganWanted) {
            mulligan();
            playShuffleDeckSfx();
            wsUtils?.sendUpdate();
            wsUtils?.sendSfx("playShuffleDeckSfx");
            wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【MULLIGAN】`);
        }
        wsUtils?.sendMessage(wsUtils.matchInfo.gameId + ":/playerReady:" + wsUtils.matchInfo.opponentName);
        if (getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
        else setBootStage(BootStage.MULLIGAN_DONE);
    }

    return (
        <Container>
            {bootStage === BootStage.MULLIGAN_DONE && !getOpponentReady() &&
                <MulliganSpan style={{top: 3, fontSize}}>Waiting for opponent ...</MulliganSpan>}
            {bootStage === BootStage.MULLIGAN &&
                <>
                    <MulliganSpan style={{ fontSize: fontSize - 4 }}>KEEP CARDS?</MulliganSpan>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between"}}>
                        <MulliganButton2 onClick={() => handleMulligan(false)} style={{ fontSize }}>
                            YES
                        </MulliganButton2>
                        <MulliganButton onClick={() => handleMulligan(true)} style={{ fontSize }}>
                            NO<ShuffleIcon sx={{ ml: 1 }}/>
                        </MulliganButton>
                    </div>
                </>}
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  gap: 5px;
`;

const MulliganButton = styled.div`
  border-radius: 3px;
  border: 2px solid rgba(250, 219, 77, 0.85);
  background: rgba(0, 0, 0, 0.15);
  color: rgb(250, 219, 77);
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
    background-color: rgba(248, 104, 26, 0.8);
    transform: translateY(1px);
    color: black;

    svg {
      color: #3842ff;
    }
  }

  &:active {
    filter: none;
    background-color: rgba(253, 66, 9, 0.8);
    transform: translate(1px, 2px);
    color: black;

    svg {
      color: #3842ff;
    }
  }
`;

const MulliganButton2 = styled(MulliganButton)`
  &:hover {
    background-color: rgba(81, 182, 10, 0.8);
  }

  &:active {
    background-color: rgba(26, 224, 4, 0.8);
  }
`;

const MulliganSpan = styled.span`
  font-family: Cuisine, sans-serif;
  line-height: 1.2;
  color: rgb(250, 219, 77);
  filter: drop-shadow(2px 2px 1px #131313);
`;
