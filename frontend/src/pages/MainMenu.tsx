import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";
import Header from "../components/Header.tsx";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "../components/ParticlesBackground.tsx";
import PatchnotesAndDisclaimer from "../components/PatchnotesAndDisclaimer.tsx";

export default function MainMenu() {

    return (
        <Wrapper>
            <ParticlesBackground options={blueTriangles}/>
            <Container>
                <Header/>
                <MenuButton name={"Find game"} path={"/lobby"}/>
                <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
                <MenuButton name={"Profile"} path={"/profile"}/>
                <MenuButton name={"LOGOUT"} path={"/login"}/>
            </Container>
            <PatchnotesAndDisclaimer/>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  transform: translateY(0px);
  position: relative;
`;

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  font-size: 19px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
