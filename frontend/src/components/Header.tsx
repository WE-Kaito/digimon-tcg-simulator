import styled from "@emotion/styled";
import {useLocation} from "react-router-dom";


export default function Header() {

    const location = useLocation().pathname;

    return (
        <Headline>
            Project {location === "/login" && <br/>}
            <Headline2 style={{fontSize: "60px"}}>Drasil</Headline2>
        </Headline>
    )
}

const Headline = styled.h1`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  margin: 0;
  font-size: 60px;
  text-shadow: 2px 4px 1px #03060a;
  letter-spacing: 2px;
  color: #ff880d;
  -webkit-text-stroke: 2px navy;
  @media (max-width: 766px) {
    font-size: 45px;
    margin-left: 12px;
  }
`;

export const Headline2 = styled.span`
  font-family: 'Pixel Digivolve', sans-serif;
  font-style: italic;
  font-weight: bold;
  font-size: 54px;
  margin: 0;
  text-shadow: 1.5px 3px 1px #060e18;
  color: #1d7dfc;
  -webkit-text-stroke: 2px navy;
  position: relative;

  @media (max-width: 766px) {
    font-size: 35px;
    margin-left: 12px;
  }
`;
