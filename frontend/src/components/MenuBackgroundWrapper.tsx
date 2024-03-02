import {PropsWithChildren} from "react";
import styled from "@emotion/styled";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "./ParticlesBackground.tsx";

export default function MenuBackgroundWrapper({children, alignedTop}: PropsWithChildren<{ alignedTop?: boolean }>) {

    const conditionalStyle = alignedTop ? { style: { justifyContent: "flex-start", paddingTop: 20 } } : {};

    return (
        <StyledDiv {...conditionalStyle}>
            <ParticlesBackground options={blueTriangles}/>
            {children}
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
  display: flex;
  min-height: 100vh;
  min-width: 100vw;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translate(0px, 0px); // has to be here for the particles to work ???
  overflow-x: clip;
  container-type: inline-size;
  container-name: wrapper;
  position: relative;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
