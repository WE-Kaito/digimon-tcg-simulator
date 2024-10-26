import styled from "@emotion/styled";
import {Dispatch, SetStateAction} from "react";
import {WSUtils} from "../../pages/GamePage.tsx";
import {notifyRequestedRestart} from "../../utils/toasts.ts";

type Props = {
    setRestartRequestModal: Dispatch<SetStateAction<boolean>>,
    wsUtils: WSUtils,
}

export default function RestartRequestModal( { setRestartRequestModal, wsUtils }: Props ) {
    const { sendMessage, matchInfo: { gameId, opponentName } } = wsUtils;

    function sendRequest(order: "AsFirst" | "AsSecond") {
        sendMessage(`${gameId}:/restartRequest${order}:${opponentName}`);
        notifyRequestedRestart();
        setRestartRequestModal(false);
    }

    return (
        <Container style={{width: 650}}>
            <StyledSpan>Send Rematch request:</StyledSpan>
            <div style={{width: 560, display: "flex", justifyContent: "space-between"}}>
                <AcceptButton onClick={() => sendRequest("AsFirst")}>GO FIRST</AcceptButton>
                <AcceptButton style={{ backgroundColor: "#fad219"}}  onClick={() => sendRequest("AsSecond")}>GO SECOND</AcceptButton>
                <CancelButton onClick={() => setRestartRequestModal(false)}>CANCEL</CancelButton>
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

const CancelButton = styled(ButtonBase)`
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
