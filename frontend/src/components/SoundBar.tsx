import {VolumeOffRounded as UnmuteSfxIcon, VolumeUpRounded as MuteSfxIcon} from "@mui/icons-material";
import styled from "@emotion/styled";
import {useSound} from "../hooks/useSound.ts";
import {Stack} from "@mui/material";

export default function SoundBar() {

    const sfxEnabled = useSound((state) => state.sfxEnabled);
    const toggleSfxEnabled = useSound((state) => state.toggleSfxEnabled);

    return (
        <Stack direction={"row"} sx={{ position:"absolute", left:0, top: 0}}>
            <SetSfxIconButton onClick={() => toggleSfxEnabled()} sfxEnabled={sfxEnabled}
                              title={"Mute / Unmute SFX"}>
                {sfxEnabled
                    ? <MuteSfxIcon fontSize={"large"}/>
                    : <UnmuteSfxIcon fontSize={"large"}/>}
            </SetSfxIconButton>
        </Stack>
    );
}

const SetSfxIconButton = styled.button<{ sfxEnabled: boolean}>`
  opacity: 0.8;
  color: ${({sfxEnabled}) => sfxEnabled ? "unset" : "rgba(190,39,85,1)"};
  padding: 0;
  border-radius: 5px;
  background: none;
  border: none;
  outline: none;
  transition: all 0.25s ease;
  
  &:hover {
    opacity: 1;
    filter: drop-shadow(0 0 3px ${({sfxEnabled}) => sfxEnabled ? "ghostwhite" : "rgba(190,39,85,1)"};);
  }
`;
