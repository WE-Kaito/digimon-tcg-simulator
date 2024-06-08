import Particles from "@tsparticles/react";
import {Container, ISourceOptions} from "@tsparticles/engine";
import {useStore} from "../hooks/useStore.ts";

export default function ParticlesBackground({options}: {readonly options: ISourceOptions}) {

    const particlesInit = useStore((state) => state.particlesInit);

    const particlesLoaded = async (container?: Container) => container?.init();

    if (!particlesInit) return <></>

    return (
        <div style={{ zIndex: -1 }}>
            <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options}/>
        </div>
    );
}
