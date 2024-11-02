import styled from "@emotion/styled";
import {lighten} from "@mui/material";

type ButtonProps = { text: string, onClick: () => void, onHover?: () => void, color: string };

type Props = { text: string, buttonProps: ButtonProps[] };

export default function ModalDialog( { text, buttonProps } : Props ) {
    return (
        <Container>
            <StyledSpan>{text}</StyledSpan>
            <ButtonContainer>
                {buttonProps.map((buttonProp) => (
                    <StyledButton key={buttonProp.text}
                                  bgColor={buttonProp.color}
                                  onClick={buttonProp.onClick}
                                  onMouseOver={buttonProp.onHover}
                    >
                        {buttonProp.text}
                    </StyledButton>
                ))}
            </ButtonContainer>
        </Container>
    );
}

const StyledSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  text-shadow: black 2px 4px 2px;
`;

const Container = styled.div`
  z-index: 10000;
  position: absolute;
  width: fit-content;
  max-width: 1000px;
  height: fit-content;
  padding: 5vh 3.5vw 5vh 3.5vw;
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

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
  justify-content: space-evenly;
  flex-wrap: wrap;
`;

const StyledButton = styled.button<{ bgColor: string }>`
  cursor: pointer;
  width: fit-content;
  height: 2.5em;
  flex-shrink: 0;
  border-radius: 0;
  background: ${({bgColor}) => bgColor};
  font-family: Pixel Digivolve, sans-serif;
  font-size: 20px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: ${({bgColor}) => lighten(bgColor, 0.1)};
    transform: translateY(1px);
    filter: contrast(1.15) saturate(1.25);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({bgColor}) => lighten(bgColor, 0.1)};
    transform: translateY(2px);
    filter: contrast(1.3) saturate(1.25);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;
