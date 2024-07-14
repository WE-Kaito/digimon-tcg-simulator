import styled from "@emotion/styled";

export default function PatchnotesAndDisclaimer() {
    return (
        <Wrapper >
            <Patchnotes href={"https://github.com/WE-Kaito/digimon-tcg-simulator/wiki/Patchnotes"}
                        target="_blank" rel="noopener noreferrer">
                last patch: 15.7.2024
            </Patchnotes>
            <br/>
            <Disclaimer>
                This is a non-commercial fan-made project and is not affiliated with Bandai Co., Ltd. The
                purpose of this project is to celebrate and advertise the Digimon Card Game.
            </Disclaimer>
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

const Disclaimer = styled.span`
  text-wrap: normal;
  color: #5f69e0;
  opacity: 0.35;
  @media (max-width: 1150px) {
    visibility: hidden;
    position: absolute;
  }
`;
