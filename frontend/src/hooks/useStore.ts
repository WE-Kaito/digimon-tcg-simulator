import {create} from "zustand";
import {CardType, CardTypeWithId, DeckType, FetchCards} from "../utils/types.ts";
import axios from "axios";
import {uid} from "uid";
import 'react-toastify/dist/ReactToastify.css';
import {
    notifyAlreadyExists,
    notifyDelete,
    notifyError,
    notifyLength,
    notifyName, notifyRegistered,
    notifySuccess,
    notifyUpdate
} from "../utils/toasts.ts";
import {NavigateFunction} from "react-router-dom";
import {toast} from "react-toastify";

type State = {
    fetchedCards: CardTypeWithId[],
    isLoading: boolean,
    selectedCard: CardTypeWithId | null,
    deckCards: CardTypeWithId[],
    decks: DeckType[],
    nameOfDeckToEdit: string,
    user: string,
    activeDeckId: string,

    fetchCards: FetchCards,
    selectCard: (card: CardTypeWithId) => void,
    hoverCard: CardTypeWithId | null,
    setHoverCard: (card: CardTypeWithId | null) => void,
    addCardToDeck: (id: string, location: string, cardnumber: string, type: string) => void,
    deleteFromDeck: (id: string) => void,
    saveDeck: (name: string) => void,
    fetchDecks: () => void,
    updateDeck: (id: string, name: string) => void,
    setDeckById: (id: string | undefined) => void,
    deleteDeck: (id: string, navigate: NavigateFunction) => void,
    clearDeck: () => void,
    login: (userName: string, password: string, navigate: NavigateFunction) => void,
    me: () => void,
    register: (userName:string, password: string, repeatedPassword: string, setPassword: (password:string) => void, setRepeatedPassword: (repeatedPassword:string) => void, setRegisterPage: (state: boolean) => void) => void,
    setActiveDeck: (deckId: string) => void,
    getActiveDeck: () => void,
};


export const useStore = create<State>((set, get) => ({

    fetchedCards: [],
    isLoading: false,
    selectedCard: null,
    hoverCard: null,
    deckCards: [],
    decks: [],
    nameOfDeckToEdit: "",
    user: "",
    activeDeckId: "",

    fetchCards: (name,
                 color,
                 type,
                 stage,
                 attribute,
                 digi_type,
                 dp,
                 play_cost,
                 evolution_cost,
                 level
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
            cards: get().deckCards.map(({id, ...rest}) => rest),

            deckStatus: "INACTIVE"
        }

        if (deckToSave.cards.length !== 50) {
            notifyLength();
            return;
        }

        if (name === "") {
            notifyName();
            return;
        }

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                throw error;
            })
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
    },

    updateDeck: (id, name) => {


        const deckWithoutId = {
            name: name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cards: get().deckCards.map(({id, ...rest}) => rest)
        }

        axios
            .put(`/api/profile/decks/${id}`, deckWithoutId)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                notifyUpdate();
            });
    },

    setDeckById: (id) => {

        if (id === undefined) return;

        get().fetchCards(null, null, null, null, null, null, null, null, null, null,);

        set({isLoading: true});

        axios
            .get(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {

                const cardsWithId = data.cards.map((card: CardType) => ({
                    ...card,
                    id: uid(),
                }));

                set({deckCards: cardsWithId});
                set({nameOfDeckToEdit: data.name});
                set({isLoading: false});
            });
    },

    deleteDeck: (id, navigate) => {

        axios
            .delete(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                navigate("/profile");
                set({deckCards: []});
                notifyDelete();
            });
    },

    clearDeck: () => {
        set({deckCards: []});
    },

    login: (userName: string, password: string, navigate: NavigateFunction) => {
        axios.post("/api/user/login", null, {
            auth: {
                username: userName,
                password: password
            }
        })
            .then(response => {
                set({user:response.data})
                navigate("/");
                window.location.reload();
            })
            .catch(console.error)
    },

    me: () => {
        axios.get("/api/user/me")
            .then(response => set({user:response.data}))
    },

    register: (userName, password, repeatedPassword, setPassword, setRepeatedPassword, setRegisterPage) => {
        const newUserData = {
            "username": `${userName}`,
            "password": `${password}`
        }

        if (password === repeatedPassword) {

            axios.post("/api/user/register", newUserData)
                .then(response => {
                    console.error(response)
                    setRegisterPage(false);
                    if (response.data === "Username already exists!") {
                        notifyAlreadyExists();
                    }
                    if (response.data === "Successfully registered!") {
                        notifyRegistered();
                    }
                })
                .catch((e) => {
                    console.error(e);
                });

        } else {
            setPassword("");
            setRepeatedPassword("");
        }
    },

    setActiveDeck: (deckId) => {
        set({isLoading: true})
        axios.put(`/api/user/active-deck/${deckId}`, null)
            .catch(console.error)
            .finally(() => {
                set({activeDeckId: deckId});
                set({isLoading: false})});
    },

    getActiveDeck: () => {
        axios.get("/api/user/active-deck")
            .then(response => set({activeDeckId: response.data}))
            .catch(console.error);
    }

}));
