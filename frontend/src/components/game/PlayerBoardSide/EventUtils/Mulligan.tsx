import {BootStage} from "../../../../utils/types.ts";
import styled from "@emotion/styled";
import {useGame} from "../../../../hooks/useGame.ts";
import {useSound} from "../../../../hooks/useSound.ts";
import { ShuffleOnOutlined as ShuffleIcon } from "@mui/icons-material";

export default function Mulligan() {
    const [getOpponentReady, bootStage, mulligan] = useGame((state) =>
        [state.getOpponentReady, state.bootStage, state.mulligan]);
    const [playShuffleDeckSfx] = useSound((state) => [state.playShuffleDeckSfx]);

    //TODO:
    function handleMulligan(mulliganWanted: boolean) {
        if (mulliganWanted) {
            mulligan();
        //     sendUpdate();
            playShuffleDeckSfx();
        //     sendSfx("playShuffleDeckSfx");
        //     sendChatMessage(`[FIELD_UPDATE]≔【MULLIGAN】`);
        }
        // websocket.sendMessage(gameId + ":/playerReady:" + opponentName);
        // if (getOpponentReady()) setBootStage(BootStage.GAME_IN_PROGRESS);
        // else setBootStage(BootStage.MULLIGAN_DONE);
    }

    return (
        <Container>
            {bootStage === BootStage.MULLIGAN_DONE && !getOpponentReady() &&
                <MulliganSpan style={{top: 3}}>Waiting for opponent...</MulliganSpan>}
            {bootStage === BootStage.MULLIGAN &&
                <>
                    <MulliganSpan>KEEP HAND?</MulliganSpan>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-evenly" }}>
                        <MulliganButton2 onClick={() => handleMulligan(false)}>
                            YES
                        </MulliganButton2>
                        <MulliganButton onClick={() => handleMulligan(true)}>
                            NO<ShuffleIcon/>
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const MulliganButton = styled.div`
  border-radius: 5px;
  background: #fad219;
  color: #111921;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Sansation, sans-serif;
  padding: 0 5px 0 5px;
  font-size: clamp(8px, 3.25vh, 28px);
  line-height: 1.2;
  filter: drop-shadow(3px 3px 1px #131313);
  transition: all 0.05s ease;
  svg {
    font-size: 0.8em;
  }
  
  &:hover {
    cursor: pointer;
    filter: drop-shadow(2px 2px 1px #131313);
    background-color: #f8681a;
    transform: translateY(1px);

    svg {
      color: #3842ff;
    }
  }

  &:active {
    filter: none;
    background-color: #fd4209;
    transform: translate(1px, 2px);
  }
`;

const MulliganButton2 = styled(MulliganButton)`
  &:hover {
    background-color: #51b60a;
  }

  &:active {
    background-color: #1ae004;
  }
`;

const MulliganSpan = styled.span`
  font-family: Cuisine, sans-serif;
  font-size: clamp(8px, 3vh, 28px);
  white-space: nowrap;
  text-overflow: ellipsis;
  max-height: 40px;
  line-height: 1.2;
  color: #fad219;
  filter: drop-shadow(2px 2px 1px #131313);
`;
