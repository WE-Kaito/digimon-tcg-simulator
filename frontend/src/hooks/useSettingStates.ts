import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type State = {
    hasAcceptedRules: boolean;
    setHasAcceptedRules: (hasAcceptedRules: boolean) => void;

    useToggleForStacks: boolean;
    setUseToggleForStacks: (useToggleForStacks: boolean) => void;

    showDetailsCardImage: boolean;
    setShowDetailsCardImage: (showDetailsCardImage: boolean) => void;

    backgroundColors: { color1: string; color2: string; color3: string };
    setBackgroundColors: (colors: { color1: string; color2: string; color3: string }) => void;
    resetBackgroundColors: () => void;
};

export const useSettingStates = create<State>()(
    devtools(
        persist(
            (set) => ({
                hasAcceptedRules: false,
                setHasAcceptedRules: (hasAcceptedRules) => set({ hasAcceptedRules }),

                useToggleForStacks: false,
                setUseToggleForStacks: (useToggleForStacks) => set({ useToggleForStacks }),

                showDetailsCardImage: true,
                setShowDetailsCardImage: (showDetailsCardImage) => set({ showDetailsCardImage }),

                backgroundColors: { color1: "#214d44", color2: "#0b3d65", color3: "#522170" },
                setBackgroundColors: (colors) => set({ backgroundColors: colors }),
                resetBackgroundColors: () =>
                    set({ backgroundColors: { color1: "#214d44", color2: "#0b3d65", color3: "#522170" } }),
            }),
            { name: "projectDrasilSettingStates" }
        )
    )
);
