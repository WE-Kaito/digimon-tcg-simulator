import {create} from "zustand";
import {CardTypeGame, GameDistribution, Player} from "../utils/types.ts";
import {opponentFieldLocations} from "../utils/functions.ts";

type State = {
    myAvatar: string,
    opponentAvatar: string,

    myMemory: number,
    myReveal: CardTypeGame[],

    myHand: CardTypeGame[],
    myDeckField: CardTypeGame[],
    myEggDeck: CardTypeGame[],
    myTrash: CardTypeGame[],
    mySecurity: CardTypeGame[],
    myTamer: CardTypeGame[],
    myDelay: CardTypeGame[],

    myDigi1: CardTypeGame[],
    myDigi2: CardTypeGame[],
    myDigi3: CardTypeGame[],
    myDigi4: CardTypeGame[],
    myDigi5: CardTypeGame[],
    myDigi6: CardTypeGame[],
    myDigi7: CardTypeGame[],
    myDigi8: CardTypeGame[],
    myDigi9: CardTypeGame[],
    myDigi10: CardTypeGame[],
    myBreedingArea: CardTypeGame[],

    opponentMemory: number,
    opponentReveal: CardTypeGame[],

    opponentHand: CardTypeGame[],
    opponentDeckField: CardTypeGame[],
    opponentEggDeck: CardTypeGame[],
    opponentTrash: CardTypeGame[],
    opponentSecurity: CardTypeGame[],
    opponentTamer: CardTypeGame[],
    opponentDelay: CardTypeGame[],

    opponentDigi1: CardTypeGame[],
    opponentDigi2: CardTypeGame[],
    opponentDigi3: CardTypeGame[],
    opponentDigi4: CardTypeGame[],
    opponentDigi5: CardTypeGame[],
    opponentDigi6: CardTypeGame[],
    opponentDigi7: CardTypeGame[],
    opponentDigi8: CardTypeGame[],
    opponentDigi9: CardTypeGame[],
    opponentDigi10: CardTypeGame[],
    opponentBreedingArea: CardTypeGame[],

    messages: string[],
    setMessages: (message: string) => void,

    setUpGame: (me: Player, opponent: Player) => void,
    distributeCards: (user: string, game: GameDistribution, gameId: string) => void,
    moveCard: (cardId: string, from: string, to: string) => void,
    getUpdatedGame: (gameId: string, user: string) => string,
    drawCardFromDeck: () => void,
    drawCardFromEggDeck: () => void,

    sendCardToDeck: (topOrBottom: "top" | "bottom", cardToSend: { id: string, location: string }, to: string) => void,
    setMemory: (memory: number) => void,
    shuffleSecurity: () => void,
    tiltCard: (cardId: string,
               location: string,
               playSuspendSfx: () => void,
               playUnsuspendSfx: () => void,
               sendSfx: (sfx: string) => void) => void,
};


export const useGame = create<State>((set, get) => ({

    myAvatar: "",
    opponentAvatar: "",

    myMemory: 0,
    myReveal: [],

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
    myDigi6: [],
    myDigi7: [],
    myDigi8: [],
    myDigi9: [],
    myDigi10: [],
    myBreedingArea: [],

    opponentMemory: 0,
    opponentReveal: [],

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
    opponentDigi6: [],
    opponentDigi7: [],
    opponentDigi8: [],
    opponentDigi9: [],
    opponentDigi10: [],
    opponentBreedingArea: [],

    messages: [],

    setUpGame: (me, opponent) => {
        set({
            myAvatar: me.avatarName,
            opponentAvatar: opponent.avatarName,

            messages: [],

            myMemory: 0,
            myReveal: [],
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
            myDigi6: [],
            myDigi7: [],
            myDigi8: [],
            myDigi9: [],
            myDigi10: [],
            myBreedingArea: [],
            opponentMemory: 0,
            opponentReveal: [],
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
            opponentDigi6: [],
            opponentDigi7: [],
            opponentDigi8: [],
            opponentDigi9: [],
            opponentDigi10: [],
            opponentBreedingArea: [],
        });
    },

    distributeCards: (user, game, gameId) => {

        const player1 = gameId.split("‗")[0];

        if (user === player1) {
            set({
                myMemory: game.player1Memory,
                myReveal: game.player1Reveal,
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
                myDigi6: game.player1Digi6,
                myDigi7: game.player1Digi7,
                myDigi8: game.player1Digi8,
                myDigi9: game.player1Digi9,
                myDigi10: game.player1Digi10,
                myBreedingArea: game.player1BreedingArea,
                opponentMemory: game.player2Memory,
                opponentReveal: game.player2Reveal,
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
                opponentDigi6: game.player2Digi6,
                opponentDigi7: game.player2Digi7,
                opponentDigi8: game.player2Digi8,
                opponentDigi9: game.player2Digi9,
                opponentDigi10: game.player2Digi10,
                opponentBreedingArea: game.player2BreedingArea,
            });
        } else {
            set({
                myMemory: game.player2Memory,
                myReveal: game.player2Reveal,
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
                myDigi6: game.player2Digi6,
                myDigi7: game.player2Digi7,
                myDigi8: game.player2Digi8,
                myDigi9: game.player2Digi9,
                myDigi10: game.player2Digi10,
                myBreedingArea: game.player2BreedingArea,
                opponentMemory: game.player1Memory,
                opponentReveal: game.player1Reveal,
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
                opponentDigi6: game.player1Digi6,
                opponentDigi7: game.player1Digi7,
                opponentDigi8: game.player1Digi8,
                opponentDigi9: game.player1Digi9,
                opponentDigi10: game.player1Digi10,
                opponentBreedingArea: game.player1BreedingArea,
            });
        }
    },

    moveCard: (cardId, from, to) => {

        if (!cardId || !from || !to) return;

        if (opponentFieldLocations.includes(from) || opponentFieldLocations.includes(to)) return;

        if (from === to) {
            set(state => {
                const fromState = state[from as keyof State] as CardTypeGame[];
                const card = fromState.find(card => card.id === cardId);
                if (!card) return state;
                const updatedFromState = fromState.filter(card => card.id !== cardId);
                return {
                    [from]: [...updatedFromState, card]
                };
            });
            return;
        }

        set(state => {
            const fromState = state[from as keyof State] as CardTypeGame[];
            const toState = state[to as keyof State] as CardTypeGame[];
            const cardIndex = fromState.findIndex(card => card.id === cardId);
            if (cardIndex === -1) return state;
            const card = fromState[cardIndex];
            card.isTilted = false;
            const updatedFromState = [...fromState.slice(0, cardIndex), ...fromState.slice(cardIndex + 1)];
            const updatedToState = [...toState, card];

            return {
                [from]: updatedFromState,
                [to]: updatedToState
            };
        });
    },

    getUpdatedGame: (gameId, user) => {

        const player1 = gameId.split("‗")[0];
        let updatedGame: GameDistribution;

        if (user === player1) {
            updatedGame = {
                player1Memory: get().myMemory,
                player1Reveal: get().myReveal,
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
                player1Digi6: get().myDigi6,
                player1Digi7: get().myDigi7,
                player1Digi8: get().myDigi8,
                player1Digi9: get().myDigi9,
                player1Digi10: get().myDigi10,
                player1BreedingArea: get().myBreedingArea,
                player2Memory: get().opponentMemory,
                player2Reveal: get().opponentReveal,
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
                player2Digi6: get().opponentDigi6,
                player2Digi7: get().opponentDigi7,
                player2Digi8: get().opponentDigi8,
                player2Digi9: get().opponentDigi9,
                player2Digi10: get().opponentDigi10,
                player2BreedingArea: get().opponentBreedingArea
            };
        } else {
            updatedGame = {
                player1Memory: get().opponentMemory,
                player1Reveal: get().opponentReveal,
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
                player1Digi6: get().opponentDigi6,
                player1Digi7: get().opponentDigi7,
                player1Digi8: get().opponentDigi8,
                player1Digi9: get().opponentDigi9,
                player1Digi10: get().opponentDigi10,
                player1BreedingArea: get().opponentBreedingArea,
                player2Memory: get().myMemory,
                player2Reveal: get().myReveal,
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
                player2Digi6: get().myDigi6,
                player2Digi7: get().myDigi7,
                player2Digi8: get().myDigi8,
                player2Digi9: get().myDigi9,
                player2Digi10: get().myDigi10,
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
                myEggDeck: updatedDeck,
                myBreedingArea: updatedBreedingArea
            };
        });
    },

    sendCardToDeck: (topOrBottom, cardToSendToDeck, to) => {
        if (cardToSendToDeck.location === to) return;
        set(state => {
            const locationCards = state[cardToSendToDeck.location as keyof State] as CardTypeGame[];
            const card = locationCards.find((card: CardTypeGame) => card.id === cardToSendToDeck.id)
            const toDeck = state[to as keyof State] as CardTypeGame[];
            const updatedDeck = topOrBottom === "top" ? [card, ...toDeck] : [...toDeck, card];
            return {
                [cardToSendToDeck.location]: locationCards.filter((card: CardTypeGame) => card.id !== cardToSendToDeck.id),
                [to]: updatedDeck
            }
        })
    },

    setMemory: (memory: number) => {
        set({
            myMemory: memory,
            opponentMemory: -memory
        })
    },

    shuffleSecurity: () => {
        set(state => {
            const security = state.mySecurity;
            const cryptoArray = new Uint32Array(security.length);
            crypto.getRandomValues(cryptoArray);
            for (let i = security.length - 1; i > 0; i--) {
                const j = cryptoArray[i] % (i + 1);
                [security[i], security[j]] = [security[j], security[i]];
            }
            return {
                mySecurity: security
            }
        })
    },

    tiltCard: (cardId, location, playSuspendSfx, playUnsuspendSfx, sendSfx) => {
        set(state => {
            const locationCards = state[location as keyof State] as CardTypeGame[];
            const card = locationCards.find((card: CardTypeGame) => card.id === cardId);
            card?.isTilted ? playUnsuspendSfx() : playSuspendSfx();
            card?.isTilted ? sendSfx("playUnsuspendCardSfx") : sendSfx("playSuspendCardSfx");
            const newLocationCards = locationCards.filter((card: CardTypeGame) => card.id !== cardId)
            if (card) {
                card.isTilted = !card.isTilted;
                newLocationCards.push(card);
            }
            return {
                [location]: newLocationCards
            }
        })
    },

    setMessages: (message: string) => {
        set(state => {
            return {
                messages: [message, ...state.messages]
            }
        })
    }
}));
