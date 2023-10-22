import {useEffect} from "react";
import {useStore} from "../hooks/useStore.ts";
import styled from "@emotion/styled";
import {profilePicture} from "../utils/functions.ts";
import {playButtonClickSfx} from "../utils/sound.ts";

export default function ChooseAvatar() {

    const getAvatar = useStore((state) => state.getAvatar);
    const avatarName = useStore((state) => state.avatarName);
    const setAvatar = useStore((state) => state.setAvatar);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);

    const avatarNames: string[] = [
        "ava1", "ava2", "ava3", "ava4", "ava5", "ava6", "ava7", "ava8", "ava9", "ava10",
        "ava11", "ava12", "ava13", "ava14", "ava15", "ava16", "ava17", "ava18", "ava19", "ava20",
        "ava21", "ava22", "ava23", "ava24", "ava25", "ava26", "ava27", "ava28", "ava29", "ava30",
    ];

    function getAvatarIndex(avatarName: string) {
        return avatarNames.indexOf(avatarName);
    }

    function setNextAvatar(avatarName: string) {
        const currentIndex = getAvatarIndex(avatarName);
        const nextIndex = (currentIndex + 1) % avatarNames.length;
        setAvatar(avatarNames[nextIndex]);
    }

    function setPreviousAvatar(avatarName: string) {
        const currentIndex = getAvatarIndex(avatarName);
        const previousIndex = (currentIndex - 1 + avatarNames.length) % avatarNames.length;
        setAvatar(avatarNames[previousIndex]);
    }

    return (
        <Container>
            <StyledButton style={{padding: "0px 8px 6px 0px"}} onClick={() => {
                playButtonClickSfx();
                setPreviousAvatar(avatarName);
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
