import {create} from "zustand";
import {devtools, persist} from 'zustand/middleware'
import {
    AttackPhase,
    BoardState,
    BootStage, CardModifiers, CardType,
    CardTypeGame,
    GameDistribution,
    OneSideDistribution,
    Phase,
    Player,
    SendToStackFunction,
    Side
} from "../utils/types.ts";

const emptyPlayer: Player = {
    username: "",
    avatarName: "",
    sleeveName: "",
}

export type State = BoardState & {
    gameId: string,

    isLoading: boolean,
    cardIdWithEffect: string,
    cardIdWithTarget: string,

    /**
    * Id and location of a card that is going to be sent to security or egg-deck
     * Retrieve this to use also in {@link setModifiers}
     * Should be refactored.
     */
    cardToSend: {id: string, location: string},
    inheritCardInfo: string[],

    bootStage: BootStage,
    restartObject: { me: Player, opponent: Player },
    
    initialDistributionState: string;
    myAvatar: string,
    opponentAvatar: string,
    mySleeve: string,
    opponentSleeve: string,

    phase: Phase,
    isMyTurn: boolean,
    myAttackPhase: AttackPhase | false,
    opponentAttackPhase: AttackPhase | false,
    opponentGameState: string,

    messages: string[],
    setMessages: (message: string) => void,

    // --------------------------------------------------------

    mulligan: () => void,
    opponentReady: boolean,
    setOpponentReady: (ready: boolean) => void,

    setUpGame: (me: Player, opponent: Player) => void,
    clearBoard: () => void,
    distributeCards: (user: string, chunk: string, gameId: string, sendLoaded: () => void, playDrawCardSfx: () => void) => void,
    moveCard: (cardId: string, from: string, to: string) => void,
    getMyFieldAsString: () => string,
    updateOpponentField: (chunk: string, sendLoaded: () => void) => void,

    moveCardToStack: SendToStackFunction,
    setMemory: (memory: number) => void,
    setPhase: () => void,
    setTurn: (isMyTurn: boolean) => void,
    shuffleSecurity: () => void,
    tiltCard: (cardId: string,
               location: string,
               playSuspendSfx: () => void,
               playUnsuspendSfx: () => void) => void,
    createToken: (token: CardType, side: Side, id: string) => void,
    moveCardStack: (index: number, from: string, to: string,
                    handleDropToField: (id: string, from: string, to: string, name: string) => void) => void
    areCardsSuspended: (from?: string) => boolean,
    nextPhaseTrigger: (nextPhaseFunction: () => void, trigger?: string) => void,
    unsuspendAll: (side: Side) => void,
    getIsMyTurn: () => boolean,
    getMyAttackPhase: () => AttackPhase | false,
    getOpponentAttackPhase: () => AttackPhase | false,
    setMyAttackPhase: (phase: AttackPhase | false) => void,
    setOpponentAttackPhase: (phase: AttackPhase | false) => void,
    getOpponentReady: () => boolean,
    getDigimonNumber: (location: string) => string,
    getCardType: (location: string) => string,
    getPhase: () => Phase,
    setIsLoading: (isLoading: boolean) => void,
    setCardIdWithEffect: (cardId: string) => void,
    getIsCardEffect: (compareCardId: string) => boolean,
    setCardIdWithTarget: (cardId: string) => void,
    getIsCardTarget: (compareCardId: string) => boolean,
    setCardToSend: (cardId: string, location: string) => void,
    setBootStage: (phase: BootStage) => void,
    setRestartObject: (restartObject: { me: Player, opponent: Player }) => void,
    setGameId: (gameId: string) => void,
    setInheritCardInfo: (inheritedEffects: string[]) => void,
    setModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void,
    getCardLocationById: (id: string) => string,
};

const modifierLocations = ["myHand", "myDeckField", "myEggDeck", "myTrash"];

const resetModifierLocations = [...modifierLocations, "opponentHand", "opponentDeckField", "opponentEggDeck", "opponentTrash"]

const destroyTokenLocations = [...modifierLocations, "myTamer", "myDelay", "mySecurity", "myBreedingArea",
    "opponentHand", "opponentSecurity", "opponentDeckField", "opponentEggDeck", "opponentBreedingArea", "opponentTrash"];

const opponentLocations = ["opponentHand", "opponentSecurity", "opponentDeckField", "opponentEggDeck",
    "opponentBreedingArea", "opponentTrash", "opponentDigi1", "opponentDigi2", "opponentDigi3", "opponentDigi4",
    "opponentDigi5", "opponentDigi6", "opponentDigi7", "opponentDigi8", "opponentDigi9", "opponentDigi10",
    "opponentDigi11", "opponentDigi12", "opponentDigi13", "opponentDigi14", "opponentDigi15", "opponentReveal"];

export const useGame = create<State>()(
    devtools(
        persist(
            (set, get) => ({
    gameId: "",

    isLoading: false,
    cardIdWithEffect: "",
    cardIdWithTarget: "",
    cardToSend: {id: "", location: ""},
    inheritCardInfo: [],

    bootStage: BootStage.CLEAR,
    restartObject: { me: emptyPlayer, opponent: emptyPlayer },

    initialDistributionState: "",
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

    phase: Phase.BREEDING,
    isMyTurn: false,
    myAttackPhase: false,
    opponentAttackPhase: false,
    opponentGameState: "",

    messages: [],
    opponentReady: false,

    setOpponentReady: (ready) => set({opponentReady: ready}),

    setUpGame: (me, opponent) => {
        set({
            myAvatar: me.avatarName,
            opponentAvatar: opponent.avatarName,
            mySleeve: me.sleeveName,
            opponentSleeve: opponent.sleeveName,

            messages: [],
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
            phase: Phase.BREEDING,
            isMyTurn: false,
            restartObject: { me: emptyPlayer, opponent: emptyPlayer },
            opponentAttackPhase: false,
            myAttackPhase: false,
            opponentReady: false,
            isLoading: false,
            bootStage: BootStage.CLEAR,
            initialDistributionState: "",
            opponentGameState: "",
        });
    },

    distributeCards: (user, chunk, gameId, sendLoaded, playDrawCardSfx) => {

        set(state => ({ initialDistributionState: state.initialDistributionState + chunk }));

        if (chunk.length < 1000 || chunk.endsWith("false}]}")) {

            const player1 = gameId.split("‗")[0];
            const game: GameDistribution = JSON.parse(get().initialDistributionState);

            set({ initialDistributionState: "", bootStage: BootStage.MULLIGAN });

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
            sendLoaded();
            playDrawCardSfx();
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

            playerMemory: get().opponentMemory,
            playerPhase: get().phase,
            isPlayerTurn: !(get().isMyTurn),
        };
        return JSON.stringify(updatedGame);
    },

    updateOpponentField: (chunk, sendLoaded) => {
        set(state => {
            if (!state.isLoading) {
                return {
                    opponentGameState: chunk,
                    isLoading: true
                }
            }
            return {opponentGameState: state.opponentGameState + chunk}
        });

        if (chunk.length < 1000 || chunk.endsWith(":true}") || chunk.endsWith(":false}")) {

            const opponentGameJson: OneSideDistribution = JSON.parse(get().opponentGameState);

            set ({ opponentGameState: ""});

            set({
                opponentReveal: opponentGameJson.playerReveal,
                opponentHand: opponentGameJson.playerHand,
                opponentDeckField: opponentGameJson.playerDeckField,
                opponentEggDeck: opponentGameJson.playerEggDeck,
                opponentTrash: opponentGameJson.playerTrash,
                opponentSecurity: opponentGameJson.playerSecurity,
                opponentDigi1: opponentGameJson.playerDigi1,
                opponentDigi2: opponentGameJson.playerDigi2,
                opponentDigi3: opponentGameJson.playerDigi3,
                opponentDigi4: opponentGameJson.playerDigi4,
                opponentDigi5: opponentGameJson.playerDigi5,
                opponentDigi6: opponentGameJson.playerDigi6,
                opponentDigi7: opponentGameJson.playerDigi7,
                opponentDigi8: opponentGameJson.playerDigi8,
                opponentDigi9: opponentGameJson.playerDigi9,
                opponentDigi10: opponentGameJson.playerDigi10,
                opponentDigi11: opponentGameJson.playerDigi11,
                opponentDigi12: opponentGameJson.playerDigi12,
                opponentDigi13: opponentGameJson.playerDigi13,
                opponentDigi14: opponentGameJson.playerDigi14,
                opponentDigi15: opponentGameJson.playerDigi15,
                opponentBreedingArea: opponentGameJson.playerBreedingArea,

                myMemory: opponentGameJson.playerMemory,
                phase: opponentGameJson.playerPhase,
                isMyTurn: opponentGameJson.isPlayerTurn,

                isLoading: false
            });
        }
        sendLoaded();
    },

    moveCard: (cardId, from, to) => {

        if (!cardId || !from || !to) return;

        const fromState = get()[from as keyof State] as CardTypeGame[];
        const card = fromState.find(card => card.id === cardId);

        if (!card) return;
        if(resetModifierLocations.includes(to)) card.modifiers = {plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: card.color};
        if(card.inSecurityFaceUp) card.inSecurityFaceUp = false;

        const updatedFromState = fromState.filter(card => card.id !== cardId);

        const toState = get()[to as keyof State] as CardTypeGame[];

        if (toState.length > 0) {
            const prevTopCard = toState[toState.length - 1];

            if(prevTopCard.isTilted) {
                prevTopCard.isTilted = false;
                card.isTilted = true;
            } else card.isTilted = false;

            if(!card.modifiers.plusDp) {
                card.modifiers.plusDp = prevTopCard.modifiers.plusDp;
                prevTopCard.modifiers.plusDp = 0;
            } else prevTopCard.modifiers.plusDp = 0;

            if(!card.modifiers.plusSecurityAttacks){
                card.modifiers.plusSecurityAttacks = prevTopCard.modifiers.plusSecurityAttacks;
                prevTopCard.modifiers.plusSecurityAttacks = 0;
            } else prevTopCard.modifiers.plusSecurityAttacks = 0;

            if(!card.modifiers.keywords.length){
                card.modifiers.keywords = prevTopCard.modifiers.keywords;
                prevTopCard.modifiers.keywords = [];
            } else prevTopCard.modifiers.keywords = [];
        }

        if (from === to) {
            set({[from]: [...updatedFromState, card]});
            return;
        }

        if (get().bootStage === BootStage.MULLIGAN && !opponentLocations.includes(from) && !opponentLocations.includes(to)) {
            set({bootStage: BootStage.GAME_IN_PROGRESS});
        }

        if (destroyTokenLocations.includes(to) && card.id.startsWith("TOKEN")) {
            set({[from]: updatedFromState});
            return;
        }

        const updatedToState = [...toState, card];
        set({
            [from]: updatedFromState,
            [to]: updatedToState
        });
    },

    moveCardToStack: (topOrBottom, cardId, cardLocation, to, sendFaceUp) => {
        if (!get().opponentReady) return;

        const locationCards = get()[cardLocation as keyof State] as CardTypeGame[];
        const card = locationCards.find((card: CardTypeGame) => card.id === cardId);

        if (!card) return;

        const updatedLocationCards = locationCards.filter((card: CardTypeGame) => card.id !== cardId);

        if (!["mySecurity", "opponentSecurity"].includes(to) && card.inSecurityFaceUp) card.inSecurityFaceUp = false;

        if (topOrBottom === "Top") card.isTilted = false;
        if (resetModifierLocations.includes(to) && card) card.modifiers = {plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: card.color};

        if (cardLocation === to) {
            set({
                [cardLocation]: []
            });
            const timer1 = setTimeout(() => {
                set({[to]: [card, ...updatedLocationCards]});
            }, 10);
            return () => clearTimeout(timer1);
        } else

            set(state => {
                const toStack = state[to as keyof State] as CardTypeGame[];
                const newCard = sendFaceUp ? {...card, inSecurityFaceUp: true} : card;
                const updatedDeck = topOrBottom === "Top" ? [newCard, ...toStack] : [...toStack, newCard];
                return {
                    [cardLocation]: updatedLocationCards,
                    [to]: updatedDeck
                }
            })
    },

    setMemory: (memory: number) => set({ myMemory: memory, opponentMemory: -memory } ),

    setPhase: () => {
        const phase = get().phase;
        switch (phase) {
            case Phase.UNSUSPEND:
                set({phase: Phase.DRAW});
                return;
            case Phase.DRAW:
                set({phase: Phase.BREEDING});
                return;
            case Phase.BREEDING:
                set({phase: Phase.MAIN});
                return;
            case Phase.MAIN:
                set({phase: Phase.UNSUSPEND});
                return;
        }
    },

    setTurn: (isMyTurn: boolean) => set({isMyTurn}),

    shuffleSecurity: () => {
        set(state => {
            const security = state.mySecurity;
            const cryptoArray = new Uint32Array(security.length);
            crypto.getRandomValues(cryptoArray);

            for (const card of security) {
                if(card.inSecurityFaceUp) card.inSecurityFaceUp = false;
            }
            for (let i = security.length - 1; i > 0; i--) {
                const j = cryptoArray[i] % (i + 1);
                [security[i], security[j]] = [security[j], security[i]];
            }
            return {
                mySecurity: security,
                isLoading: true
            }
        });
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
                bootStage: BootStage.GAME_IN_PROGRESS,
                isLoading: true // will be set false in distributeCards
            }
        });
    },

    tiltCard: (cardId, location, playSuspendSfx, playUnsuspendSfx) => {
        set(state => {
            return {
                [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                    if (card.id === cardId) {
                        const isTilted = card.isTilted;
                        card.isTilted = !isTilted;
                        isTilted ? playUnsuspendSfx() : playSuspendSfx();
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

    createToken: (tokenVariant, side, id) => {
        if (!get().opponentReady) return;
        const token: CardTypeGame = {
            ...tokenVariant,
            id: id,
            isTilted: false,
            modifiers: { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: tokenVariant.color}
        };
        set((state) => {
            for (let i = 1; i <= 10; i++) {
                const digiKey = `${side}Digi${i}` as keyof State;
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
    },

    areCardsSuspended: (from) => {
        if (from) return (get()[from as keyof State] as CardTypeGame[]).some(card => card.isTilted)

        return get().myDigi1.some(card => card.isTilted)
            || get().myDigi2.some(card => card.isTilted) || get().myDigi3.some(card => card.isTilted)
            || get().myDigi4.some(card => card.isTilted) || get().myDigi5.some(card => card.isTilted)
            || get().myDigi6.some(card => card.isTilted) || get().myDigi7.some(card => card.isTilted)
            || get().myDigi8.some(card => card.isTilted) || get().myDigi9.some(card => card.isTilted)
            || get().myDigi10.some(card => card.isTilted) || get().myDigi11.some(card => card.isTilted)
            || get().myDigi12.some(card => card.isTilted) || get().myDigi13.some(card => card.isTilted)
            || get().myDigi14.some(card => card.isTilted) || get().myDigi15.some(card => card.isTilted)
    },

    nextPhaseTrigger: (nextPhaseFunction, trigger) => {
        if (get().phase === Phase.MAIN || !get().isMyTurn) return;

        if ((get().phase === Phase.BREEDING && trigger === Phase.BREEDING)
            || (get().phase === Phase.DRAW && trigger === Phase.DRAW)
            || (get().phase === Phase.UNSUSPEND && !get().areCardsSuspended())) {
            nextPhaseFunction();
        }
    },

    unsuspendAll: (side) => {
        for (let i = 1; i <= 15; i++) {
            set((state) => {
                const digiKey = `${side}Digi${i}` as keyof State;
                return {
                    [digiKey]: (state[digiKey] as CardTypeGame[]).map(card => {
                        card.isTilted = false;
                        return card;
                    })
                };
            });
        }
    },

    getIsMyTurn: () => get().isMyTurn,

    getMyAttackPhase: () => get().myAttackPhase,

    getOpponentAttackPhase: () => get().opponentAttackPhase,

    setMyAttackPhase: (phase) => set({myAttackPhase: phase}),

    setOpponentAttackPhase: (phase) => set({opponentAttackPhase: phase}),

    getOpponentReady: () => get().opponentReady,

    getDigimonNumber: (location) => {
        const locationState = (get()[location as keyof State] as CardTypeGame[]);
        return locationState[locationState.length -1].cardNumber;
    },

    getCardType: (location) => {
        const locationState = (get()[location as keyof State] as CardTypeGame[]);
        return locationState[locationState.length -1].cardType;
    },

    getPhase: () => get().phase,

    setIsLoading: (isLoading) => set({isLoading}),

    setCardIdWithEffect: (cardIdWithEffect) => set({cardIdWithEffect}),

    getIsCardEffect: (compareCardId) => compareCardId === get().cardIdWithEffect,

    setCardIdWithTarget: (cardIdWithTarget) => set({cardIdWithTarget}),

    getIsCardTarget: (compareCardId) => compareCardId === get().cardIdWithTarget,

    setCardToSend: (id, location) => set({cardToSend: {id, location}}),

    setBootStage: (stage) => set({bootStage: stage}),

    setRestartObject: (restartObject) => set({restartObject}),

    setGameId: (gameId) => set({gameId}),

    setInheritCardInfo: (inheritedEffects) => set({ inheritCardInfo: inheritedEffects }),

    getCardLocationById: (cardId) => {
        if (!cardId) return "";
        const state = get();
        for (const key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const locationState = (state[key as keyof State] as CardTypeGame[]);
                if (Array.isArray(locationState) && locationState.length && locationState.find(card => card?.id === cardId)) {
                    return key;
                }
            }
        }
        return "";
    },

    setModifiers: (cardId, location, modifiers) => {
        set(state => {
            return {
                [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                    if (card.id === cardId) card.modifiers = modifiers;
                    return card;
                })
            };
        });
    },

            }),
            { name: 'bearStore' },
        ),
    ),
)
