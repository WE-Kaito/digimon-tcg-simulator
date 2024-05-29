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


type State = {
    sfxEnabled: boolean,
    musicVolume: number,
    toggleSfxEnabled: () => void,
    setMusicVolume: (volume: number) => void,
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
    };

    // Music
    const setMusicVolume = (volume: number) => set(() => ({ musicVolume: volume }));

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
        toggleSfxEnabled,
        setMusicVolume,
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
