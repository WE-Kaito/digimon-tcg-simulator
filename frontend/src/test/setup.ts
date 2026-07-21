import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

// lottie-web touches the canvas 2D context at import time; jsdom doesn't
// implement it, so stub a minimal no-op context to avoid crashing imports.
HTMLCanvasElement.prototype.getContext = (() => ({
    fillStyle: "",
    fillRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
