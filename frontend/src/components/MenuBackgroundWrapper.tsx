import {PropsWithChildren, useEffect, useMemo, useState} from "react";
import styled from "@emotion/styled";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "./ParticlesBackground.tsx";
import {useLocation} from "react-router-dom";

export default function MenuBackgroundWrapper({children}: PropsWithChildren) {

    const { pathname } = useLocation() ;

    const [isGamePage, setIsGamePage] = useState(false);

    const options = useMemo(() => (blueTriangles),[]);

    useEffect(() => setIsGamePage(pathname.includes("/game")), [pathname]);

    if (isGamePage) return <>{children}</>;

    return (
        <StyledDiv>
            <ParticlesBackground options={options} />
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
  overflow-x: clip;
  container-type: inline-size;
  container-name: wrapper;
  position: relative;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  .profile {
    padding-top: 20px;
    justify-content: flex-start;
  }
`;
