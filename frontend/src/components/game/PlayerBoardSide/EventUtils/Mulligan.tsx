import {BootStage} from "../../../../utils/types.ts";
import {Stack} from "@mui/material";
import styled from "@emotion/styled";
import {useGame} from "../../../../hooks/useGame.ts";
import {useSound} from "../../../../hooks/useSound.ts";

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
        <>
            {bootStage === BootStage.MULLIGAN_DONE && !getOpponentReady() &&
                <MulliganSpan style={{top: 3}}>Waiting for opponent...</MulliganSpan>}
            {bootStage === BootStage.MULLIGAN &&
                <Stack>
                    <MulliganSpan>KEEP HAND?</MulliganSpan>
                    <Stack direction={"row"}>
                        <MulliganButton onClick={() => handleMulligan(true)}>NO</MulliganButton>
                        <MulliganButton2 onClick={() => handleMulligan(false)}>YES</MulliganButton2>
                    </Stack>
                </Stack>}
        </>
    );
}

//TODO: Styling
const MulliganButton = styled.div`
  border-radius: 5px;
  background: #fad219;
  color: #111921;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Sansation, sans-serif;
  text-shadow: 0 0 1px #111921;
  padding: 0 3px 0 3px;
  font-size: 1.2em;
  filter: drop-shadow(3px 3px 1px #131313);
  transition: all 0.05s ease;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(2px 2px 1px #131313);
    background-color: #f8681a;
    transform: translateY(1px);
  }
`;

const MulliganButton2 = styled(MulliganButton)`
  left: 11px;
  &:hover {
    background-color: #51b60a;
  }
`;

const MulliganSpan = styled.span`
  font-family: Cuisine, sans-serif;
  font-size: 17px;
  color: #fad219;
  filter: drop-shadow(2px 2px 1px #131313);
  cursor: default;
`;
