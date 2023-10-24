import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import styled from "@emotion/styled";
import {avatars, profilePicture} from "../utils/avatars.ts";
import {playButtonClickSfx} from "../utils/sound.ts";

export default function ChooseAvatar() {

    const getAvatar = useStore((state) => state.getAvatar);
    const avatarName = useStore((state) => state.avatarName);
    const setAvatar = useStore((state) => state.setAvatar);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);

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

    return (
        <Container>
            <StyledButton style={{padding: "0px 8px 6px 0px"}} onClick={() => {
                playButtonClickSfx();
                setNextAvatar(avatarName, true);
            }
            }>{`❮`}</StyledButton>
            <img alt="avatar" src={profilePicture(avatarName)}></img>
            <StyledButton style={{padding: "0px 0px 6px 8px"}} onClick={() => {
                playButtonClickSfx();
                setNextAvatar(avatarName);
            }
            }>{`❯`}</StyledButton>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100vw;

  @media (max-width: 766px) {
    transform: scale(0.8)
  }
`;

const StyledButton = styled.button`
  margin: 20px;
  font-size: 50px;
  height: 100px;
  color: ghostwhite;
  background: none;
  border: 1px solid ghostwhite;
  width: 100px;
  border-radius: 50%;
  transition: border 0.2s ease, filter 0.1s ease;

  :focus {
    outline: none;
  }

  :hover {
    cursor: pointer;
    border: 4px solid ghostwhite;
  }

  :active {
    border-width: 3px;
    filter: drop-shadow(0px 0px 2px ghostwhite);
  }

  @media (max-width: 766px) {
    border: none;
    padding: 0;
    margin: 0;
  }
`;
