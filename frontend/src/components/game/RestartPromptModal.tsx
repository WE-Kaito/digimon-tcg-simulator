import styled from "@emotion/styled";
import {useGame} from "../../hooks/useGame.ts";
import {WSUtils} from "../../pages/GamePage.tsx";

export default function RestartPromptModal({ wsUtils } : { wsUtils: WSUtils }) {
    const { sendMessage, matchInfo: { gameId, opponentName, user } } = wsUtils;

    const [
        restartOrder,
        restartPromptModal,
        setRestartPromptModal,
        clearBoard,
        setIsRematch
    ] = useGame((state) => [
        state.restartOrder,
        state.restartPromptModal,
        state.setRestartPromptModal,
        state.clearBoard,
        state.setIsRematch
    ]);

    function handleAcceptRestart() {
        clearBoard();
        // setEndScreen(false);
        // setRestartPromptModal(false);
        setRestartPromptModal(false);
        setIsRematch(true);
        sendMessage(`${gameId}:/acceptRestart:${opponentName}`);
        sendMessage(`${gameId}:/restartGame:${restartOrder === "first" ? user : opponentName}`);
    }

    if (!restartPromptModal) return <></>;

    return (
        <Container>
            <StyledSpan>Opponent requested a rematch</StyledSpan>
            <div style={{width: 480, display: "flex", justifyContent: "space-between"}}>
                <DenyButton onClick={() => setRestartPromptModal(false)}>DENY</DenyButton>
                <AcceptButton style={{width: 300}} onClick={handleAcceptRestart}>ACCEPT ► GOING {restartOrder}</AcceptButton>
            </div>
        </Container>
    );
}

export const Container = styled.div`
  z-index: 10000;
  position: absolute;
  width: 560px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  background: #0c0c0c;
  transition: all 0.2s ease;

  left: 53.5%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const StyledSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  text-shadow: black 2px 4px 2px;
`;

const ButtonBase = styled.button`
  cursor: pointer;
  width: 160px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 0;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 20px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

const DenyButton = styled(ButtonBase)`
  background: #c03427;

  &:hover {
    background: #da483b;
  }

  &:active {
    background: #e72737;
  }
`;

export const AcceptButton = styled(ButtonBase)`
  background: #27c06e;
  padding: 0;
  &:hover {
    background: #3bdab5;
  }
  &:active {
    background: #27e747;
  }
`;
