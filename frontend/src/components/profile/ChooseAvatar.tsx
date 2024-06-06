import {useEffect} from "react";
import {useStore} from "../../hooks/useStore.ts";
import styled from "@emotion/styled";
import {avatars, profilePicture} from "../../utils/avatars.ts";
import Pen from "../../assets/profile_pictures/pen.tsx";
import {useSound} from "../../hooks/useSound.ts";

export default function ChooseAvatar() {

    const getAvatar = useStore((state) => state.getAvatar);
    const avatarName = useStore((state) => state.avatarName);
    const setAvatar = useStore((state) => state.setAvatar);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);

    return (
        <GridContainer>
            <AvatarSpan>Avatar</AvatarSpan>
            <AvatarSpan2><Pen scale={0.285}/> Tortoiseshel</AvatarSpan2>
            {avatars.map((avatar) => {
                return <SpriteButton  key={avatar.name} alt={avatar.name} src={profilePicture(avatar.name)}
                                      chosen={avatarName === avatar.name}
                                      onClick={() => {
                                          playButtonClickSfx();
                                          setAvatar(avatar.name);
                                      }}
                />
            })}
        </GridContainer>
    );
}

const GridContainer = styled.div`
  align-self: center;
  width: fit-content;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(23, 48px);
  grid-template-rows: repeat(3, 48px);
  gap: 3px;
  position: relative;
  padding: 5px;
  border: 1px solid #1d7dfc;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;
    @media (max-width: 1050px) {
      grid-template-columns: repeat(10, 32px);
      grid-template-rows: repeat(3, 32px);
      gap: 2px;
      padding: 3px;
    }
`;

const SpriteButton = styled.img<{chosen: boolean}>`
  width: 48px;
  opacity: ${({chosen}) => chosen ? "1" : "0.5"};
  background: ${({chosen}) => chosen ? "ghostwhite" : "none"};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  :hover {
    width: 64px;
    height: 64px;
    opacity: 1;
    z-index: 100;
    filter: drop-shadow(0 0 3px #57a0ff);
    transform: translate(-8px, -8px);
  }
  
  @media (max-width: 1050px) {
    width: 32px;
    :hover {
      width: 32px;
      height: 32px;
      transform: translate(-1px, -1px);
    }
  }
`;

const AvatarSpan = styled.span`
  position: absolute;
  top: -26px;
  left: 2px;
  color: #1d7dfc;
  font-size: 22px;
  font-family: Naston, sans-serif;
  transition: all 0.2s ease-in-out;
  @media (max-width: 1050px) {
    visibility: hidden;
    font-size: 17px;
    top: -22px  
  }
`;

const AvatarSpan2 = styled(AvatarSpan)`
  left: 1070px;
  top: -23px;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
`;
