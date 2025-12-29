import styled from "@emotion/styled";

export default function PatchnotesLink() {
    return (
        <Wrapper>
            <a
                href={"https://github.com/WE-Kaito/digimon-tcg-simulator/wiki/Patchnotes#04112025"}
                target="_blank"
                rel="noopener noreferrer"
            >
                Patch notes (04.11.2025)
            </a>
        </Wrapper>
    );
}

const Wrapper = styled.sub`
    width: 100vw;
    position: absolute;
    bottom: -2px;
    left: 114px;
    transform: translateX(-50%);
    font-family: Cousine, monospace;
`;
