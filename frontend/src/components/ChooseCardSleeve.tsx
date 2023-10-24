import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import styled from "@emotion/styled";
import {sleeves, getSleeve} from "../utils/sleeves.ts";
import {playButtonClickSfx} from "../utils/sound.ts";
import Pen from "../assets/profile_pictures/pen.tsx";

export default function ChooseCardSleeve() {

    const getActiveSleeve = useStore((state) => state.getActiveSleeve);
    const sleeveName = useStore((state) => state.sleeveName);
    const setSleeve = useStore((state) => state.setSleeve);

    useEffect(() => {
        getActiveSleeve();
    }, [getActiveSleeve, sleeveName]);

    return (
        <GridContainer>
            <AvatarSpan>Sleeve</AvatarSpan>
            <AvatarSpan2><Pen scale={0.285}/> Drak</AvatarSpan2>
            {sleeves.map((sleeve) => {
                return <SleeveButton  key={sleeve.name} alt={sleeve.name} src={getSleeve(sleeve.name)}
                                      chosen={sleeveName === sleeve.name}
                                      onClick={() => {
                                          playButtonClickSfx();
                                          setSleeve(sleeve.name);
                                      }}
                />
            })}
        </GridContainer>
    );
}

const GridContainer = styled.div`
  width: fit-content;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(11, 63px);
  grid-template-rows: repeat(3, 84px);
  gap: 2px;
  position: relative;
  padding: 3px;
  margin: 2px 2px 7px 2px;
  border: 1px solid #1d7dfc;
  border-radius: 5px;
  margin-left: 10px;
  transform: translateY(-2px);
`;

const SleeveButton = styled.img<{chosen: boolean}>`
  width: 63px;
  height: 84px;
  opacity: ${({chosen}) => chosen ? "1" : "0.4"};
  background: ${({chosen}) => chosen ? "ghostwhite" : "none"};
  cursor: pointer;
  border-radius: 2px;

  :hover {
    width: 72px;
    height: 96px;
    opacity: 1;
    z-index: 100;
    filter: drop-shadow(0 0 5px #57a0ff);
    transform: translate(-4px, -6px);
  }

  @media (max-width: 766px) {
    width: 32px;
  }
`;

const AvatarSpan = styled.span`
  position: absolute;
  top: -25px;
  left: 2px;
  color: #1d7dfc;
  font-size: 22px;
  font-family: Naston, sans-serif;
  @media (max-width: 766px) {
    font-size: 17px;
    top: -22px  
  }
`;

const AvatarSpan2 = styled(AvatarSpan)`
  left: 670px;
  top: -21px;
  font-size: 16px;
  @media (max-width: 766px) {
  transform: scale(0.75);
    top: -22px;
    left: 108px;
}
`;
