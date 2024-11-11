import {create} from "zustand";
import {devtools, persist} from "zustand/middleware";

type State = {
    hasAcceptedRules: boolean;
    setHasAcceptedRules: (hasAcceptedRules: boolean) => void;
}

export const useTutorialStates = create<State>()(
    devtools(
        persist(
            (set) => ({
                hasAcceptedRules: false,
                setHasAcceptedRules: (hasAcceptedRules) => set({ hasAcceptedRules })
            }),
            { name: 'projectDrasilTutorialStates' },
        ),
    ),
)
