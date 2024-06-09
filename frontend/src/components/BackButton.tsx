import styled from "@emotion/styled";
import {useNavigate} from "react-router-dom";
import {useSound} from "../hooks/useSound.ts";

export default function BackButton( {isOnEditPage}: {isOnEditPage?: boolean}) {
    const navigate = useNavigate();

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    function handleClick() {
        navigate(isOnEditPage ? "/profile" : "/");
        playButtonClickSfx();
    }

    return <StyledButton onClick={handleClick}><StyledSpan>back</StyledSpan>
    </StyledButton>
}

const StyledButton = styled.button`
  height: 40px;
  width: 70px;
  background: rgba(20, 20, 20, 0.9);
  border: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.25)) ;

  &:hover {
    background: rgba(192, 192, 192, 0.85);
    filter: drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.25));
  }
`;

const StyledSpan = styled.span`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  font-size: 0.9em;
  margin: 0;
  text-shadow: 1px 2px 1px #03060a;
  letter-spacing: 2px;
  color: #e1e1e0;
`;
