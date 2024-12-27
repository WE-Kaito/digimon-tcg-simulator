import {
    VolumeOffRounded as UnmuteSfxIcon,
    VolumeUpRounded as MuteSfxIcon,
    RadioRounded as RadioIcon,
    PlayArrowRounded as PlayIcon,
    StopRounded as StopIcon,
    SkipNextRounded as NextIcon,
    SkipPreviousRounded as PrevIcon,
    QueueMusicRounded as PlaylistIcon
} from "@mui/icons-material";
import Slider from '@mui/material/Slider';
import styled from "@emotion/styled";
import {useSound, projectDrasilPlaylist, sadgatomonPlaylist} from "../hooks/useSound.ts";
import Lottie from "lottie-react";
import radioAnimation from "../assets/lotties/radio-animation.json";
import {PropsWithChildren, useState} from "react";
import {Menu, MenuItem} from "@mui/material";

export default function SoundBar({children}: PropsWithChildren) {
    const sfxEnabled = useSound((state) => state.sfxEnabled);
    const musicVolume = useSound((state) => state.musicVolume);
    const currentSong = useSound((state) => state.currentSong);
    const isMusicPlaying = useSound((state) => state.isMusicPlaying);
    const isRadioMenuExpanded = useSound((state) => state.isRadioMenuExpanded);
    const toggleRadioMenu = useSound((state) => state.toggleRadioMenu);
    const toggleSfxEnabled = useSound((state) => state.toggleSfxEnabled);
    const setMusicVolume = useSound((state) => state.setMusicVolume);
    const startMusic = useSound((state) => state.startMusic);
    const stopMusic = useSound((state) => state.stopMusic);
    const nextSong = useSound((state) => state.nextSong);
    const prevSong = useSound((state) => state.prevSong);
    const currentPlaylist = useSound((state) => state.playlist);
    const setPlaylist = useSound((state) => state.setPlaylist);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    function handleSetPlaylist(playlist: string[]) {
        setPlaylist(playlist);
        if (!isMusicPlaying) startMusic();
        nextSong();
    }

    const isCurrentPlaylist = (playlist: string[]) => Boolean(playlist.find(song => song === currentPlaylist[0]));

    return (
        <>
            <StyledMenu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => handleSetPlaylist(projectDrasilPlaylist)} selected={isCurrentPlaylist(projectDrasilPlaylist)}>
                    Project Drasil BGM
                </MenuItem>
                <MenuItem onClick={() => handleSetPlaylist(sadgatomonPlaylist)} selected={isCurrentPlaylist(sadgatomonPlaylist)}>
                    @SadGatomon <SubtitleSpan>Lo-Fi Covers</SubtitleSpan>
                </MenuItem>
            </StyledMenu>
            <StyledGrid>
                <SetSfxIconButton onClick={() => toggleSfxEnabled()} sfxEnabled={sfxEnabled}
                                  title={"Mute / Unmute SFX"}>
                    {sfxEnabled
                        ? <MuteSfxIcon fontSize={"large"}/>
                        : <UnmuteSfxIcon fontSize={"large"}/>}
                </SetSfxIconButton>
                <SfxSpan sfxEnabled={sfxEnabled}>SFX</SfxSpan>

                <RadioIconButtonPlaylist isRadioMenuExpanded={isRadioMenuExpanded} onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <PlaylistIcon fontSize={"large"}/>
                </RadioIconButtonPlaylist>

                <RadioIconButtonPrev isRadioMenuExpanded={isRadioMenuExpanded} onClick={prevSong}>
                    <PrevIcon fontSize={"large"}/>
                </RadioIconButtonPrev>

                <MainRadioIconButton isRadioMenuExpanded={isRadioMenuExpanded} onClick={toggleRadioMenu}>
                    <RadioIcon titleAccess={currentSong} fontSize={"large"}/>
                    {isMusicPlaying && <Lottie animationData={radioAnimation}
                                               style={{ width: 250, position: "absolute", left: -100, top: -28, pointerEvents: "none"}} />}
                </MainRadioIconButton>

                <RadioIconButtonStart isRadioMenuExpanded={isRadioMenuExpanded} onClick={isMusicPlaying ? stopMusic : startMusic}>
                    {isMusicPlaying
                        ? <StopIcon fontSize={"large"}/>
                        : <PlayIcon fontSize={"large"}/>}
                </RadioIconButtonStart>
                <RadioIconButtonNext isRadioMenuExpanded={isRadioMenuExpanded} onClick={() => nextSong()}>
                    <NextIcon fontSize={"large"}/>
                </RadioIconButtonNext>

                {children !== undefined && !isRadioMenuExpanded &&
                    <div style={{ position: "absolute", left: 130, top: 8, zIndex: 100 }}>
                        {children}
                    </div>
                }

                <Slider
                    size="small"
                    defaultValue={50}
                    value={musicVolume * 100}
                    onChange={(_, value) => setMusicVolume(value as number/ 100)}
                    sx={{ gridArea: "slider", width: "90%", ml: "13px", color: "#6082B6", transition: "all 0.2s ease",
                          opacity: isRadioMenuExpanded ? 1 : 0, pointerEvents: isRadioMenuExpanded ? "unset" : "none" }}
                />
            </StyledGrid>
        </>
    );
}

const StyledGrid = styled.div`
  display: grid;
  position: relative; 
  gap: 3px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(6, 50px);
  grid-template-rows: 45px 20px;
  grid-template-areas: "sfx-button playlist prev-button radio-icon start-button next-button"
                         "sfx-text slider slider slider slider slider";
`;

const SetSfxIconButton = styled.button<{ sfxEnabled: boolean }>`
  grid-area: sfx-button;
  opacity: 0.7;
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

const SfxSpan = styled.span<{ sfxEnabled: boolean }>`
  font-family: Awsumsans, sans-serif;
  font-size: 12px;
  grid-area: sfx-text;
  align-self: flex-start;
  opacity: 0.45;
  color: ${({sfxEnabled}) => sfxEnabled ? "unset" : "rgba(190,39,85,1)"};
`;

const RadioIconButton = styled.div<{isRadioMenuExpanded?: boolean}>`
  width: 100%;
  opacity: ${props => props.isRadioMenuExpanded ? 0.7 : 0};
  padding: 0;
  border-radius: 5px;
  transition: all 0.25s ease;
  cursor: pointer;
  pointer-events: ${props => props.isRadioMenuExpanded ? "unset" : "none"};

  &:hover {
    opacity: 1;
    filter: drop-shadow(0 0 3px "ghostwhite");
  }
`;

export const RadioMenuChildIconButton = styled(RadioIconButton)`
 opacity: 0.7;
 pointer-events: unset;
`;

const RadioIconButtonPlaylist = styled(RadioIconButton)`
  grid-area: playlist;
`;

const RadioIconButtonPrev = styled(RadioIconButton)`
  grid-area: prev-button;
  transform: ${props => props.isRadioMenuExpanded ? "unset" : "translateX(-47px)"};
`;

const RadioIconButtonNext = styled(RadioIconButton)`
  grid-area: next-button;
  transform: ${props => props.isRadioMenuExpanded ? "unset" : "translateX(-204px)"};
`;

const RadioIconButtonStart = styled(RadioIconButton)`
  grid-area: start-button;
  transform: ${props => props.isRadioMenuExpanded ? "unset" : "translateX(-151px)"};
`;

const MainRadioIconButton = styled(RadioIconButton)`
  grid-area: radio-icon;
  transform: ${props => props.isRadioMenuExpanded ? "unset" : "translateX(-100px)"}; 
  padding-bottom: 1px;
  transition: all 0.25s ease;
  opacity: 0.7;
  pointer-events: unset;
  position: relative;
`;

const SubtitleSpan = styled.span`
  font-size: 0.9em;
  font-weight: 600;
  transform: translateX(4px);
`;

const StyledMenu = styled(Menu)`
  .MuiMenu-paper {
    background-color: #2C2C2C;
    color: ghostwhite;
  }
  
  .Mui-selected {
    background-color: rgba(190,39,85,0.5);
  }
`;
