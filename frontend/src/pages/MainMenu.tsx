import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";


export default function MainMenu() {
    return (
        <Wrapper>
            <Headline>MAIN MENU</Headline>
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
`;

const Headline = styled.h1`
  font-family: 'Sansation', sans-serif;
  margin: 0;
  
    @media (max-width: 766px) {
    font-size: 42px;
    }
`;