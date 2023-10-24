import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import styled from "@emotion/styled";
import {avatars, profilePicture} from "../utils/avatars.ts";
import {playButtonClickSfx} from "../utils/sound.ts";
import Pen from "../assets/profile_pictures/pen.tsx";

export default function ChooseAvatar() {

    const getAvatar = useStore((state) => state.getAvatar);
    const avatarName = useStore((state) => state.avatarName);
    const setAvatar = useStore((state) => state.setAvatar);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);


/*  // saving this logic for later (mobile solution)
    function getAvatarIndex(avatarName: string) {
        return avatars.findIndex((avatar) => avatar.name === avatarName) || 0;
    }

    function setNextAvatar(avatarName: string, previous?: boolean) {
        const currentIndex = getAvatarIndex(avatarName);
        if (currentIndex === 0 && previous) setAvatar(avatars[avatars.length - 1].name)
        else {
            const nextIndex = (previous ? (currentIndex - 1) : (currentIndex + 1)) % avatars.length;
            setAvatar(avatars[nextIndex].name);
        }
    }
*/

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
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(6, 48px);
  grid-template-rows: repeat(5, 48px);
  gap: 3px;
  position: relative;
  padding: 5px;
  border: 1px solid #1d7dfc;
  border-radius: 5px;
  margin-left: 10px;
  
    @media (max-width: 766px) {
      grid-template-columns: repeat(6, 32px);
      grid-template-rows: repeat(5, 32px);
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
  left: 205px;
  top: -21px;
  font-size: 16px;
  @media (max-width: 766px) {
  transform: scale(0.75);
    top: -22px;
    left: 108px;
}
`;
