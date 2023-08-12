import {create} from "zustand";
import {CardTypeWithId, GameDistribution, Player} from "../utils/types.ts";

type State = {
    memory: number,

    myAvatar: string,
    opponentName: string,
    opponentAvatar: string,

    myHand: CardTypeWithId[],
    myDeckField: CardTypeWithId[],
    myEggDeck: CardTypeWithId[],
    myTrash: CardTypeWithId[],
    mySecurity: CardTypeWithId[],
    myTamer: CardTypeWithId[],
    myDelay: CardTypeWithId[],

    myDigi1: CardTypeWithId[],
    myDigi2: CardTypeWithId[],
    myDigi3: CardTypeWithId[],
    myDigi4: CardTypeWithId[],
    myDigi5: CardTypeWithId[],
    myBreedingArea: CardTypeWithId[],

    opponentHand: CardTypeWithId[],
    opponentDeckField: CardTypeWithId[],
    opponentEggDeck: CardTypeWithId[],
    opponentTrash: CardTypeWithId[],
    opponentSecurity: CardTypeWithId[],
    opponentTamer: CardTypeWithId[],
    opponentDelay: CardTypeWithId[],

    opponentDigi1: CardTypeWithId[],
    opponentDigi2: CardTypeWithId[],
    opponentDigi3: CardTypeWithId[],
    opponentDigi4: CardTypeWithId[],
    opponentDigi5: CardTypeWithId[],
    opponentBreedingArea: CardTypeWithId[],

    setUpGame: (me: Player, opponent: Player) => void,
    distributeCards: (user: string, game: GameDistribution, gameId: string) => void,
    moveCard: (cardId: string, from: string, to: string) => void,
    getUpdatedGame: (gameId: string, user: string) => string,
    drawCardFromDeck: () => void,
    drawCardFromEggDeck: () => void,

    sendCardToDeck: (topOrBottom: "top" | "bottom", cardToSendToDeck: {id: string, location: string}) => void,
    sendCardToEggDeck: (topOrBottom: "top" | "bottom", cardToSendToDeck: {id: string, location: string}) => void,
    sendCardToSecurity: (topOrBottom: "top" | "bottom", cardToSendToSecurity: {id: string, location: string}) => void,
    sendCardToTrash: (cardToSendToTrash: {id: string, location: string}) => void,
};


export const useGame = create<State>((set, get) => ({

    myAvatar: "",
    opponentName: "",
    opponentAvatar: "",

    memory: 0,

    myHand: [],
    myDeckField: [],
    myEggDeck: [],
    myTrash: [],
    mySecurity: [],
    myTamer: [],
    myDelay: [],

    myDigi1: [],
    myDigi2: [],
    myDigi3: [],
    myDigi4: [],
    myDigi5: [],
    myBreedingArea: [],

    opponentHand: [],
    opponentDeckField: [],
    opponentEggDeck: [],
    opponentTrash: [],
    opponentSecurity: [],
    opponentTamer: [],
    opponentDelay: [],

    opponentDigi1: [],
    opponentDigi2: [],
    opponentDigi3: [],
    opponentDigi4: [],
    opponentDigi5: [],
    opponentBreedingArea: [],

    setUpGame: (me, opponent) => {
        set({
            myAvatar: me.avatarName,
            opponentName: opponent.username,
            opponentAvatar: opponent.avatarName,

            memory: 0,
            myHand: [],
            myDeckField: [],
            myEggDeck: [],
            myTrash: [],
            mySecurity: [],
            myTamer: [],
            myDelay: [],
            myDigi1: [],
            myDigi2: [],
            myDigi3: [],
            myDigi4: [],
            myDigi5: [],
            myBreedingArea: [],
            opponentHand: [],
            opponentDeckField: [],
            opponentEggDeck: [],
            opponentTrash: [],
            opponentSecurity: [],
            opponentTamer: [],
            opponentDelay: [],
            opponentDigi1: [],
            opponentDigi2: [],
            opponentDigi3: [],
            opponentDigi4: [],
            opponentDigi5: [],
            opponentBreedingArea: [],
        });
    },

    distributeCards: (user, game, gameId) => {

        const player1 = gameId.split("_")[0];

        set({memory: game.memory});

        if (user === player1) {
            set({
                myHand: game.player1Hand,
                myDeckField: game.player1DeckField,
                myEggDeck: game.player1EggDeck,
                myTrash: game.player1Trash,
                mySecurity: game.player1Security,
                myTamer: game.player1Tamer,
                myDelay: game.player1Delay,
                myDigi1: game.player1Digi1,
                myDigi2: game.player1Digi2,
                myDigi3: game.player1Digi3,
                myDigi4: game.player1Digi4,
                myDigi5: game.player1Digi5,
                myBreedingArea: game.player1BreedingArea,
                opponentHand: game.player2Hand,
                opponentDeckField: game.player2DeckField,
                opponentEggDeck: game.player2EggDeck,
                opponentTrash: game.player2Trash,
                opponentSecurity: game.player2Security,
                opponentTamer: game.player2Tamer,
                opponentDelay: game.player2Delay,
                opponentDigi1: game.player2Digi1,
                opponentDigi2: game.player2Digi2,
                opponentDigi3: game.player2Digi3,
                opponentDigi4: game.player2Digi4,
                opponentDigi5: game.player2Digi5,
                opponentBreedingArea: game.player2BreedingArea,
            });
        } else {
            set({
                myHand: game.player2Hand,
                myDeckField: game.player2DeckField,
                myEggDeck: game.player2EggDeck,
                myTrash: game.player2Trash,
                mySecurity: game.player2Security,
                myTamer: game.player2Tamer,
                myDelay: game.player2Delay,
                myDigi1: game.player2Digi1,
                myDigi2: game.player2Digi2,
                myDigi3: game.player2Digi3,
                myDigi4: game.player2Digi4,
                myDigi5: game.player2Digi5,
                myBreedingArea: game.player2BreedingArea,
                opponentHand: game.player1Hand,
                opponentDeckField: game.player1DeckField,
                opponentEggDeck: game.player1EggDeck,
                opponentTrash: game.player1Trash,
                opponentSecurity: game.player1Security,
                opponentTamer: game.player1Tamer,
                opponentDelay: game.player1Delay,
                opponentDigi1: game.player1Digi1,
                opponentDigi2: game.player1Digi2,
                opponentDigi3: game.player1Digi3,
                opponentDigi4: game.player1Digi4,
                opponentDigi5: game.player1Digi5,
                opponentBreedingArea: game.player1BreedingArea,
            });
        }
    },

    moveCard: (cardId, from, to) => {

        const opponentFields = ["opponentDeckField", "opponentEggDeck", "opponentTrash", "opponentSecurity", "opponentTamer",
            "opponentDelay", "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4", "opponentDigi5", "opponentBreedingArea"];
        for (const zone of opponentFields) {
            if (from === zone) return;
        }
        if (from === to) return;

        set(state => {
            const fromState = state[from as keyof State] as CardTypeWithId[];
            const toState = state[to as keyof State] as CardTypeWithId[];
            const cardIndex = fromState.findIndex(card => card.id === cardId);
            if (cardIndex === -1) return state;
            const card = fromState[cardIndex];
            const updatedFromState = [...fromState.slice(0, cardIndex), ...fromState.slice(cardIndex + 1)];
            const updatedToState = [...toState, card];

            return {
                ...state,
                [from]: updatedFromState,
                [to]: updatedToState
            };
        });
    },

    getUpdatedGame: (gameId, user) => {

        const player1 = gameId.split("_")[0];
        let updatedGame: GameDistribution;

        if (user === player1) {
            updatedGame = {
                memory: get().memory,
                player1Hand: get().myHand,
                player1DeckField: get().myDeckField,
                player1EggDeck: get().myEggDeck,
                player1Trash: get().myTrash,
                player1Security: get().mySecurity,
                player1Tamer: get().myTamer,
                player1Delay: get().myDelay,
                player1Digi1: get().myDigi1,
                player1Digi2: get().myDigi2,
                player1Digi3: get().myDigi3,
                player1Digi4: get().myDigi4,
                player1Digi5: get().myDigi5,
                player1BreedingArea: get().myBreedingArea,
                player2Hand: get().opponentHand,
                player2DeckField: get().opponentDeckField,
                player2EggDeck: get().opponentEggDeck,
                player2Trash: get().opponentTrash,
                player2Security: get().opponentSecurity,
                player2Tamer: get().opponentTamer,
                player2Delay: get().opponentDelay,
                player2Digi1: get().opponentDigi1,
                player2Digi2: get().opponentDigi2,
                player2Digi3: get().opponentDigi3,
                player2Digi4: get().opponentDigi4,
                player2Digi5: get().opponentDigi5,
                player2BreedingArea: get().opponentBreedingArea
            };
        } else {
            updatedGame = {
                memory: get().memory,
                player1Hand: get().opponentHand,
                player1DeckField: get().opponentDeckField,
                player1EggDeck: get().opponentEggDeck,
                player1Trash: get().opponentTrash,
                player1Security: get().opponentSecurity,
                player1Tamer: get().opponentTamer,
                player1Delay: get().opponentDelay,
                player1Digi1: get().opponentDigi1,
                player1Digi2: get().opponentDigi2,
                player1Digi3: get().opponentDigi3,
                player1Digi4: get().opponentDigi4,
                player1Digi5: get().opponentDigi5,
                player1BreedingArea: get().opponentBreedingArea,
                player2Hand: get().myHand,
                player2DeckField: get().myDeckField,
                player2EggDeck: get().myEggDeck,
                player2Trash: get().myTrash,
                player2Security: get().mySecurity,
                player2Tamer: get().myTamer,
                player2Delay: get().myDelay,
                player2Digi1: get().myDigi1,
                player2Digi2: get().myDigi2,
                player2Digi3: get().myDigi3,
                player2Digi4: get().myDigi4,
                player2Digi5: get().myDigi5,
                player2BreedingArea: get().myBreedingArea
            };
        }
        return JSON.stringify(updatedGame);
    },

    drawCardFromDeck: () => {
        set(state => {
            const deck = state.myDeckField;
            const hand = state.myHand;
            if (deck.length === 0) return state;
            const card = deck[0];
            const updatedDeck = deck.slice(1);
            const updatedHand = [...hand, card];
            return {
                ...state,
                myDeckField: updatedDeck,
                myHand: updatedHand
            };
        });
    },

    drawCardFromEggDeck: () => {

        set(state => {
            if (state.myBreedingArea.length !== 0) return state;
            const eggDeck = state.myEggDeck;
            if (eggDeck.length === 0) return state;
            const card = eggDeck[0];
            const updatedDeck = eggDeck.slice(1);
            const updatedBreedingArea = [card];
            return {
                ...state,
                myEggDeck: updatedDeck,
                myBreedingArea: updatedBreedingArea
            };
        });
    },

    sendCardToDeck: (topOrBottom, cardToSendToDeck) => {
        // @ts-ignore
        set(state => {
            // @ts-ignore
            const locationCards = state[cardToSendToDeck.location];
            const card = locationCards.find((card: CardTypeWithId) => card.id === cardToSendToDeck.id);
            const updatedDeck = topOrBottom === "top" ? [card, ...get().myDeckField] : [...get().myDeckField, card];
            return {
                ...state,
                [cardToSendToDeck.location]: locationCards.filter((card: CardTypeWithId) => card.id !== cardToSendToDeck.id),
                myDeckField: updatedDeck
            }
        })
    },

    sendCardToEggDeck: (topOrBottom, cardToSendToDeck) => {
        // @ts-ignore
        set(state => {
            // @ts-ignore
            const locationCards = state[cardToSendToDeck.location];
            const card = locationCards.find((card: CardTypeWithId) => card.id === cardToSendToDeck.id);
            const updatedDeck = topOrBottom === "top" ? [card, ...get().myEggDeck] : [...get().myEggDeck, card];
            return {
                ...state,
                [cardToSendToDeck.location]: locationCards.filter((card: CardTypeWithId) => card.id !== cardToSendToDeck.id),
                myEggDeck: updatedDeck
            }
        })
    },

    sendCardToTrash: (cardToSendToTrash) => {
        // @ts-ignore
        set(state => {
            // @ts-ignore
            const locationCards = state[cardToSendToTrash.location];
            const card = locationCards.find((card: CardTypeWithId) => card.id === cardToSendToTrash.id);
            return {
                ...state,
                [cardToSendToTrash.location]: locationCards.filter((card: CardTypeWithId) => card.id !== cardToSendToTrash.id),
                myTrash: [card, ...get().myTrash]
            }
        })
    },

    sendCardToSecurity: (topOrBottom, cardToSendToSecurity) => {
        // @ts-ignore
        set(state => {
            // @ts-ignore
            const locationCards = state[cardToSendToSecurity.location];
            const card = locationCards.find((card: CardTypeWithId) => card.id === cardToSendToSecurity.id);
            const updatedSecurity = topOrBottom === "top" ? [card, ...get().mySecurity] : [...get().mySecurity, card];
            return {
                ...state,
                [cardToSendToSecurity.location]: locationCards.filter((card: CardTypeWithId) => card.id !== cardToSendToSecurity.id),
                mySecurity: updatedSecurity
            }
        })
    }
}));
