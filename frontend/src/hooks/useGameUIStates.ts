import { create } from "zustand";
import {DragMode, OpenedCardModal} from "../utils/types.ts";
import {digimonLocations} from "./useGameBoardStates.ts";

type DigimonLocation = typeof digimonLocations[number];

type State = {
    dragMode: DragMode,
    toggleDragMode: () => void,

    openedCardModal: OpenedCardModal | false,
    setOpenedCardModal: (openedCardModal: OpenedCardModal | false) => void,

    stackModal: DigimonLocation | false,
    setStackModal: (location: DigimonLocation | false) => void,

    restartPromptModal: boolean,
    setRestartPromptModal: (open: boolean) => void,

    restartOrder: "first" | "second",
    setRestartOrder: (restartOrder: "second" | "first") => void,

    isRematch: boolean,
    setIsRematch: (isRematch: boolean) => void,

    endModal: boolean, // TODO: Refactor to one modal state like openedCardModal, to avoid multiple modal dialogs
    setEndModal: (open: boolean) => void,

    endModalText: string,
    setEndModalText: (text: string) => void,

    tokenModal: boolean,
    setTokenModal: (open: boolean) => void,
};

export const useGameUIStates = create<State>((set) => ({

    dragMode: DragMode.SINGLE,
    toggleDragMode: () => set(state => ({ dragMode: state.dragMode === DragMode.SINGLE ? DragMode.STACK : DragMode.SINGLE })),

    openedCardModal: false,
    setOpenedCardModal: (openedCardModal) => set({ openedCardModal }),

    stackModal: false,
    setStackModal: (location) => set({ stackModal: location }),

    restartOrder: "first",
    setRestartOrder: (restartOrder) => set({ restartOrder }),

    restartPromptModal: false,
    setRestartPromptModal: (open) => set({ restartPromptModal: open }),

    isRematch: false,
    setIsRematch: (isRematch) => set({ isRematch }),

    endModal: false,
    setEndModal: (open) => set({ endModal: open }),

    endModalText: "",
    setEndModalText: (text) => set({ endModalText: text }),

    tokenModal: false,
    setTokenModal: (open) => set({ tokenModal: open }),

}));
