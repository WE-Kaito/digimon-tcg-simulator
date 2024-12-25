import styled from "@emotion/styled";
import {CropPortrait as SingleIcon, ContentCopy as StackIcon} from "@mui/icons-material";
import {DragMode} from "../../../utils/types.ts";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

export default function DragToggleButton() {
    const [dragMode, toggleDragMode] = useGameUIStates((state) => [state.dragMode, state.toggleDragMode]);

    return (
        <Container onClick={toggleDragMode}>
            <SingleButton active={dragMode === DragMode.SINGLE}>
                <SingleIcon/>
            </SingleButton>
            <StackButton active={dragMode === DragMode.STACK}>
                <StackIcon/>
            </StackButton>
        </Container>
    );
}

const Container = styled.div`
  grid-area: drag-toggle;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  outline: 1px solid rgba(167, 189, 219, 0.1);
  outline-offset: -1px;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 3px rgba(248, 248, 255, 0.2);
  cursor: pointer;
`;

const Button = styled.div<{ active: boolean }>`
  width: calc(100% - 2px);
  height: calc(50% - 1px);
  margin-left: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({active}) => active ? "rgba(248,248,255,0.8)" : "transparent"};
  color: ${({active}) => active ? "black" : "rgba(173,173,173,0.9)"};
  box-shadow: ${({active}) => active ? "inset 0 0 3px rgba(0,0,0,0.5)" : "none"};
`;

const SingleButton = styled(Button)`
  margin-bottom: 1px;
  border-radius: 3px 3px 0 0;
`;

const StackButton = styled(Button)`
  margin-top: 1px;
  border-radius: 0 0 3px 3px;
`;
