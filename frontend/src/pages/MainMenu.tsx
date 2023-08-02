import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";
import Header from "../components/Header.tsx";


export default function MainMenu() {

    return (
        <Wrapper>
            <Header/>
            <MenuButton name={"Find game"} path={"/lobby"}/>
            <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
            <MenuButton name={"Profile"} path={"/profile"}/>
            <MenuButton name={"LOGOUT"} path={"/login"}/>
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
  margin-top: 15.5vh;
`;

