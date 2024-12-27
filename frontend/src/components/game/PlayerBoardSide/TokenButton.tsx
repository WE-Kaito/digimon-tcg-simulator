import styled from "@emotion/styled";
import hackmonButton from "../../../assets/hackmon-chip.png";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

export default function TokenButton() {
    const setTokenModal = useGameUIStates((state) => state.setTokenModal);

    return <StyledImg alt="create token" src={hackmonButton} onClick={() => setTokenModal(true)} />;
}

const StyledImg = styled.img`
  grid-area: tokens;
  margin: 8% 2% 2% 2%;
  width: 97%;
  height: 90%;
  transition: all 0.1s ease;
  opacity: 0.7;
  cursor: pointer;

  &:hover {
    opacity: 1;
    filter: drop-shadow(0 0 3px rgb(245, 190, 87));
  }
  
  @media (max-width: 768px) {
    max-width: 26px;
    max-height: 26px;
  }
`;
