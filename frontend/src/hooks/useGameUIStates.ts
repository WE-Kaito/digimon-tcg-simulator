import { create } from "zustand";
import { digimonLocations } from "./useGameBoardStates.ts";
import type { CardTypeGame } from "../utils/types.ts";

type DigimonLocation = (typeof digimonLocations)[number];

export enum OpenedCardDialog {
    MY_SECURITY = "mySecurity",
    MY_TRASH = "myTrash",
    OPPONENT_TRASH = "opponentTrash",
}

export enum Emote {
    HELLO = "hello",
    WAIT = "wait",
    GOOD = "good",
    BAFFLED = "baffled",
}

export type EffectTargeting = {
    sourceCardId: string;
    effectSourceCardId?: string;
    sourceLocation: string;
    sourceName: string;
    timing: string;
    effectText: string;
};

export type AttackSource = {
    card: CardTypeGame;
    location: string;
};

type State = {
    isStackDragMode: boolean;
    setIsStackDragMode: (isStackDragMode: boolean) => void;

    openedCardDialog: OpenedCardDialog | false;
    setOpenedCardDialog: (openedCardModal: OpenedCardDialog | false) => void;

    stackDialog: DigimonLocation | false;
    setStackDialog: (location: DigimonLocation | false) => void;

    restartPromptModal: boolean;
    setRestartPromptModal: (open: boolean) => void;

    restartOrder: "first" | "second";
    setRestartOrder: (restartOrder: "second" | "first") => void;

    isRematch: boolean;
    setIsRematch: (isRematch: boolean) => void;

    endedBySurrender: boolean;
    setEndedBySurrender: (endedBySurrender: boolean) => void;

    isEndDialogOpen: boolean; // TODO: Refactor to one dialog state like openedCardDialog, to avoid multiple dialogs
    setIsEndDialogOpen: (open: boolean) => void;

    endDialogText: string;
    setEndDialogText: (text: string) => void;

    isTokenDialogOpen: boolean;
    setIsTokenDialogOpen: (open: boolean) => void;

    stackDragIcon: null | { location: string; index: number };
    setStackDragIcon: (stackDragIcon: { location: string; index: number } | null) => void;

    stackDraggedLocation: string | null;
    setStackDraggedLocation: (location: string | null) => void;

    /**
     * AttackArrow's target id.
     */
    arrowFrom: string;
    setArrowFrom: (locationAsId: string) => void;

    /**
     * AttackArrow's origin id.
     */
    arrowTo: string;
    setArrowTo: (locationAsId: string) => void;

    isEffectArrow: boolean;
    setIsEffectArrow: (isEffectArrow: boolean) => void;

    myEmote: Emote | null;
    setMyEmote: (emote: Emote | null) => void;

    opponentEmote: Emote | null;
    setOpponentEmote: (emote: Emote | null) => void;

    fieldOffset: number;
    setFieldOffset: (offset: number) => void;

    opponentFieldOffset: number;
    setOpponentFieldOffset: (offset: number) => void;

    showSecuritySendButtons: boolean;
    setShowSecuritySendButtons: (show: boolean) => void;

    attackSource: AttackSource | null;
    pinAttackSource: (source: AttackSource) => void;
    clearAttackSource: () => void;

    effectTargeting: EffectTargeting | null;
    effectTargetingQueue: EffectTargeting[];
    startEffectTargeting: (targeting: EffectTargeting) => void;
    cancelEffectTargeting: () => void;
    clearEffectTargetingQueue: () => void;
};

function isSameEffectTargeting(left: EffectTargeting, right: EffectTargeting) {
    return (
        left.sourceCardId === right.sourceCardId &&
        left.effectSourceCardId === right.effectSourceCardId &&
        left.sourceLocation === right.sourceLocation &&
        left.timing === right.timing &&
        left.effectText === right.effectText
    );
}

export const useGameUIStates = create<State>((set) => ({
    isStackDragMode: false,
    setIsStackDragMode: (isStackDragMode) => set({ isStackDragMode }),

    openedCardDialog: false,
    setOpenedCardDialog: (openedCardDialog) => set({ openedCardDialog, stackDialog: false }),

    stackDialog: false,
    setStackDialog: (stackDialog) => set({ stackDialog, openedCardDialog: false }),

    restartOrder: "first",
    setRestartOrder: (restartOrder) => set({ restartOrder }),

    restartPromptModal: false,
    setRestartPromptModal: (open) => set({ restartPromptModal: open }),

    isRematch: false,
    setIsRematch: (isRematch) => set({ isRematch }),

    endedBySurrender: false,
    setEndedBySurrender: (endedBySurrender) => set({ endedBySurrender }),

    isEndDialogOpen: false,
    setIsEndDialogOpen: (open) => set({ isEndDialogOpen: open }),

    endDialogText: "",
    setEndDialogText: (text) => set({ endDialogText: text }),

    isTokenDialogOpen: false,
    setIsTokenDialogOpen: (open) => set({ isTokenDialogOpen: open }),

    stackDragIcon: null,
    setStackDragIcon: (stackDragIcon) => set({ stackDragIcon }),

    stackDraggedLocation: null,
    setStackDraggedLocation: (location) => set({ stackDraggedLocation: location }),

    arrowFrom: "",
    setArrowFrom: (arrowFrom) => set({ arrowFrom }),

    arrowTo: "",
    setArrowTo: (arrowTo) => set({ arrowTo }),

    isEffectArrow: false,
    setIsEffectArrow: (isEffectArrow) => set({ isEffectArrow }),

    myEmote: null,
    setMyEmote: (emote) => {
        set({ myEmote: emote });
        setTimeout(() => set({ myEmote: null }), 5000);
    },

    opponentEmote: null,
    setOpponentEmote: (emote) => {
        set({ opponentEmote: emote });
        setTimeout(() => set({ opponentEmote: null }), 5000);
    },

    fieldOffset: 0,
    setFieldOffset: (offset) => set({ fieldOffset: Math.max(0, Math.min(8, offset)) }),

    opponentFieldOffset: 0,
    setOpponentFieldOffset: (offset) => set({ opponentFieldOffset: Math.max(0, Math.min(8, offset)) }),

    showSecuritySendButtons: false,
    setShowSecuritySendButtons: (showSecuritySendButtons) => set({ showSecuritySendButtons }),

    attackSource: null,
    pinAttackSource: (attackSource) => set({ attackSource }),
    clearAttackSource: () => set({ attackSource: null }),

    effectTargeting: null,
    effectTargetingQueue: [],
    startEffectTargeting: (targeting) =>
        set((state) => {
            if (!state.effectTargeting) return { effectTargeting: targeting };
            if (
                isSameEffectTargeting(state.effectTargeting, targeting) ||
                state.effectTargetingQueue.some((queued) => isSameEffectTargeting(queued, targeting))
            ) {
                return state;
            }
            return { effectTargetingQueue: [...state.effectTargetingQueue, targeting] };
        }),
    cancelEffectTargeting: () =>
        set((state) => ({
            effectTargeting: state.effectTargetingQueue[0] ?? null,
            effectTargetingQueue: state.effectTargetingQueue.slice(1),
        })),
    clearEffectTargetingQueue: () => set({ effectTargeting: null, effectTargetingQueue: [] }),
}));
