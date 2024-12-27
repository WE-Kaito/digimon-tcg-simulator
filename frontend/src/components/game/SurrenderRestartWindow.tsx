import styled from "@emotion/styled";

type Props = {
    readonly setRestartMoodle?: (restartMoodle:boolean) => void,
    readonly handleAcceptRestart?: () => void,
    readonly setSurrenderOpen?: (surrenderOpen:boolean) => void,
    readonly handleSurrender?: () => void,
    readonly restartOrder?: "first" | "second",
}

export default function SurrenderRestartWindow({setRestartMoodle, handleAcceptRestart, setSurrenderOpen, handleSurrender, restartOrder}:Props) {
    return (<>
            {(setRestartMoodle && handleAcceptRestart) &&
            <Container>
                <StyledSpan>Opponent requested a rematch</StyledSpan>
                <div style={{width: 480, display: "flex", justifyContent: "space-between"}}>
                    <SurrenderButton onClick={() => setRestartMoodle(false)}>DENY</SurrenderButton>
                    <AcceptButton style={{width: 300}} onClick={handleAcceptRestart}>ACCEPT ► GOING {restartOrder}</AcceptButton>
                </div>
            </Container>}

            {(setSurrenderOpen && handleSurrender) &&
            <Container>
                <StyledSpan>Do you want to surrender?</StyledSpan>
                <div style={{width: 390, display: "flex", justifyContent: "space-between"}}>
                    <SurrenderButton onClick={handleSurrender}>SURRENDER</SurrenderButton>
                    <CancelSurrenderButton onClick={() => setSurrenderOpen(false)}>CANCEL</CancelSurrenderButton>
                </div>
            </Container>}
        </>
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
