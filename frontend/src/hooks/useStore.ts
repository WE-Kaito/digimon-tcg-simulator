import {create} from "zustand";
import {CardType} from "../utils/types.ts";
import axios from "axios";

type State = {
    fetchedCards: CardType[],
    isLoading: boolean,
    fetchCards: (name: string | null,
                 color: string | null,
                 type: string | null,
                 stage: string | null,
                 attribute: string | null,
                 digi_type: string | null,
                 dp: number | null,
                 play_cost: number | null,
                 evolution_cost: number | null,
                 level: number | null,
    ) => void,
};

export const useStore = create<State>((set) => ({

    fetchedCards: [],
    isLoading: false,

    fetchCards: (name = null,
                 color = null,
                 type = null,
                 stage = null,
                 attribute = null,
                 digi_type = null,
                 dp = null,
                 play_cost = null,
                 evolution_cost = null,
                 level = null
    ) => {

        const queryParams = {
            name: name,
            color: color,
            type: type
        };

        set({isLoading: true})
        axios
            .get("/api/profile/cards", {params: queryParams})
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {

                let filteredData = data?.slice();

                if (stage !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.stage === stage
                    );
                }
                if (attribute !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.attribute === attribute
                    );
                }
                if (digi_type !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.digi_type === digi_type
                    );
                }
                if (dp !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.dp === dp
                    );
                }
                if (play_cost !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.play_cost === play_cost
                    );
                }
                if (evolution_cost !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.evolution_cost === evolution_cost
                    );
                }
                if (level !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.level === level
                    );
                }

                set({fetchedCards: filteredData});

            })
            .then(() => set({isLoading: false}));

    },
}));
