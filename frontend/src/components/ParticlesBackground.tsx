import Particles, { initParticlesEngine } from "@tsparticles/react";
import {useCallback} from "react";
import {Engine, ISourceOptions} from "@tsparticles/engine";

export default function ParticlesBackground({options}: {readonly options: ISourceOptions}) {

    const particlesInit = useCallback(async (engine: Engine) => await loadSlim(engine), []);

    return (
        <Particles id="tsparticles" init={particlesInit} options={options}/>
    );
}
