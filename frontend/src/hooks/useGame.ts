import {create} from "zustand";
import {CardTypeGame, GameDistribution, OneSideDistribution, Player} from "../utils/types.ts";
import {uid} from "uid";
import {playTrashCardSfx} from "../utils/sound.ts";
import tokenImage from "../assets/tokenCard.jpg";

type State = {
    myAvatar: string,
    opponentAvatar: string,
    mySleeve: string,
    opponentSleeve: string,

    myMemory: number,
    myReveal: CardTypeGame[],

    myHand: CardTypeGame[],
    myDeckField: CardTypeGame[],
    myEggDeck: CardTypeGame[],
    myTrash: CardTypeGame[],
    mySecurity: CardTypeGame[],

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
    myDigi11: CardTypeGame[],
    myDigi12: CardTypeGame[],
    myDigi13: CardTypeGame[],
    myDigi14: CardTypeGame[],
    myDigi15: CardTypeGame[],
    myBreedingArea: CardTypeGame[],

    opponentMemory: number,
    opponentReveal: CardTypeGame[],

    opponentHand: CardTypeGame[],
    opponentDeckField: CardTypeGame[],
    opponentEggDeck: CardTypeGame[],
    opponentTrash: CardTypeGame[],
    opponentSecurity: CardTypeGame[],

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
    opponentDigi11: CardTypeGame[],
    opponentDigi12: CardTypeGame[],
    opponentDigi13: CardTypeGame[],
    opponentDigi14: CardTypeGame[],
    opponentDigi15: CardTypeGame[],
    opponentBreedingArea: CardTypeGame[],

    messages: string[],
    setMessages: (message: string) => void,

    mulliganAllowed: boolean,
    mulligan: () => void,
    setMulliganAllowed: (allowed: boolean) => void,
    opponentReady: boolean,
    setOpponentReady: (ready: boolean) => void,

    setUpGame: (me: Player, opponent: Player) => void,
    clearBoard: () => void,
    distributeCards: (user: string, game: GameDistribution, gameId: string) => void,
    moveCard: (cardId: string, from: string, to: string) => void,
    getMyFieldAsString: () => string,
    updateOpponentField: (field: OneSideDistribution) => void,

    sendCardToDeck: (topOrBottom: "Top" | "Bottom", cardToSend: { id: string, location: string }, to: string) => void,
    setMemory: (memory: number) => void,
    shuffleSecurity: () => void,
    tiltCard: (cardId: string,
               location: string,
               playSuspendSfx: () => void,
               playUnsuspendSfx: () => void,
               sendSfx: (sfx: string) => void) => void,
    createToken: () => void,
    moveCardStack: (index: number, from: string, to: string,
                    handleDropToField: (id: string, from: string, to: string, name: string) => void) => void

};

const destroyTokenLocations = ["myTrash", "myHand", "myTamer", "myDelay", "mySecurity", "myDeckField",
    "myEggDeck", "myBreedingArea", "opponentHand", "opponentSecurity",
    "opponentDeckField", "opponentEggDeck", "opponentBreedingArea", "opponentTrash"];

const opponentLocations = ["opponentHand", "opponentSecurity", "opponentDeckField", "opponentEggDeck",
    "opponentBreedingArea", "opponentTrash", "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4",
    "opponentDigi5", "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10",
    "opponentDigi11","opponentDigi12","opponentDigi13","opponentDigi14","opponentDigi15", "opponentReveal"];

export const useGame = create<State>((set, get) => ({

    myAvatar: "",
    opponentAvatar: "",
    mySleeve: "",
    opponentSleeve: "",

    myMemory: 0,
    myReveal: [],

    myHand: [],
    myDeckField: [],
    myEggDeck: [],
    myTrash: [],
    mySecurity: [],

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
    myDigi11: [],
    myDigi12: [],
    myDigi13: [],
    myDigi14: [],
    myDigi15: [],
    myBreedingArea: [],

    opponentMemory: 0,
    opponentReveal: [],

    opponentHand: [],
    opponentDeckField: [],
    opponentEggDeck: [],
    opponentTrash: [],
    opponentSecurity: [],

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
    opponentDigi11: [],
    opponentDigi12: [],
    opponentDigi13: [],
    opponentDigi14: [],
    opponentDigi15: [],
    opponentBreedingArea: [],

    messages: [],
    mulliganAllowed: true,
    opponentReady: false,

    setOpponentReady: (ready) => {
        set({opponentReady: ready});
    },

    setUpGame: (me, opponent) => {
        set({
            myAvatar: me.avatarName,
            opponentAvatar: opponent.avatarName,
            mySleeve: me.sleeveName,
            opponentSleeve: opponent.sleeveName,

            messages: [],
            mulliganAllowed: false,
            opponentReady: true,
        });
    },

    clearBoard: () => {
        set({
            myMemory: 0,
            myReveal: [],
            myHand: [],
            myDeckField: [],
            myEggDeck: [],
            myTrash: [],
            mySecurity: [],
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
            myDigi11: [],
            myDigi12: [],
            myDigi13: [],
            myDigi14: [],
            myDigi15: [],
            myBreedingArea: [],
            opponentMemory: 0,
            opponentReveal: [],
            opponentHand: [],
            opponentDeckField: [],
            opponentEggDeck: [],
            opponentTrash: [],
            opponentSecurity: [],
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
            opponentDigi11: [],
            opponentDigi12: [],
            opponentDigi13: [],
            opponentDigi14: [],
            opponentDigi15: [],
            opponentBreedingArea: [],
        });
    },

    distributeCards: (user, game, gameId) => {

        const player1 = gameId.split("‗")[0];

            if (user === player1) {
                set({
                    myHand: game.player1Hand,
                    myDeckField: game.player1DeckField,
                    myEggDeck: game.player1EggDeck,
                    mySecurity: game.player1Security,
                    opponentHand: game.player2Hand,
                    opponentDeckField: game.player2DeckField,
                    opponentEggDeck: game.player2EggDeck,
                    opponentSecurity: game.player2Security,
                });
            } else {
                set({
                    myHand: game.player2Hand,
                    myDeckField: game.player2DeckField,
                    myEggDeck: game.player2EggDeck,
                    mySecurity: game.player2Security,
                    opponentHand: game.player1Hand,
                    opponentDeckField: game.player1DeckField,
                    opponentEggDeck: game.player1EggDeck,
                    opponentSecurity: game.player1Security,
                });
        }
    },

    getMyFieldAsString: () => {
        const updatedGame: OneSideDistribution = {
            playerReveal: get().myReveal,
            playerHand: get().myHand,
            playerDeckField: get().myDeckField,
            playerEggDeck: get().myEggDeck,
            playerTrash: get().myTrash,
            playerSecurity: get().mySecurity,
            playerDigi1: get().myDigi1,
            playerDigi2: get().myDigi2,
            playerDigi3: get().myDigi3,
            playerDigi4: get().myDigi4,
            playerDigi5: get().myDigi5,
            playerDigi6: get().myDigi6,
            playerDigi7: get().myDigi7,
            playerDigi8: get().myDigi8,
            playerDigi9: get().myDigi9,
            playerDigi10: get().myDigi10,
            playerDigi11: get().myDigi11,
            playerDigi12: get().myDigi12,
            playerDigi13: get().myDigi13,
            playerDigi14: get().myDigi14,
            playerDigi15: get().myDigi15,

            playerBreedingArea: get().myBreedingArea,
        };
        return JSON.stringify(updatedGame);
    },

    updateOpponentField: (field: OneSideDistribution) => {
        set ({
            opponentReveal: field.playerReveal,
            opponentHand: field.playerHand,
            opponentDeckField: field.playerDeckField,
            opponentEggDeck: field.playerEggDeck,
            opponentTrash: field.playerTrash,
            opponentSecurity: field.playerSecurity,
            opponentDigi1: field.playerDigi1,
            opponentDigi2: field.playerDigi2,
            opponentDigi3: field.playerDigi3,
            opponentDigi4: field.playerDigi4,
            opponentDigi5: field.playerDigi5,
            opponentDigi6: field.playerDigi6,
            opponentDigi7: field.playerDigi7,
            opponentDigi8: field.playerDigi8,
            opponentDigi9: field.playerDigi9,
            opponentDigi10: field.playerDigi10,
            opponentDigi11: field.playerDigi11,
            opponentDigi12: field.playerDigi12,
            opponentDigi13: field.playerDigi13,
            opponentDigi14: field.playerDigi14,
            opponentDigi15: field.playerDigi15,
            opponentBreedingArea: field.playerBreedingArea,
        });
    },

    moveCard: (cardId, from, to) => {

        if (!cardId || !from || !to) return;

        const fromState = get()[from as keyof State] as CardTypeGame[];
        const card = fromState.find(card => card.id === cardId);
        if (!card) return;
        const updatedFromState = fromState.filter(card => card.id !== cardId);

        const toState = get()[to as keyof State] as CardTypeGame[];

        if (toState.length > 0 && toState[toState.length - 1].isTilted) {
            toState[toState.length - 1].isTilted = false;
            card.isTilted = true;
        } else {
            card.isTilted = false;
        }

        if (from === to) {
            set({[from]: [...updatedFromState, card]});
            return;
        }

        if (get().mulliganAllowed && !opponentLocations.includes(from) && !opponentLocations.includes(to)) {
            set({mulliganAllowed: false});
        }

        if (destroyTokenLocations.includes(to) && card.uniqueCardNumber === "Token") {
            if (to !== "myTrash") playTrashCardSfx();
            set({[from]: updatedFromState});
            return;
        }

        const updatedToState = [...toState, card];
        set({
            [from]: updatedFromState,
            [to]: updatedToState
        });
    },

    sendCardToDeck: (topOrBottom, cardToSendToDeck, to) => {
        if (!get().opponentReady) return;

        const locationCards = get()[cardToSendToDeck.location as keyof State] as CardTypeGame[];
        const card = locationCards.find((card: CardTypeGame) => card.id === cardToSendToDeck.id);
        const updatedLocationCards = locationCards.filter((card: CardTypeGame) => card.id !== cardToSendToDeck.id);

        if (topOrBottom === "Top" && card) card.isTilted = false;

        if(cardToSendToDeck.location === to){
            set ({
                [cardToSendToDeck.location]: []
            });
            const timer1 = setTimeout(() => {
                set ({[to]: [card, ...updatedLocationCards]});
            }, 10);
            return () => clearTimeout(timer1);
        } else

        set(state => {
            const toDeck = state[to as keyof State] as CardTypeGame[];
            const updatedDeck = topOrBottom === "Top" ? [card, ...toDeck] : [...toDeck, card];
            return {
                [cardToSendToDeck.location]: updatedLocationCards,
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

    mulligan: () => {
        set(state => {
            const hand = state.myHand;
            const deck = state.myDeckField;
            const security = state.mySecurity;
            const updatedDeck = [...hand, ...deck, ...security];
            const cryptoArray = new Uint32Array(updatedDeck.length);
            crypto.getRandomValues(cryptoArray);
            for (let i = updatedDeck.length - 1; i > 0; i--) {
                const j = cryptoArray[i] % (i + 1);
                [updatedDeck[i], updatedDeck[j]] = [updatedDeck[j], updatedDeck[i]];
            }
            const updatedHand = updatedDeck.splice(0, 5);
            const updatedSecurity = updatedDeck.splice(0, 5);
            return {
                myHand: updatedHand,
                mySecurity: updatedSecurity,
                myDeckField: updatedDeck,
                mulliganAllowed: false
            }
        })
    },

    setMulliganAllowed: (mulliganAllowed: boolean) => {
        set({mulliganAllowed})
    },

    tiltCard: (cardId, location, playSuspendSfx, playUnsuspendSfx, sendSfx) => {
        set(state => {
            return {
                [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                    if (card.id === cardId) {
                        const isTilted = !card.isTilted;
                        card.isTilted = isTilted;
                        isTilted ? playUnsuspendSfx() : playSuspendSfx();
                        isTilted ? sendSfx("playUnsuspendCardSfx") : sendSfx("playSuspendCardSfx");
                    }
                    return card;
                })
            };
        });
    },

    setMessages: (message: string) => {
        set(state => {
            return {
                messages: [message, ...state.messages]
            }
        })
    },

    createToken: () => {
        if (!get().opponentReady) return;
        const token: CardTypeGame = {
            uniqueCardNumber: "Token",
            name: "Token",
            imgUrl: tokenImage,
            cardType: "Digimon",
            color: ["Unknown"],
            attribute: "Unknown",
            cardNumber: "",
            stage: undefined,
            digiType: undefined,
            dp: undefined,
            playCost: undefined,
            level: undefined,
            mainEffect: undefined,
            inheritedEffect: undefined,
            illustrator: "",
            restriction_en: "",
            restriction_jp: "",
            id: uid(),
            isTilted: false
        };
        set((state) => {
            for (let i = 1; i <= 10; i++) {
                const digiKey = `myDigi${i}` as keyof State;
                if (Array.isArray(state[digiKey] as CardTypeGame[]) && (state[digiKey] as CardTypeGame[]).length === 0) {
                    return {
                        [digiKey]: [token]
                    };
                }
            }
            return state;
        });
    },

    moveCardStack: (index, from, to, handleDropToField) => {
        const locationCards = get()[from as keyof State] as CardTypeGame[];
        const cards = locationCards.slice(0, index + 1);
        for (const card of cards) {
            handleDropToField(card.id, from, to, card.name);
        }
    }
}));
