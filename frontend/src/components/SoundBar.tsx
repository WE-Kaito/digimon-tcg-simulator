import {
    VolumeOffRounded as UnmuteSfxIcon,
    VolumeUpRounded as MuteSfxIcon,
    RadioRounded as RadioIcon,
    PlayArrowRounded as PlayIcon,
    StopRounded as StopIcon,
    SkipNextRounded as NextIcon,
    SkipPreviousRounded as PrevIcon,
    QueueMusicRounded as PlaylistIcon,
} from "@mui/icons-material";
import Slider from "@mui/material/Slider";
import styled from "@emotion/styled";
import { useSound, projectDrasilPlaylist, sadgatomonPlaylist } from "../hooks/useSound.ts";
import Lottie from "lottie-react";
import radioAnimation from "../assets/lotties/radio-animation.json";
import { PropsWithChildren, useState } from "react";
import { Menu, MenuItem } from "@mui/material";

type Props = PropsWithChildren<{ iconFontSize?: number; opened?: true }>;

export default function SoundBar({ children, iconFontSize, opened }: Props) {
    const sfxEnabled = useSound((state) => state.sfxEnabled);
    const musicVolume = useSound((state) => state.musicVolume);
    const currentSong = useSound((state) => state.currentSong);
    const isMusicPlaying = useSound((state) => state.isMusicPlaying);
    const isRadioMenuExpanded = useSound((state) => (opened === undefined ? state.isRadioMenuExpanded : true));
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

    const isCurrentPlaylist = (playlist: string[]) => Boolean(playlist.find((song) => song === currentPlaylist[0]));

    return (
        <>
            <StyledMenu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem
                    onClick={() => handleSetPlaylist(projectDrasilPlaylist)}
                    selected={isCurrentPlaylist(projectDrasilPlaylist)}
                >
                    Project Drasil BGM
                </MenuItem>
                <MenuItem
                    onClick={() => handleSetPlaylist(sadgatomonPlaylist)}
                    selected={isCurrentPlaylist(sadgatomonPlaylist)}
                >
                    @SadGatomon <SubtitleSpan>Lo-Fi Covers</SubtitleSpan>
                </MenuItem>
            </StyledMenu>
            <StyledGrid iconFontSize={iconFontSize}>
                <SetSfxIconButton
                    onClick={() => toggleSfxEnabled()}
                    sfxEnabled={sfxEnabled}
                    title={"Mute / Unmute SFX"}
                >
                    {sfxEnabled ? <MuteSfxIcon fontSize={"large"} /> : <UnmuteSfxIcon fontSize={"large"} />}
                </SetSfxIconButton>
                <SfxSpan sfxEnabled={sfxEnabled} iconFontSize={iconFontSize}>
                    SFX
                </SfxSpan>

                <RadioIconButtonPlaylist
                    className={"button"}
                    isRadioMenuExpanded={isRadioMenuExpanded}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    <PlaylistIcon fontSize={"large"} />
                </RadioIconButtonPlaylist>

                <RadioIconButtonPrev className={"button"} isRadioMenuExpanded={isRadioMenuExpanded} onClick={prevSong}>
                    <PrevIcon fontSize={"large"} />
                </RadioIconButtonPrev>

                <MainRadioIconButton
                    className={"button"}
                    isRadioMenuExpanded={isRadioMenuExpanded}
                    onClick={toggleRadioMenu}
                    translateX={iconFontSize ? iconFontSize * 2.8 : undefined}
                >
                    <RadioIcon titleAccess={currentSong} fontSize={"large"} />
                    {isMusicPlaying && (
                        <Lottie
                            animationData={radioAnimation}
                            style={{
                                position: "absolute",
                                pointerEvents: "none",
                                width: iconFontSize ? iconFontSize * 6.5 : 250,
                                left: iconFontSize ? iconFontSize * -2.475 : -102,
                                top: iconFontSize ? iconFontSize * -0.675 : -28,
                            }}
                        />
                    )}
                </MainRadioIconButton>

                <RadioIconButtonStart
                    className={"button"}
                    isRadioMenuExpanded={isRadioMenuExpanded}
                    onClick={isMusicPlaying ? stopMusic : startMusic}
                >
                    {isMusicPlaying ? <StopIcon fontSize={"large"} /> : <PlayIcon fontSize={"large"} />}
                </RadioIconButtonStart>
                <RadioIconButtonNext
                    className={"button"}
                    isRadioMenuExpanded={isRadioMenuExpanded}
                    onClick={() => nextSong()}
                >
                    <NextIcon fontSize={"large"} />
                </RadioIconButtonNext>

                {children !== undefined && !isRadioMenuExpanded && (
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 2,
                            display: "flex",
                            gap: iconFontSize ? iconFontSize * 0.4 : 8,
                            left: iconFontSize ? iconFontSize * 4 : 130,
                            top: iconFontSize ? 0 : 8,
                        }}
                    >
                        {children}
                    </div>
                )}

                <Slider
                    className={"button"}
                    size="small"
                    defaultValue={50}
                    value={musicVolume * 100}
                    onChange={(_, value) => setMusicVolume((value as number) / 100)}
                    sx={{
                        gridArea: "slider",
                        width: "90%",
                        ml: "13px",
                        color: "#6082B6",
                        transition: "all 0.2s ease",
                        opacity: isRadioMenuExpanded ? 1 : 0,
                        pointerEvents: isRadioMenuExpanded ? "unset" : "none",
                    }}
                />
            </StyledGrid>
        </>
    );
}

const StyledGrid = styled.div<{ iconFontSize?: number }>`
    display: grid;
    position: relative;
    //gap: 3px;
    //padding: 5px;
    justify-content: center;
    align-items: center;
    grid-template-columns: repeat(6, ${({ iconFontSize }) => (iconFontSize ? iconFontSize * 1.5 : 45)}px);
    grid-template-rows: ${({ iconFontSize }) => (iconFontSize ? iconFontSize * 1.5 : 45)}px 20px;
    grid-template-areas:
        "sfx-button playlist prev-button radio-icon start-button next-button"
        "sfx-text slider slider slider slider slider";

    .MuiSvgIcon-root {
        font-size: ${({ iconFontSize }) => (iconFontSize ? `${iconFontSize}px` : "2.1875rem")};
    }
`;

const SetSfxIconButton = styled.button<{ sfxEnabled: boolean }>`
    grid-area: sfx-button;
    opacity: 0.7;
    color: ${({ sfxEnabled }) => (sfxEnabled ? "unset" : "rgba(190,39,85,1)")};
    padding: 0;
    border-radius: 5px;
    background: none;
    border: none;
    outline: none;
    transition: all 0.25s ease;

    &:hover {
        opacity: 1;
        filter: drop-shadow(0 0 3px ${({ sfxEnabled }) => (sfxEnabled ? "ghostwhite" : "rgba(190,39,85,1)")};);
    }
`;

const SfxSpan = styled.span<{ sfxEnabled: boolean; iconFontSize?: number }>`
    font-family: Awsumsans, sans-serif;
    font-size: ${({ iconFontSize }) => (iconFontSize ? iconFontSize * 0.375 : 12)}px;
    grid-area: sfx-text;
    align-self: flex-start;
    opacity: 0.45;
    color: ${({ sfxEnabled }) => (sfxEnabled ? "unset" : "rgba(190,39,85,1)")};
`;

const RadioIconButton = styled.div<{ isRadioMenuExpanded?: boolean }>`
    width: 100%;
    opacity: ${(props) => (props.isRadioMenuExpanded ? 0.7 : 0)};
    padding: 0;
    border-radius: 5px;
    transition: all 0.25s ease;
    pointer-events: ${(props) => (props.isRadioMenuExpanded ? "unset" : "none")};

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
    transform: ${(props) => (props.isRadioMenuExpanded ? "unset" : "translateX(-47px)")};
`;

const RadioIconButtonNext = styled(RadioIconButton)`
    grid-area: next-button;
    transform: ${(props) => (props.isRadioMenuExpanded ? "unset" : "translateX(-204px)")};
`;

const RadioIconButtonStart = styled(RadioIconButton)`
    grid-area: start-button;
    transform: ${(props) => (props.isRadioMenuExpanded ? "unset" : "translateX(-151px)")};
`;

const MainRadioIconButton = styled(RadioIconButton)<{ translateX?: number }>`
    grid-area: radio-icon;
    transform: ${(props) => (props.isRadioMenuExpanded ? "unset" : `translateX(-${props.translateX ?? 100}px)`)};
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
        background-color: #2c2c2c;
        color: ghostwhite;
    }

    .Mui-selected {
        background-color: rgba(190, 39, 85, 0.5);
    }
`;
