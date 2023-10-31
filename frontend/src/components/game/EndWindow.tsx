import {useNavigate} from "react-router-dom";
import styled from "@emotion/styled";

export default function EndWindow({message}:{readonly message:string}) {

    const navigate = useNavigate();

    return (
        <Container>
            <StyledSpan>{message}</StyledSpan>
            <BackButton onClick={() => navigate("/lobby")}>EXIT</BackButton>
        </Container>
    );
}

const StyledSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  text-shadow: black 2px 4px 2px;
`;

const Container = styled.div`
  z-index: 1000;
  position: absolute;
  width: fit-content;
  padding: 0 30px 0 30px;
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  gap: 25px;
  background: #0c0c0c;
  transition: all 0.2s ease;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  @media (max-height: 1080px) {
    height: 80px;
  }
`;

const BackButton = styled.button`
  cursor: pointer;
  width: 115px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 0;
  background: #fccb0b;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ffd32e;
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  @media (max-height: 1080px) {
    font-size: 23px;
    height: 38px;
    width: 105px;
  }
`;
