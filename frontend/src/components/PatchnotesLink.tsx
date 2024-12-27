import styled from "@emotion/styled";

export default function PatchnotesLink() {
    return (
        <Wrapper >
            <Patchnotes href={"https://github.com/WE-Kaito/digimon-tcg-simulator/wiki/Patchnotes"}
                        target="_blank" rel="noopener noreferrer">
                last patch: 24.12.2024
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
  color: whitesmoke;
  text-decoration: none;

  &:hover {
    color: #daa600 !important;
  }
  &:visited {
    color: whitesmoke;
  }
  @media (max-width: 550px) {
    font-size: 0.8em;
  }
`;
