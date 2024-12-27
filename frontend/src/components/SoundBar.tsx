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
import {Item, useContextMenu} from "react-contexify";
import {StyledMenu} from "../pages/Game.tsx";
import {useLocation} from "react-router-dom";

export default function SoundBar() {
    const {pathname} = useLocation();
    const sfxEnabled = useSound((state) => state.sfxEnabled);
    const musicVolume = useSound((state) => state.musicVolume);
    const currentSong = useSound((state) => state.currentSong);
    const isMusicPlaying = useSound((state) => state.isMusicPlaying);
    const showRadioMenu = useSound((state) => state.showRadioMenu);
    const toggleRadioMenu = useSound((state) => state.toggleRadioMenu);
    const toggleSfxEnabled = useSound((state) => state.toggleSfxEnabled);
    const setMusicVolume = useSound((state) => state.setMusicVolume);
    const startMusic = useSound((state) => state.startMusic);
    const stopMusic = useSound((state) => state.stopMusic);
    const nextSong = useSound((state) => state.nextSong);
    const prevSong = useSound((state) => state.prevSong);
    const setPlaylist = useSound((state) => state.setPlaylist);

    function handleSetPlaylist(playlist: string[]) {
        setPlaylist(playlist);
        if (!isMusicPlaying) startMusic();
        nextSong();
    }

    const {show: showPlaylistMenu} = useContextMenu({id: "playlistMenu"});

    if (window.innerWidth < 800) return <></>

    const inGame = pathname.includes("game");
    const lottieTranslation = !showRadioMenu ? inGame ? "translate(-100px, -3px)" : "translateX(-100px)" : inGame ? "translateY(-3px)" : "unset";

    return (
        <div style={{position: "absolute", left: 0, top: 0, gridArea: "info" }}>
            <StyledGrid>

                <StyledMenu id={"playlistMenu"} theme="dark">
                    <Item onClick={() => handleSetPlaylist(projectDrasilPlaylist)}>Project Drasil BGM</Item>
                    <Item onClick={() => handleSetPlaylist(sadgatomonPlaylist)}>
                        @SadGatomon <SubtitleSpan>Lo-Fi Covers</SubtitleSpan>
                    </Item>
                </StyledMenu>

                <SetSfxIconButton onClick={() => toggleSfxEnabled()} sfxEnabled={sfxEnabled}
                                  title={"Mute / Unmute SFX"}>
                    {sfxEnabled
                        ? <MuteSfxIcon fontSize={"large"}/>
                        : <UnmuteSfxIcon fontSize={"large"}/>}
                </SetSfxIconButton>
                <SfxSpan sfxEnabled={sfxEnabled}>SFX</SfxSpan>

                <RadioIconButtonPlaylist showRadioMenu={showRadioMenu} onClick={(e) => showPlaylistMenu({event: e})}>
                    <PlaylistIcon fontSize={"large"}/>
                </RadioIconButtonPlaylist>

                <RadioIconButtonPrev showRadioMenu={showRadioMenu} onClick={prevSong}>
                    <PrevIcon fontSize={"large"}/>
                </RadioIconButtonPrev>

                <MainRadioIconButton showRadioMenu={showRadioMenu} onClick={toggleRadioMenu}>
                    <RadioIcon titleAccess={currentSong} fontSize={"large"}/>
                </MainRadioIconButton>
                {isMusicPlaying &&
                    <StyledLottie animationData={radioAnimation} style={{ transform: lottieTranslation}}/>
                }

                <RadioIconButtonStart showRadioMenu={showRadioMenu} onClick={isMusicPlaying ? stopMusic : startMusic}>
                    {isMusicPlaying
                        ? <StopIcon fontSize={"large"}/>
                        : <PlayIcon fontSize={"large"}/>}
                </RadioIconButtonStart>
                <RadioIconButtonNext showRadioMenu={showRadioMenu} onClick={() => nextSong()}>
                    <NextIcon fontSize={"large"}/>
                </RadioIconButtonNext>

                <Slider
                    size="small"
                    defaultValue={50}
                    value={musicVolume * 100}
                    onChange={(_, value) => setMusicVolume(value as number/ 100)}
                    sx={{ gridArea: "slider", width: "90%", ml: "13px", color: "#6082B6", transition: "all 0.2s ease",
                          opacity: showRadioMenu ? 1 : 0, pointerEvents: showRadioMenu ? "unset" : "none" }}
                />
            </StyledGrid>
        </div>
    );
}

const StyledGrid = styled.div`
  display: grid;
  gap: 3px;
  position: relative;
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

const RadioIconButton = styled.div<{showRadioMenu: boolean}>`
  width: 100%;
  opacity: ${props => props.showRadioMenu ? 0.7 : 0};
  padding: 0;
  border-radius: 5px;
  transition: all 0.25s ease;
  cursor: pointer;
  pointer-events: ${props => props.showRadioMenu ? "unset" : "none"};

  &:hover {
    opacity: 1;
    filter: drop-shadow(0 0 3px "ghostwhite");
  }
`;

const RadioIconButtonPlaylist = styled(RadioIconButton)`
    grid-area: playlist;
`;

const RadioIconButtonPrev = styled(RadioIconButton)`
    grid-area: prev-button;
    transform: ${props => props.showRadioMenu ? "unset" : "translateX(-47px)"};
`;

const RadioIconButtonNext = styled(RadioIconButton)`
    grid-area: next-button;
    transform: ${props => props.showRadioMenu ? "unset" : "translateX(-204px)"};
`;

const RadioIconButtonStart = styled(RadioIconButton)`
    grid-area: start-button;
    transform: ${props => props.showRadioMenu ? "unset" : "translateX(-151px)"};
`;

const MainRadioIconButton = styled(RadioIconButton)`
    grid-area: radio-icon;
    transform: ${props => props.showRadioMenu ? "unset" : "translateX(-100px)"}; 
    padding-bottom: 1px;
    transition: all 0.25s ease;
    opacity: 0.7;
    pointer-events: unset;
`;

const StyledLottie = styled(Lottie)`
  position: absolute;
  width: 250px;
  left: 65px;
  top: -21px;
  z-index: -1;
  opacity: 0.5;
  transition: all 0.25s ease;
`;

const SubtitleSpan = styled.span`
  font-size: 0.9em;
  font-weight: 600;
  transform: translateX(4px);
`;
