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
import loaadMemorybarSfx from "../assets/sounds/load-memorybar.mp3";
import buttonHoverSfx from "../assets/sounds/button-hover.mp3";

// SonarCloud-ignore
export function playDrawCardSfx() {
    const audio = new Audio(drawCardSfx);
    audio.volume = 0.5;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playButtonClickSfx() {
    const audio = new Audio(buttonClickSfx);
    audio.volume = 0.35;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playRevealCardSfx() {
    const audio = new Audio(revealCardSfx);
    audio.volume = 0.25;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playCardToHandSfx() {
    const audio = new Audio(cardToHandSfx);
    audio.volume = 0.25;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playPlaceCardSfx() {
    const audio = new Audio(placeCardSfx);
    audio.volume = 0.8;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playTrashCardSfx() {
    const audio = new Audio(trashCardSfx);
    audio.volume = 1;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playAttackSfx() {
    const audio = new Audio(attackSfx);
    audio.volume = 0.3;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playStartSfx() {
    const audio = new Audio(startSfx);
    audio.volume = 0.6;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playSecurityRevealSfx() {
    const audio = new Audio(securityRevealSfx);
    audio.volume = 0.5;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playShuffleDeckSfx() {
    const audio = new Audio(shuffleDeckSfx);
    audio.volume = 0.8;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playSuspendSfx() {
    const audio = new Audio(suspendSfx);
    audio.volume = 1;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playUnsuspendSfx() {
    const audio = new Audio(unsuspendSfx);
    audio.volume = 0.25;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export function playOpponentPlaceCardSfx() {
    const audio = new Audio(opponentPlaceCardSfx);
    audio.volume = 0.7;
    audio.addEventListener('canplay', () =>{
        setTimeout(() => {
        audio.play();
    }, 100);});
}

// SonarCloud-ignore
export const playLoadMemorybarSfx = () => {
    const audio = new Audio(loaadMemorybarSfx);
    audio.volume = 0.7;
    audio.addEventListener('canplay', () => audio.play());
}

// SonarCloud-ignore
export const playButtonHoverSfx = () => {
    const audio = new Audio(buttonHoverSfx);
    audio.volume = 0.9;
    audio.addEventListener('canplay', () => audio.play());
}
