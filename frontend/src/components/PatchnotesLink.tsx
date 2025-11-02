import styled from "@emotion/styled";

export default function PatchnotesLink() {
    return (
        <Wrapper>
            <Patchnotes
                href={"https://github.com/WE-Kaito/digimon-tcg-simulator/wiki/Patchnotes#02112025"}
                target="_blank"
                rel="noopener noreferrer"
            >
                🔗 Patch notes (02.11.2025)
            </Patchnotes>
        </Wrapper>
    );
}

const Wrapper = styled.sub`
    width: 100vw;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-family: Cousine, monospace;
`;

const Patchnotes = styled.a`
    color: #38d4f0;
    text-decoration: none;

    &:hover {
        color: #daa600 !important;
    }

    &:visited {
        color: #386ff0;
    }

    @media (max-width: 550px) {
        font-size: 0.8em;
    }
`;
