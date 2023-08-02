import styled from "@emotion/styled";


export default function Header() {
    return (
        <div>
            <Headline>DIGIMON</Headline>
            <Headline2>TCG Simulator</Headline2>
        </div>
    );
}

const Headline = styled.h1`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 4px 1px #03060a;
  letter-spacing: 2px;
  color: #ff880d;
  -webkit-text-stroke: 2px navy;
  @media (max-width: 766px) {
    font-size: 45px;
    margin-left: 12px;
  }
`;

export const Headline2 = styled.h2`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  font-size: 54px;
  margin: 0;
  text-shadow: 1.5px 3px 1px #060e18;
  color: #1d7dfc;
  -webkit-text-stroke: 2px #0830b4;
  position: relative;

  @media (max-width: 766px) {
    font-size: 35px;
    margin-left: 12px;
  }
`;