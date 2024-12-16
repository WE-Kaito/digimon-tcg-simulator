import drawCardSfx from "../assets/sounds/draw-card.mp3";
import buttonClickSfx from "../assets/sounds/button-click.mp3";
import revealCardSfx from "../assets/sounds/reveal-card.mp3";
import cardToHandSfx from "../assets/sounds/card-to-hand.mp3";
import placeCardSfx from "../assets/sounds/place-card.mp3";
import trashCardSfx from "../assets/sounds/trash-card.mp3";
import attackSfx from "../assets/sounds/attack.mp3";
import coinFlipSfx from "../assets/sounds/coin-flip.mp3";
import securityRevealSfx from "../assets/sounds/security-reveal.mp3";
import shuffleDeckSfx from "../assets/sounds/shuffle-deck.mp3";
import suspendSfx from "../assets/sounds/suspend.mp3";
import unsuspendSfx from "../assets/sounds/unsuspend.mp3";
import opponentPlaceCardSfx from "../assets/sounds/opponent-place-card.mp3";
import nextPhaseSfx from "../assets/sounds/next-phase.mp3";
import passTurnSfx from "../assets/sounds/pass-turn.mp3";
import nextAttackPhaseSfx from "../assets/sounds/next-attack-phase.mp3";
import effectAttackSfx from "../assets/sounds/effect-attack.mp3";
import activateEffect from "../assets/sounds/activate-effect.mp3";
import targetCardSfx from "../assets/sounds/effect-target.mp3";
import modifyCardSfx from "../assets/sounds/modify-card.mp3";
import rematchSfx from "../assets/sounds/rematch.mp3";
import joinSfx from "../assets/sounds/player-joined.mp3";
import countdownSfx from "../assets/sounds/countdown.mp3";
import kickSfx from "../assets/sounds/kick.mp3";

import avant from "../assets/music/sad_gatomon_lofi/Avant (@SadGatomon cover).mp3";
import brave_heart from "../assets/music/sad_gatomon_lofi/Brave Heart (@SadGatomon cover).mp3";
import break_up from "../assets/music/sad_gatomon_lofi/Break up (@SadGatomon cover).mp3";
import butterfly from "../assets/music/sad_gatomon_lofi/Butter-Fly (@SadGatomon cover).mp3";
import survive_main_theme from "../assets/music/sad_gatomon_lofi/Digimon Survive - Main Theme (@SadGatomon cover feat.@jembei).mp3";
import file_city_night from "../assets/music/sad_gatomon_lofi/Digimon World - Night Time in File City (@SadGatomon cover).mp3";
import evo from "../assets/music/sad_gatomon_lofi/EVO (@SadGatomon cover).mp3";
import fire from "../assets/music/sad_gatomon_lofi/Fire (@SadGatomon cover).mp3";
import namida_no_yukue from "../assets/music/sad_gatomon_lofi/Namida no Yukue (@SadGatomon cover).mp3";
import shouri_zen_no_theme from "../assets/music/sad_gatomon_lofi/shouri zen no theme (@SadGatomon cover feat.@jembei).mp3";
import target from "../assets/music/sad_gatomon_lofi/Target (@SadGatomon cover).mp3";
import the_biggest_dreamer from "../assets/music/sad_gatomon_lofi/The Biggest Dreamer (@SadGatomon cover).mp3";

import bgm_1 from "../assets/music/project_drasil_bgm/Drasil-BGM-1.mp3";
import bgm_2 from "../assets/music/project_drasil_bgm/Drasil-BGM-2.mp3";
import bgm_3 from "../assets/music/project_drasil_bgm/Drasil-BGM-3.mp3";
import bgm_4 from "../assets/music/project_drasil_bgm/Drasil-BGM-4.mp3";
import bgm_5 from "../assets/music/project_drasil_bgm/Drasil-BGM-5.mp3";
import bgm_6 from "../assets/music/project_drasil_bgm/Drasil-BGM-6.mp3";
import bgm_7 from "../assets/music/project_drasil_bgm/Drasil-BGM-7.mp3";
import bgm_8 from "../assets/music/project_drasil_bgm/Drasil-BGM-8.mp3";
import bgm_9 from "../assets/music/project_drasil_bgm/Drasil-BGM-9.mp3";
import bgm_10 from "../assets/music/project_drasil_bgm/Drasil-BGM-10.mp3";
import bgm_11 from "../assets/music/project_drasil_bgm/Drasil-BGM-11.mp3";
import bgm_12 from "../assets/music/project_drasil_bgm/Drasil-BGM-12.mp3";
import bgm_13 from "../assets/music/project_drasil_bgm/Drasil-BGM-13.mp3";
import bgm_14 from "../assets/music/project_drasil_bgm/Drasil-BGM-14.mp3";
import bgm_15 from "../assets/music/project_drasil_bgm/Drasil-BGM-15.mp3";
import bgm_16 from "../assets/music/project_drasil_bgm/Drasil-BGM-16.mp3";
import bgm_17 from "../assets/music/project_drasil_bgm/Drasil-BGM-17.mp3";
import bgm_18 from "../assets/music/project_drasil_bgm/Drasil-BGM-18.mp3";
import bgm_19 from "../assets/music/project_drasil_bgm/Drasil-BGM-19.mp3";
import bgm_20 from "../assets/music/project_drasil_bgm/Drasil-BGM-20.mp3";

import { create } from "zustand";
import {isTrue, shuffleArray} from "../utils/functions.ts";

type State = {
    playlist: string[],
    sfxEnabled: boolean,
    musicVolume: number,
    currentSong: string,
    isMusicPlaying: boolean,
    toggleSfxEnabled: () => void,
    setPlaylist: (playlist: string[]) => void,
    setMusicVolume: (volume: number) => void,
    isRadioMenuExpanded: boolean,
    toggleRadioMenu: () => void,
    nextSong: (onEnded?: boolean) => void,
    prevSong: () => void,
    startMusic: () => void,
    stopMusic: () => void,
    playDrawCardSfx: () => void,
    playButtonClickSfx: () => void,
    playRevealCardSfx: () => void,
    playCardToHandSfx: () => void,
    playPlaceCardSfx: () => void,
    playTrashCardSfx: () => void,
    playAttackSfx: () => void,
    playCoinFlipSfx: () => void,
    playSecurityRevealSfx: () => void,
    playShuffleDeckSfx: () => void,
    playSuspendSfx: () => void,
    playUnsuspendSfx: () => void,
    playOpponentPlaceCardSfx: () => void,
    playNextPhaseSfx: () => void,
    playPassTurnSfx: () => void,
    playNextAttackPhaseSfx: () => void,
    playEffectAttackSfx: () => void,
    playActivateEffectSfx: () => void,
    playTargetCardSfx: () => void,
    playModifyCardSfx: () => void,
    playRematchSfx: () => void,
    playJoinSfx: () => void,
    playCountdownSfx: () => void,
    playKickSfx: () => void,
};

export const sadgatomonPlaylist = [
    avant, brave_heart, break_up, butterfly, survive_main_theme, file_city_night, evo, fire, namida_no_yukue,
    shouri_zen_no_theme, target, the_biggest_dreamer
]

export const projectDrasilPlaylist = [
    bgm_1, bgm_2, bgm_3, bgm_4, bgm_5, bgm_6, bgm_7, bgm_8, bgm_9, bgm_10, bgm_11, bgm_12, bgm_13, bgm_14, bgm_15,
    bgm_16, bgm_17, bgm_18, bgm_19, bgm_20
]

export const useSound = create<State>((set, get) => {

    const initialSrc = JSON.parse(localStorage.getItem('playlist') ?? JSON.stringify(shuffleArray(projectDrasilPlaylist)));

    const initialState = {
        playlist: initialSrc,
        sfxEnabled: isTrue(localStorage.getItem('sfxEnabled') ?? ""),
        musicVolume: parseFloat(localStorage.getItem('musicVolume') ?? '0.5'),
        currentSong: '',
        isMusicPlaying: false,
        isRadioMenuExpanded: false,
    };

    // Music
    const music = new Audio(initialSrc[0]);
    music.addEventListener('ended', () => get()?.nextSong(true));

    function setPlaylist (playlist: string[]) {
        const newPlaylist = shuffleArray(playlist);
        set(() => ({playlist: newPlaylist}));
        localStorage.setItem('playlist', JSON.stringify(newPlaylist));
    }

    const toggleRadioMenu = () => set((state) => ({ isRadioMenuExpanded: !state.isRadioMenuExpanded }));

    function startMusic() {
        music.volume = (parseFloat(localStorage.getItem('musicVolume') ?? '0.5') * 0.75);
        music.play().then(() => set(() => ({ isMusicPlaying: true, currentSong: getTitle(music.currentSrc) })));
    }

    function stopMusic() {
        music.pause()
        set(() => ({ isMusicPlaying: false }));
    }

    function setMusicVolume(volume: number) {
        music.volume = volume * 0.75;
        set(() => ({ musicVolume: volume }));
        localStorage.setItem('musicVolume', volume.toString());
    }

    function nextSong(onEnded = false) {
        if(music.paused && !onEnded) return;
        const songs = get().playlist;
        const currentSongIndex = songs.findIndex((song) => getTitle(song) === get().currentSong);
        music.src = songs[(currentSongIndex + 1)] ?? songs[0];
        startMusic();
    }

    function prevSong() {
        if(music.paused) return;
        if(music.currentTime > 7) {
            music.currentTime = 0;
            return;
        }
        const songs = get().playlist;
        const currentSongIndex = songs.findIndex((song) => getTitle(song) === get().currentSong);
        music.src = songs[(currentSongIndex - 1)] ?? songs[songs.length - 1];
        startMusic();
    }

    // SFX
    const toggleSfxEnabled = () => set((state) => {
        localStorage.setItem('sfxEnabled', String(!state.sfxEnabled));
        return { sfxEnabled: !state.sfxEnabled }
    });

    function playSound(src: string, volume: number = 1, delay?: number, longSound?: boolean){
        if (!get().sfxEnabled) return;

        const audio = new Audio(src);
        audio.volume = volume;

        let musicVolume: number;
        if(!music.paused) {
            audio.volume = Math.min(volume * 1.2, 1);
            if(longSound) {
                musicVolume = get().musicVolume;
                music.volume = musicVolume * 0.5;
                audio.addEventListener('ended', () => music.volume = musicVolume);
            }
        }

        audio.addEventListener('canplay', () => {
            if (delay) setTimeout(() => audio.play(), delay);
            else audio.play();
        });
    }

    const playDrawCardSfx = (): void => playSound(drawCardSfx, 0.5);
    const playButtonClickSfx = (): void => playSound(buttonClickSfx, 0.35);
    const playRevealCardSfx = (): void => playSound(revealCardSfx, 0.25);
    const playCardToHandSfx = (): void => playSound(cardToHandSfx, 0.25);
    const playPlaceCardSfx = (): void => playSound(placeCardSfx, 0.8);
    const playTrashCardSfx = (): void => playSound(trashCardSfx, 1);
    const playAttackSfx = (): void => playSound(attackSfx, 0.25,0,true);
    const playCoinFlipSfx = (): void => playSound(coinFlipSfx, 0.1);
    const playSecurityRevealSfx = (): void => playSound(securityRevealSfx, 0.5,0,true);
    const playShuffleDeckSfx = (): void => playSound(shuffleDeckSfx, 0.8,0,true);
    const playSuspendSfx = (): void => playSound(suspendSfx, 1);
    const playUnsuspendSfx = (): void => playSound(unsuspendSfx, 0.15);
    const playOpponentPlaceCardSfx = (): void => playSound(opponentPlaceCardSfx, 0.7, 100);
    const playNextPhaseSfx = (): void => playSound(nextPhaseSfx, 0.25);
    const playPassTurnSfx = (): void => playSound(passTurnSfx, 0.7);
    const playNextAttackPhaseSfx = (): void => playSound(nextAttackPhaseSfx, 1);
    const playEffectAttackSfx = (): void => playSound(effectAttackSfx, 0.1,0,true);
    const playActivateEffectSfx = (): void => playSound(activateEffect, 0.55,0,true);
    const playTargetCardSfx = (): void => playSound(targetCardSfx, 0.25,0,true);
    const playModifyCardSfx = (): void => playSound(modifyCardSfx, 1);
    const playRematchSfx = (): void => playSound(rematchSfx, 0.6);
    const playJoinSfx = (): void => playSound(joinSfx, 0.6);
    const playCountdownSfx = (): void => playSound(countdownSfx, 0.95);
    const playKickSfx = (): void => playSound(kickSfx, 0.9);

    return {
        ...initialState,
        setPlaylist,
        toggleRadioMenu,
        toggleSfxEnabled,
        setMusicVolume,
        startMusic,
        stopMusic,
        nextSong,
        prevSong,
        playDrawCardSfx,
        playButtonClickSfx,
        playRevealCardSfx,
        playCardToHandSfx,
        playPlaceCardSfx,
        playTrashCardSfx,
        playAttackSfx,
        playCoinFlipSfx,
        playSecurityRevealSfx,
        playShuffleDeckSfx,
        playSuspendSfx,
        playUnsuspendSfx,
        playOpponentPlaceCardSfx,
        playNextPhaseSfx,
        playPassTurnSfx,
        playNextAttackPhaseSfx,
        playEffectAttackSfx,
        playActivateEffectSfx,
        playTargetCardSfx,
        playModifyCardSfx,
        playRematchSfx,
        playJoinSfx,
        playCountdownSfx,
        playKickSfx
    };
});

function getTitle(song: string) {
    switch(getFileName(song)) {
        case getFileName(avant): return 'Avant';
        case getFileName(brave_heart): return 'Brave Heart';
        case getFileName(break_up): return 'Break up!';
        case getFileName(butterfly): return 'Butterfly';
        case getFileName(survive_main_theme): return 'Survive Main Theme';
        case getFileName(file_city_night): return 'File City Night';
        case getFileName(evo): return 'EVO';
        case getFileName(fire): return 'Fire!!';
        case getFileName(namida_no_yukue): return 'Namida No Yukue';
        case getFileName(shouri_zen_no_theme): return 'Shouri (Zen No Theme)';
        case getFileName(target): return 'Target';
        case getFileName(the_biggest_dreamer): return 'The Biggest Dreamer';
        case getFileName(bgm_1): return 'BGM 1';
        case getFileName(bgm_2): return 'BGM 2';
        case getFileName(bgm_3): return 'BGM 3';
        case getFileName(bgm_4): return 'BGM 4';
        case getFileName(bgm_5): return 'BGM 5';
        case getFileName(bgm_6): return 'BGM 6';
        case getFileName(bgm_7): return 'BGM 7';
        case getFileName(bgm_8): return 'BGM 8';
        case getFileName(bgm_9): return 'BGM 9';
        case getFileName(bgm_10): return 'BGM 10';
        case getFileName(bgm_11): return 'BGM 11';
        case getFileName(bgm_12): return 'BGM 12';
        case getFileName(bgm_13): return 'BGM 13';
        case getFileName(bgm_14): return 'BGM 14';
        case getFileName(bgm_15): return 'BGM 15';
        case getFileName(bgm_16): return 'BGM 16';
        case getFileName(bgm_17): return 'BGM 17';
        case getFileName(bgm_18): return 'BGM 18';
        case getFileName(bgm_19): return 'BGM 19';
        case getFileName(bgm_20): return 'BGM 20';
        default: return '';
    }
}

const getFileName = (url: string) => url.substring(url.lastIndexOf('/') + 1);
