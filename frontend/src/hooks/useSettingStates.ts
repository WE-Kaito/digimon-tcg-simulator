import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type State = {
    hasAcceptedRules: boolean;
    setHasAcceptedRules: (hasAcceptedRules: boolean) => void;

    isMobileUI: boolean;
    setIsMobileUI: (isMobileUI: boolean) => void;
};

export const useSettingStates = create<State>()(
    devtools(
        persist(
            (set) => ({
                hasAcceptedRules: false,
                setHasAcceptedRules: (hasAcceptedRules) => set({ hasAcceptedRules }),

                isMobileUI: false,
                setIsMobileUI: (isMobileUI) => set({ isMobileUI }),
            }),
            { name: "projectDrasilTutorialStates" }
        )
    )
);
