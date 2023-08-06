import styled from "@emotion/styled";

type Props = {
    timer: number,
    timerOpen: boolean,
    surrenderOpen: boolean,
    setSurrenderOpen: (surrenderOpen:boolean) => void,
    opponentLeft: boolean,
    handleSurrender: () => void,
}

export default function SurrenderMoodle({timer, timerOpen, surrenderOpen, setSurrenderOpen, opponentLeft, handleSurrender} : Props) {
    return (
        <Container>
            {!timerOpen ?
                (<>
                    <SurrenderSpan>Do you really want to surrender?</SurrenderSpan>
                    <div style={{width: 390, display: "flex", justifyContent: "space-between"}}>
                        <CancelSurrenderButton
                            onClick={() => setSurrenderOpen(!surrenderOpen)}>CANCEL</CancelSurrenderButton>
                        <SurrenderButton onClick={handleSurrender}>SURRENDER</SurrenderButton>
                    </div>
                </>)
                :
                (<>
                    <SurrenderSpan>{surrenderOpen ? "You surrendered." : `${opponentLeft ? "Opponent left." : "You win!"}`} GAME ENDING...</SurrenderSpan>
                    <SurrenderSpan style={{fontFamily:"Awsumsans, sans-serif"}}>{timer}</SurrenderSpan>
                </>)
            }
        </Container>
    );
}

const Container = styled.div`
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

  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const SurrenderSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  text-shadow: black 2px 4px 2px;
`;

const CancelSurrenderButton = styled.button`
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
