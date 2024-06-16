import Particles from "@tsparticles/react";
import {ISourceOptions} from "@tsparticles/engine";
import {useStore} from "../hooks/useStore.ts";

export default function ParticlesBackground({options}: {readonly options: ISourceOptions}) {

    const [particlesInit, particlesLoaded] = useStore((state) => [state.particlesInit, state.particlesLoaded]);

    if (!particlesInit) return <></>

    return (
        <div style={{ zIndex: -1 }}>
            <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options}/>
        </div>
    );
}
