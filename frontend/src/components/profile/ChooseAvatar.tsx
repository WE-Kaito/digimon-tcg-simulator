import { useEffect } from "react";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import styled from "@emotion/styled";
import { avatars, profilePicture } from "../../utils/avatars.ts";
import { useSound } from "../../hooks/useSound.ts";
import { Tooltip } from "@mui/material";

export default function ChooseAvatar() {
    const getAvatar = useGeneralStates((state) => state.getAvatar);
    const avatarName = useGeneralStates((state) => state.avatarName);
    const setAvatar = useGeneralStates((state) => state.setAvatar);

    const playButtonClickSfx = useSound((state) => state.playButtonClickSfx);

    useEffect(() => {
        getAvatar();
    }, [getAvatar, avatarName]);

    return (
        <GridContainer>
            {avatars.map((avatar) => (
                <Tooltip
                    followCursor
                    title={`✒️ ${avatar.artist}`}
                    key={avatar.name}
                    PopperProps={{
                        modifiers: [{ name: "offset", options: { offset: [-3, 8] } }],
                    }}
                    slotProps={{
                        tooltip: { sx: { background: "transparent", color: "dodgerblue", opacity: 0.5 } },
                    }}
                >
                    <SpriteButton
                        alt={avatar.name}
                        src={profilePicture(avatar.name)}
                        chosen={avatarName === avatar.name}
                        onClick={() => {
                            playButtonClickSfx();
                            setAvatar(avatar.name);
                        }}
                    />
                </Tooltip>
            ))}
        </GridContainer>
    );
}

const GridContainer = styled.div`
    align-self: center;
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    position: relative;
    padding: 5px;
    transition: all 0.2s ease-in-out;
`;

const SpriteButton = styled.img<{ chosen: boolean }>`
    width: 48px;
    opacity: ${({ chosen }) => (chosen ? "1" : "0.5")};
    background: ${({ chosen }) => (chosen ? "rgba(220 ,220 ,220, 0.2)" : "none")};
    outline: ${({ chosen }) => (chosen ? "2px solid dodgerblue" : "none")};
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    :hover {
        opacity: 1;
        z-index: 100;
        filter: drop-shadow(0 0 3px #57a0ff);
    }

    @media (max-width: 1050px) {
        width: 32px;
    }
`;
