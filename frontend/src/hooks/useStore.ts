import {create} from "zustand";
import {CardType, CardTypeWithId, DeckType, FetchCards} from "../utils/types.ts";
import axios from "axios";
import {uid} from "uid";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type State = {
    fetchedCards: CardTypeWithId[],
    isLoading: boolean,
    selectedCard: CardTypeWithId | null,
    deckCards: CardTypeWithId[],
    decks: DeckType[],

    fetchCards: FetchCards,
    selectCard: (card: CardTypeWithId) => void,
    hoverCard: CardTypeWithId | null,
    setHoverCard: (card: CardTypeWithId | null) => void,
    addCardToDeck: (id: string, location: string, cardnumber: string, type: string) => void,
    deleteFromDeck: (id: string) => void,
    saveDeck: (name: string) => void,
    fetchDecks: () => void,
};

export const useStore = create<State>((set, get) => ({

    fetchedCards: [],
    isLoading: false,
    selectedCard: null,
    hoverCard: null,
    deckCards: [],
    decks: [],

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

                filteredData = filteredData.map((card: CardType) => ({
                    ...card,
                    id: uid(),
                }));

                set({fetchedCards: filteredData});

            })
            .then(() => set({isLoading: false}));

    },

    selectCard: (card: CardTypeWithId) => {
        set({selectedCard: card});
        console.log(card);
    },

    setHoverCard: (card: CardTypeWithId | null) => {
        set({hoverCard: card});
    },

    addCardToDeck: (id, location, cardnumber, type) => {
        const cardToAdd = get().fetchedCards.filter((card) => card.id === id)[0];
        const cardToAddWithNewId = {...cardToAdd, id: uid()};

        const restrictedCards: string[] = [
            "BT2-047", "BT3-103", "BT6-015", "BT6-100", "BT7-072",
            "EX1-068", "BT7-038", "BT7-086", "BT7-107", "BT9-099",
            "BT7-064", "BT10-009", "BT11-064", "BT3-054", "EX2-039",
            "P-008", "P-025"
        ];

        if (location !== "fetchedData" || get().deckCards.length >= 50) return;

        if (cardnumber === "BT5-109") return; // currently forbidden

        if (cardnumber === "BT11-061") {     // unique effect
            set({deckCards: [cardToAddWithNewId, ...get().deckCards]});
            return;
        }

        if (type === "Digi-Egg" && get().deckCards.filter((card) => card.type === "Digi-Egg").length >= 5) return;

        if (restrictedCards.some((searchString) => cardnumber.includes(searchString)) && get().deckCards.filter((card) => card.cardnumber === cardnumber).length >= 1) return;

        if (get().deckCards.filter((card) => card.cardnumber === cardnumber).length >= 4) return;

        set({deckCards: [cardToAddWithNewId, ...get().deckCards]});
    },

    deleteFromDeck: (id) => {
        set({deckCards: get().deckCards.filter((card) => card.id !== id)});
    },

    saveDeck: (name) => {
        const deckToSave = {
            name: name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cards: get().deckCards.map(({id, ...rest}) => rest)
        }

        const notifySuccess = () => toast('✔️ Deck saved!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

        const notifyLength = () => toast.error('Only full decks can be saved!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

        const notifyName = () => toast.error('Please enter a name.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

        if (deckToSave.cards.length !== 50) {
            notifyLength();
            return;}

        if(name === ""){
            notifyName();
            return;
        }

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch(console.error)
            .then(() =>
                notifySuccess() &&
                setTimeout(function () {
                    window.location.reload();
                }, 3000));
    },

    fetchDecks: () => {
        set({isLoading: true})
        axios
            .get("/api/profile/decks")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                set({decks: data});
            }).finally(() => set({isLoading: false}));
    }

}));
