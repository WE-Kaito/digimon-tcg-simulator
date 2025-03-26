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

    return <StyledButton onClick={handleClick}>back➤</StyledButton>
}

const StyledButton = styled.button`
  height: 35px;
  width: 85px;
  
  font-family: 'Pixel Digivolve', sans-serif;
  font-weight: bold;
  font-size: 0.9em;
  text-align: center;
  margin: 0;
  letter-spacing: 2px;
  color: #e1e1e0;
  padding: 0 0 0 5px;
  
  border-bottom: 1px solid #131313;
  border-right: 1px solid #131313;

  cursor: pointer;
  border-radius: 0;
  background: black;
  box-shadow: 3px 6px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.9);
    color: #0c0c0c;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 1px 2px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;
