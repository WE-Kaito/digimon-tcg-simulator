import "@testing-library/jest-dom/vitest";

// lottie-web touches the canvas 2D context at import time; jsdom doesn't
// implement it, so stub a minimal no-op context to avoid crashing imports.
HTMLCanvasElement.prototype.getContext = (() => ({
    fillStyle: "",
    fillRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
