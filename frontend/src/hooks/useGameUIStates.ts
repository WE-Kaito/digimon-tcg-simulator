import { create } from "zustand";
import { OpenedCardModal } from "../utils/types.ts";
import { digimonLocations } from "./useGameBoardStates.ts";

type DigimonLocation = (typeof digimonLocations)[number];

type State = {
    isMobileUI: boolean;
    setIsMobileUI: (isMobileUI: boolean) => void;

    isStackDragMode: boolean;
    setIsStackDragMode: (isStackDragMode: boolean) => void;

    openedCardModal: OpenedCardModal | false;
    setOpenedCardModal: (openedCardModal: OpenedCardModal | false) => void;

    stackModal: DigimonLocation | false;
    setStackModal: (location: DigimonLocation | false) => void;

    restartPromptModal: boolean;
    setRestartPromptModal: (open: boolean) => void;

    restartOrder: "first" | "second";
    setRestartOrder: (restartOrder: "second" | "first") => void;

    isRematch: boolean;
    setIsRematch: (isRematch: boolean) => void;

    endModal: boolean; // TODO: Refactor to one modal state like openedCardModal, to avoid multiple modal dialogs
    setEndModal: (open: boolean) => void;

    endModalText: string;
    setEndModalText: (text: string) => void;

    tokenModal: boolean;
    setTokenModal: (open: boolean) => void;

    stackDragIcon: null | { location: string; index: number };
    setStackDragIcon: (stackDragIcon: { location: string; index: number } | null) => void;
};

export const useGameUIStates = create<State>((set) => ({
    isMobileUI: false,
    setIsMobileUI: (isMobileUI) => set({ isMobileUI }),

    isStackDragMode: false,
    setIsStackDragMode: (isStackDragMode) => set({ isStackDragMode }),

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

    stackDragIcon: null,
    setStackDragIcon: (stackDragIcon) => set({ stackDragIcon }),
}));
