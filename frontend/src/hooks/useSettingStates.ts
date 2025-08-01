import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export enum DetailsView {
    DEFAULT = "default",
    INHERIT_OR_LINK = "inherit_or_link",
    NO_IMAGE = "no_image",
}

type State = {
    hasAcceptedRules: boolean;
    setHasAcceptedRules: (hasAcceptedRules: boolean) => void;

    useToggleForStacks: boolean;
    setUseToggleForStacks: (useToggleForStacks: boolean) => void;

    details: DetailsView;
    setDetails: (details: DetailsView) => void;

    backgroundColors: { color1: string; color2: string; color3: string };
    setBackgroundColors: (colors: { color1: string; color2: string; color3: string }) => void;
    resetBackgroundColors: () => void;

    seenMulliganTutorial: boolean;
    setSeenMulliganTutorial: (seen: boolean) => void;
};

export const useSettingStates = create<State>()(
    devtools(
        persist(
            (set) => ({
                hasAcceptedRules: false,
                setHasAcceptedRules: (hasAcceptedRules) => set({ hasAcceptedRules }),

                useToggleForStacks: false,
                setUseToggleForStacks: (useToggleForStacks) => set({ useToggleForStacks }),

                details: DetailsView.DEFAULT,
                setDetails: (details) => set({ details }),

                seenMulliganTutorial: false,
                setSeenMulliganTutorial: (seen) => set({ seenMulliganTutorial: seen }),

                backgroundColors: { color1: "#214d44", color2: "#0b3d65", color3: "#522170" },
                setBackgroundColors: (colors) => set({ backgroundColors: colors }),
                resetBackgroundColors: () =>
                    set({ backgroundColors: { color1: "#214d44", color2: "#0b3d65", color3: "#522170" } }),
            }),
            { name: "projectDrasilSettingStates" }
        )
    )
);
