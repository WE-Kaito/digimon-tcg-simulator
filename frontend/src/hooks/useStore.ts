import { create } from "zustand";
import {CardType} from "../utils/types.ts";
import axios from "axios";

type State = {
    fetchedCards: CardType[],
    isLoading: boolean,
    fetchCards: () => void,

};

export const useStore = create<State>((set) => ({

    fetchedCards: [],
    isLoading: true,

    fetchCards: () => {
        set({isLoading: true})
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .then((data) => {
                set({ fetchedCards: data });
            })
            .catch(console.error)
            .then(() => set({isLoading: false}));

    },
}));
