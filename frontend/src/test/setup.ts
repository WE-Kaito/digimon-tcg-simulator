import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

const storage = new Map<string, string>();
const localStorageMock: Storage = {
    get length() {
        return storage.size;
    },
    clear: () => storage.clear(),
    getItem: (key) => storage.get(key) ?? null,
    key: (index) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key) => storage.delete(key),
    setItem: (key, value) => storage.set(key, String(value)),
};

Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageMock,
});

beforeEach(() => localStorage.clear());

afterEach(() => cleanup());

// lottie-web touches the canvas 2D context at import time; jsdom doesn't
// implement it, so stub a minimal no-op context to avoid crashing imports.
HTMLCanvasElement.prototype.getContext = (() => ({
    fillStyle: "",
    fillRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
