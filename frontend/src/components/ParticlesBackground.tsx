import type { ISourceOptions } from "tsparticles-engine";
import {Engine} from "tsparticles-engine";
import {loadSlim} from "tsparticles-slim";
import Particles from "react-particles";
import {useCallback} from "react";

export default function ParticlesBackground({options}: {readonly options: ISourceOptions}) {

    const particlesInit = useCallback(async (engine: Engine) => await loadSlim(engine), []);

    return (
        <Particles id="tsparticles" init={particlesInit} options={options}/>
    );
}
