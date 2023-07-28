import styled from "@emotion/styled";
import backIcon from "../assets/turn-back.png";
import {useNavigate} from "react-router-dom";

export default function BackButton() {
    const navigate = useNavigate();
    return <StyledButton onClick={ () => navigate("/")}><img src={backIcon} alt="back" width={37}/></StyledButton>
}

const StyledButton = styled.button`
  height: 40px;
  width: 70px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.25));

  &:hover {
    background: rgba(192, 192, 192, 0.85);
    filter: drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.25));
  }
`;