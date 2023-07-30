import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";


export default function MainMenu() {

    return (
        <Wrapper>
            <div>
            <Headline>DIGIMON</Headline>
                <Headline2>TCG Simulator</Headline2>
            </div>
            <MenuButton name={"Find game"} path={"/"}/>
            <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
            <MenuButton name={"Profile"} path={"/profile"}/>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  font-size: 19px;
  transform: translateY(-7.5vh);
`;

const Headline = styled.h1`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 4px 1px #03060a;
  letter-spacing: 2px;
  color: #ff880d;
  -webkit-text-stroke: 2px navy;
  @media (max-width: 766px) {
    font-size: 45px;
  }
`;

export const Headline2 = styled.h2`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  font-size: 54px;
  margin: 0;
  text-shadow: 1.5px 3px 1px #060e18;
  color: #1d7dfc;
  -webkit-text-stroke: 2px #0830b4;

  @media (max-width: 766px) {
    font-size: 35px;
  }
`;