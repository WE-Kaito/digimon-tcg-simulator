import { PropsWithChildren, CSSProperties, useMemo } from "react";
import styled from "@emotion/styled";
import { blueTriangles } from "../assets/particles.ts";
import Particles from "@tsparticles/react";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { Container } from "@tsparticles/engine";

export default function MenuBackgroundWrapper({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) {
    const particlesInitialized = useGeneralStates((state) => state.particlesInitialized);
    const particlesLoaded = (container?: Container): Promise<void> => {
        return new Promise((resolve) => {
            console.log(container);
            resolve();
        });
    };

    const particles = useMemo(
        () => <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={blueTriangles} />,
        []
    );

    return (
        <StyledDiv style={style}>
            {children}
            {particlesInitialized && particles}
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
    background: transparent; // !! define bg in particles
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
