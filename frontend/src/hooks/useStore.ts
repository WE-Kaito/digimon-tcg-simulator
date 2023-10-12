import {create} from "zustand";
import {CardType, CardTypeGame, CardTypeWithId, DeckType, SearchCards} from "../utils/types.ts";
import axios from "axios";
import {uid} from "uid";
import 'react-toastify/dist/ReactToastify.css';
import {
    notifyAlreadyExists, notifyCredentials,
    notifyDelete,
    notifyError, notifyInvalidImport,
    notifyLength,
    notifyName, notifyRegistered,
    notifySuccess,
    notifyUpdate
} from "../utils/toasts.ts";
import {NavigateFunction} from "react-router-dom";
import {addStarterDecks, mostFrequentColor, sortCards} from "../utils/functions.ts";

type State = {
    fetchedCards: CardTypeWithId[],
    filteredCards: CardTypeWithId[],
    isLoading: boolean,
    loadingDeck: boolean,
    selectedCard: CardTypeWithId | CardTypeGame | null,
    deckCards: CardTypeWithId[],
    decks: DeckType[],
    nameOfDeckToEdit: string,
    user: string,
    activeDeckId: string,
    isSaving: boolean,
    avatarName: string,
    gameId: string,

    fetchCards: () => void,
    filterCards: SearchCards,
    selectCard: (card: CardTypeWithId | CardTypeGame | null) => void,
    hoverCard: CardTypeWithId | null,
    setHoverCard: (card: CardTypeWithId | null) => void,
    addCardToDeck: (cardnumber: string, type: string) => void,
    deleteFromDeck: (id: string) => void,
    saveDeck: (name: string) => void,
    fetchDecks: () => void,
    updateDeck: (id: string, name: string) => void,
    setDeckById: (id: string | undefined) => void,
    deleteDeck: (id: string, navigate: NavigateFunction) => void,
    clearDeck: () => void,
    login: (userName: string, password: string, navigate: NavigateFunction) => void,
    me: () => void,
    register: (userName: string, password: string, setRegisterPage: (state: boolean) => void, navigate: NavigateFunction) => void,
    setActiveDeck: (deckId: string) => void,
    getActiveDeck: () => void,
    setAvatar: (avatarName: string) => void,
    getAvatar: () => string,
    setGameId: (gameId: string) => void,
    importDeck: (decklist: string[]) => void,
    exportDeck: () => string,
};

export const useStore = create<State>((set, get) => ({

    fetchedCards: [],
    filteredCards: [],
    isLoading: false,
    selectedCard: null,
    hoverCard: null,
    deckCards: [],
    decks: [],
    nameOfDeckToEdit: "",
    user: "",
    activeDeckId: "",
    isSaving: false,
    avatarName: "",
    gameId: "",
    loadingDeck: false,

    fetchCards: () => {
        if (get().fetchedCards.length > 0) return;
        set({isLoading: true})
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                const cardsWithId: CardTypeWithId[] = data.map((card: CardType) => ({...card, id: uid()}));
                set({
                    fetchedCards: cardsWithId,
                    filteredCards: cardsWithId
                });
            })
            .finally(() => set({isLoading: false}));
    },

    filterCards: (name,
                  color,
                  type,
                  stage,
                  attribute,
                  digi_type,
                  dp,
                  play_cost,
                  evolution_cost,
                  level,
                  cardnumber
    ) => {

        set({isLoading: true})

        let filteredData = get().fetchedCards;

        if (name) filteredData = filteredData.filter((card) => card.name.toUpperCase().includes(name.toUpperCase()));
        if (color) filteredData = filteredData.filter((card) => card.color === color);
        if (type) filteredData = filteredData.filter((card) => card.type === type);
        if (stage) filteredData = filteredData.filter((card) => card.stage === stage);
        if (attribute) filteredData = filteredData.filter((card) => card.attribute === attribute);
        if (digi_type) filteredData = filteredData.filter((card) => card.digi_type === digi_type);
        if (dp) filteredData = filteredData.filter((card) => card.dp === dp);
        if (play_cost) filteredData = filteredData.filter((card) => card.play_cost === play_cost);
        if (evolution_cost) filteredData = filteredData.filter((card) => card.evolution_cost === evolution_cost);
        if (level) filteredData = filteredData.filter((card) => card.level === level);
        if (cardnumber) filteredData = filteredData.filter((card) => card.cardnumber.toUpperCase().includes(cardnumber.toUpperCase()));

        set({filteredCards: filteredData, isLoading: false});
    },

    selectCard: (card) => {
        set({selectedCard: card});
        console.log(card);
    },

    setHoverCard: (card: CardTypeWithId | null) => {
        set({hoverCard: card});
    },

    addCardToDeck: (cardnumber, type) => {
        const digiEggsInDeck = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const cardOfIdInDeck = get().deckCards.filter((card) => card.cardnumber === cardnumber).length;
        const cardToAdd = {...get().fetchedCards.filter((card) => card.cardnumber === cardnumber)[0], id: uid()};

        if (type === "Digi-Egg" && digiEggsInDeck < 5 && cardOfIdInDeck < 4) {
            set({deckCards: [cardToAdd, ...get().deckCards]});
            return;
        }

        const eggCardLength = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength; // 50 deck-cards & max 5 eggs

        if (filteredLength >= 50) return;

        const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
        if (cardsWithoutLimit.includes(cardnumber)) {     // unique effect
            set({deckCards: [cardToAdd, ...get().deckCards]});
            return;
        }

        if ((type === "Digi-Egg" && digiEggsInDeck >= 5) || cardOfIdInDeck >= 4) return;

        set({deckCards: [cardToAdd, ...get().deckCards]});
    },

    deleteFromDeck: (id) => {
        set({deckCards: get().deckCards.filter((card) => card.id !== id)});
    },

    saveDeck: (name) => {
        const eggCardLength = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength;

        if (filteredLength !== 50) {
            notifyLength();
            return;
        }

        if (name === "") {
            notifyName();
            return;
        }

        set({isSaving: true});

        const sortedDeck = sortCards(get().deckCards);

        const deckToSave = {
            name: name,
            color: mostFrequentColor(sortedDeck),
            decklist: sortedDeck.map((card) => card.cardnumber),
            deckStatus: "INACTIVE"
        }

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.status + " " + error.response.data.message);
                } else if (error.request) {
                    // The request was made, but no response was received
                    console.error("No response received from the server");
                } else {
                    // Something happened in setting up the request that triggered an error
                    console.error("Request setup error: " + error.message);
                }
                throw error;
            })
            .then(() =>
                notifySuccess() &&
                setTimeout(function () {
                    window.location.reload();
                    set({isSaving: false});
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
        const sortedDeck = sortCards(get().deckCards);
        const deckWithoutId = {
            name: name,
            color: mostFrequentColor(sortedDeck),
            decklist: sortedDeck.map((card) => card.cardnumber)
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
        set({loadingDeck: true, filteredCards: []});
        axios
            .get(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch(console.error)
            .then((data: DeckType) => {

                const cardsWithId: CardTypeWithId[] = data.decklist.map((cardnumber: string) => ({
                    ...get().fetchedCards.filter((card) => card.cardnumber === cardnumber)[0],
                    id: uid(),
                }));

                set({
                    deckCards: cardsWithId,
                    nameOfDeckToEdit: data.name
                });
            })
            .finally(() => {
                const timeout = setTimeout(() => {
                    set({loadingDeck: false});
                }, 1200);
                return () => clearTimeout(timeout);
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
                set({user: response.data})
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
                notifyCredentials();
                throw error;
            })
    },

    me: () => {
        axios.get("/api/user/me")
            .then(response => set({user: response.data}))
    },

    register: (userName, password, setRegisterPage, navigate) => {
        const newUserData = {
            "username": `${userName}`,
            "password": `${password}`
        }

        axios.post("/api/user/register", newUserData)
            .then(response => {
                console.error(response)
                setRegisterPage(false);
                if (response.data === "Username already exists!") {
                    notifyAlreadyExists();
                }
                if (response.data === "Successfully registered!") {
                    notifyRegistered();
                    get().login(userName, password, navigate);
                    setTimeout(function () {
                        addStarterDecks();
                    }, 3000);
                }
            })
            .catch((e) => {
                console.error(e);
            });
    },

    setActiveDeck: (deckId) => {
        axios.put(`/api/user/active-deck/${deckId}`, null)
            .catch(console.error)
            .finally(() => {
                set({activeDeckId: deckId});
            });
    },

    getActiveDeck: () => {
        axios.get("/api/user/active-deck")
            .then(response => set({activeDeckId: response.data}))
            .catch(console.error);
    },

    setAvatar: (avatarName) => {
        axios.put(`/api/user/avatar/${avatarName}`, null)
            .catch(console.error)
            .finally(() => {
                set({avatarName: avatarName});
            });
    },

    getAvatar: () => {
        axios.get("/api/user/avatar")
            .then(response => set({avatarName: response.data}))
            .catch(console.error);

        return get().avatarName;
    },

    setGameId: (gameId) => {
        set({gameId: gameId});
    },

    importDeck: (decklist) => {
        set({loadingDeck: true});
        const cardsWithId: CardTypeWithId[] = decklist
            .map((cardnumber: string) => ({
            ...get().fetchedCards.filter((card) => card.cardnumber === cardnumber)[0],
            id: uid()}))
            .filter((card) => card.name !== undefined);
        // --- check if deck is valid ---
        const eggCardLength = cardsWithId.filter((card) => card.type === "Digi-Egg").length;
        const filteredLength = cardsWithId.length - eggCardLength;
        if (eggCardLength > 5 || filteredLength > 50) {
            notifyInvalidImport();
            set ({loadingDeck: false});
            return;
        }
        const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
        for (const card of cardsWithId) {
            const cardOfIdInDeck = cardsWithId.filter((c) => c.cardnumber === card.cardnumber).length;
            if (cardOfIdInDeck > 4 && !cardsWithoutLimit.includes(card.cardnumber)) {
                notifyInvalidImport();
                set({ loadingDeck: false });
                return;
            }
        }
        // ---
        set({ deckCards: cardsWithId });
        const timeout = setTimeout(() => {
            set({ loadingDeck: false });
        }, 700);
        return () => clearTimeout(timeout);
    },

    exportDeck: (): string => {
        const decklist = get().deckCards.map((card) => card.cardnumber);
        return JSON.stringify(decklist);
    }

}));
