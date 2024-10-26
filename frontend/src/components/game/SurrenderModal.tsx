import styled from "@emotion/styled";
import {WSUtils} from "../../pages/GamePage.tsx";
import {Dispatch, SetStateAction} from "react";
import {useGame} from "../../hooks/useGame.ts";

type Props = {
    setSurrenderModal: Dispatch<SetStateAction<boolean>>,
    wsUtils: WSUtils,
}

export default function SurrenderModal( { setSurrenderModal, wsUtils }: Props ) {
    const { sendMessage, matchInfo: { gameId, opponentName } } = wsUtils;

    const [setEndModal, setEndModalText] = useGame((state) => [state.setEndModal, state.setEndModalText]);

    function handleSurrender() {
        setSurrenderModal(false);
        setEndModal(true);
        setEndModalText("🏳️ You surrendered.");
        sendMessage(`${gameId}:/surrender:${opponentName}`);
        // if (onlineCheckTimeoutRef.current !== null) {
        //   clearTimeout(onlineCheckTimeoutRef.current);
        //   onlineCheckTimeoutRef.current = null;
        // }
    }

    return (
        <Container>
            <StyledSpan>Do you want to surrender?</StyledSpan>
            <div style={{width: 390, display: "flex", justifyContent: "space-between"}}>
                <SurrenderButton onClick={handleSurrender}>SURRENDER</SurrenderButton>
                <CancelSurrenderButton onClick={() => setSurrenderModal(false)}>CANCEL</CancelSurrenderButton>
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

export const CancelSurrenderButton = styled.button`
  cursor: pointer;
  width: 160px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 0;
  background: #D9D9D9;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 20px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

const SurrenderButton = styled(CancelSurrenderButton)`
  background-color: #c03427;

  &:hover {
    background: #da483b;
  }

  &:active {
    background: #e72737;
  }
`;

export const AcceptButton = styled(CancelSurrenderButton)`
  background-color: #27c06e;
  padding: 0;
  &:hover {
    background: #3bdab5;
  }
  &:active {
    background: #27e747;
  }
`;
