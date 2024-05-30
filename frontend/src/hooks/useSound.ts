import { create } from "zustand";
import drawCardSfx from "../assets/sounds/draw-card.mp3";
import buttonClickSfx from "../assets/sounds/button-click.mp3";
import revealCardSfx from "../assets/sounds/reveal-card.mp3";
import cardToHandSfx from "../assets/sounds/card-to-hand.mp3";
import placeCardSfx from "../assets/sounds/place-card.mp3";
import trashCardSfx from "../assets/sounds/trash-card.mp3";
import attackSfx from "../assets/sounds/attack.mp3";
import startSfx from "../assets/sounds/start-whoosh.mp3";
import securityRevealSfx from "../assets/sounds/security-reveal.mp3";
import shuffleDeckSfx from "../assets/sounds/shuffle-deck.mp3";
import suspendSfx from "../assets/sounds/suspend.mp3";
import unsuspendSfx from "../assets/sounds/unsuspend.mp3";
import opponentPlaceCardSfx from "../assets/sounds/opponent-place-card.mp3";
import loadMemorybarSfx from "../assets/sounds/load-memorybar.mp3";
import invitationSfx from "../assets/sounds/invite.mp3";
import nextPhaseSfx from "../assets/sounds/next-phase.mp3";
import passTurnSfx from "../assets/sounds/pass-turn.mp3";
import nextAttackPhaseSfx from "../assets/sounds/next-attack-phase.mp3";
import effectAttackSfx from "../assets/sounds/effect-attack.mp3";
import activateEffect from "../assets/sounds/activate-effect.mp3";
import targetCardSfx from "../assets/sounds/effect-target.mp3";
import modifyCardSfx from "../assets/sounds/modify-card.mp3";
import avant from "../assets/music/Avant (@SadGatomon cover).mp3";
import brave_heart from "../assets/music/Brave Heart (@SadGatomon cover).mp3";
import break_up from "../assets/music/Break up (@SadGatomon cover).mp3";
import butterfly from "../assets/music/Butter-Fly (@SadGatomon cover).mp3";
import survive_main_theme from "../assets/music/Digimon Survive - Main Theme (@SadGatomon cover feat.@jembei).mp3";
import file_city_night from "../assets/music/Digimon World - Night Time in File City (@SadGatomon cover).mp3";
import evo from "../assets/music/EVO (@SadGatomon cover).mp3";
import fire from "../assets/music/Fire (@SadGatomon cover).mp3";
import namida_no_yukue from "../assets/music/Namida no Yukue (@SadGatomon cover).mp3";
import shouri_zen_no_theme from "../assets/music/shouri zen no theme (@SadGatomon cover feat.@jembei).mp3";
import target from "../assets/music/Target (@SadGatomon cover).mp3";
import the_biggest_dreamer from "../assets/music/The Biggest Dreamer (@SadGatomon cover).mp3";
import {shuffleArray} from "../utils/functions.ts";

type State = {
    sfxEnabled: boolean,
    musicVolume: number,
    currentSong: string,
    isMusicPlaying: boolean,
    toggleSfxEnabled: () => void,
    setMusicVolume: (volume: number) => void,
    showRadioMenu: boolean,
    toggleRadioMenu: () => void,
    nextSong: () => void,
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
    playStartSfx: () => void,
    playSecurityRevealSfx: () => void,
    playShuffleDeckSfx: () => void,
    playSuspendSfx: () => void,
    playUnsuspendSfx: () => void,
    playOpponentPlaceCardSfx: () => void,
    playLoadMemorybarSfx: () => void,
    playInvitationSfx: () => void,
    playNextPhaseSfx: () => void,
    playPassTurnSfx: () => void,
    playNextAttackPhaseSfx: () => void,
    playEffectAttackSfx: () => void,
    playActivateEffectSfx: () => void,
    playTargetCardSfx: () => void,
    playModifyCardSfx: () => void,
};

export const useSound = create<State>((set, get) => {

    const initialState = {
        sfxEnabled: Boolean(localStorage.getItem('sfxEnabled') ?? 'true'),
        musicVolume: parseFloat(localStorage.getItem('musicVolume') ?? '0.5'),
        currentSong: '',
        isMusicPlaying: false,
        showRadioMenu: false,
    };

    // Music
    const songs = shuffleArray([
        avant, brave_heart, break_up, butterfly, survive_main_theme, file_city_night, evo, fire, namida_no_yukue,
        shouri_zen_no_theme, target, the_biggest_dreamer
    ])

    const music = new Audio(songs[0]);
    music.addEventListener('ended', () => get()?.nextSong());

    const toggleRadioMenu = () => set((state) => ({ showRadioMenu: !state.showRadioMenu }));

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

    function nextSong() {
        if(music.paused) return;
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
        const currentSongIndex = songs.findIndex((song) => getTitle(song) === get().currentSong);
        music.src = songs[(currentSongIndex - 1)] ?? songs[songs.length - 1];
        startMusic();
    }

    // SFX
    const toggleSfxEnabled = () => set((state) => ({ sfxEnabled: !state.sfxEnabled }));

    function playSound(src: string, volume: number = 1, delay?: number){
        if (!get().sfxEnabled) return;

        const audio = new Audio(src);
        audio.volume = volume;

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
    const playAttackSfx = (): void => playSound(attackSfx, 0.25);
    const playStartSfx = (): void => playSound(startSfx, 0.6);
    const playSecurityRevealSfx = (): void => playSound(securityRevealSfx, 0.5);
    const playShuffleDeckSfx = (): void => playSound(shuffleDeckSfx, 0.8);
    const playSuspendSfx = (): void => playSound(suspendSfx, 1);
    const playUnsuspendSfx = (): void => playSound(unsuspendSfx, 0.15);
    const playOpponentPlaceCardSfx = (): void => playSound(opponentPlaceCardSfx, 0.7, 100);
    const playLoadMemorybarSfx = (): void => playSound(loadMemorybarSfx, 0.7);
    const playInvitationSfx = (): void => playSound(invitationSfx, 0.8);
    const playNextPhaseSfx = (): void => playSound(nextPhaseSfx, 0.25);
    const playPassTurnSfx = (): void => playSound(passTurnSfx, 0.7);
    const playNextAttackPhaseSfx = (): void => playSound(nextAttackPhaseSfx, 1);
    const playEffectAttackSfx = (): void => playSound(effectAttackSfx, 0.1);
    const playActivateEffectSfx = (): void => playSound(activateEffect, 0.55);
    const playTargetCardSfx = (): void => playSound(targetCardSfx, 0.25);
    const playModifyCardSfx = (): void => playSound(modifyCardSfx, 1);

    return {
        ...initialState,
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
        playStartSfx,
        playSecurityRevealSfx,
        playShuffleDeckSfx,
        playSuspendSfx,
        playUnsuspendSfx,
        playOpponentPlaceCardSfx,
        playLoadMemorybarSfx,
        playInvitationSfx,
        playNextPhaseSfx,
        playPassTurnSfx,
        playNextAttackPhaseSfx,
        playEffectAttackSfx,
        playActivateEffectSfx,
        playTargetCardSfx,
        playModifyCardSfx
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
        default: return '';
    }
}

const getFileName = (url: string) => url.substring(url.lastIndexOf('/') + 1);
