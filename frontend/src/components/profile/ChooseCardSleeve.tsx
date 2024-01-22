import {useEffect} from "react";
import {useStore} from "../../hooks/useStore.ts";
import styled from "@emotion/styled";
import {sleeves, getSleeve} from "../../utils/sleeves.ts";
import {playButtonClickSfx} from "../../utils/sound.ts";
import Pen from "../../assets/profile_pictures/pen.tsx";

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
  grid-template-rows: repeat(4, 84px);
  gap: 2px;
  position: relative;
  padding: 3px;
  margin: 2px 2px 7px 2px;
  border: 1px solid #1d7dfc;
  border-radius: 5px;
  margin-left: 10px;
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;

  scrollbar-width: thin;

  ::-webkit-scrollbar {
    width: 3px;
    background: rgba(139, 200, 255, 0.5);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #1e77ea;
    border-radius: 3px;
  }

  @media (max-width: 1050px) {
    grid-template-columns: repeat(15, 40px);
    grid-template-rows: repeat(3, 53px);
    gap: 1px;
    padding: 2px;
    margin: 10px 2px 0 2px;
    max-width: 97.24vw;
    overflow-y: hidden;
    overflow-x: scroll;
  }
`;

const SleeveButton = styled.img<{chosen: boolean}>`
  width: 63px;
  height: 84px;
  opacity: ${({chosen}) => chosen ? "1" : "0.4"};
  background: ${({chosen}) => chosen ? "ghostwhite" : "none"};
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease-in-out;
  :hover {
    width: 72px;
    height: 96px;
    opacity: 1;
    z-index: 100;
    filter: drop-shadow(0 0 5px #57a0ff);
    transform: translate(-4px, -6px);
  }
  @media (max-width: 1050px) {
    width: 40px;
    height: 53px;
    :hover {
      width: 40px;
      height: 53px;
      opacity: 1;
      transform: translate(-1px, -1px);
    }
  }
`;

const AvatarSpan = styled.span`
  position: absolute;
  top: -25px;
  left: 2px;
  color: #1d7dfc;
  font-size: 22px;
  font-family: Naston, sans-serif;
  transition: all 0.2s ease-in-out;
  @media (max-width: 1050px) {
    visibility: hidden;
  }
`;

const AvatarSpan2 = styled(AvatarSpan)`
  left: 670px;
  top: -21px;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
`;
