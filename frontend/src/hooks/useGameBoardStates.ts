import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
    AttackPhase,
    BoardState,
    BootStage,
    CardModifiers,
    CardType,
    CardTypeGame,
    Phase,
    Player,
    SendToStackFunction,
    SIDE,
} from "../utils/types.ts";

const emptyPlayer: Player = {
    username: "",
    avatarName: "",
    sleeveName: "",
};

const battleAreaLocations = [
    "myDigi1",
    "myDigi2",
    "myDigi3",
    "myDigi4",
    "myDigi5",
    "myDigi6",
    "myDigi7",
    "myDigi8",
    "myDigi9",
    "myDigi10",
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "myDigi14",
    "myDigi15",
    "myDigi16",
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentDigi14",
    "opponentDigi15",
    "opponentDigi16",
];

export const digimonLocations = ["myBreedingArea", "opponentBreedingArea", ...battleAreaLocations];

const tamerLocations = [
    "myDigi17",
    "myDigi18",
    "myDigi19",
    "myDigi20",
    "myDigi21",
    "opponentDigi17",
    "opponentDigi18",
    "opponentDigi19",
    "opponentDigi20",
    "opponentDigi21",
];

const opponentLinkLocations = [
    "opponentLink1",
    "opponentLink2",
    "opponentLink3",
    "opponentLink4",
    "opponentLink5",
    "opponentLink6",
    "opponentLink7",
    "opponentLink8",
    "opponentLink9",
    "opponentLink10",
    "opponentLink11",
    "opponentLink12",
    "opponentLink13",
    "opponentLink14",
    "opponentLink15",
    "opponentLink16",
];

type GameDistribution = {
    player1Hand: CardTypeGame[];
    player1DeckField: CardTypeGame[];
    player1EggDeck: CardTypeGame[];
    player1Trash?: CardTypeGame[];
    player1Security: CardTypeGame[];

    player1Digi1?: CardTypeGame[];
    player1Digi2?: CardTypeGame[];
    player1Digi3?: CardTypeGame[];
    player1Digi4?: CardTypeGame[];
    player1Digi5?: CardTypeGame[];
    player1Digi6?: CardTypeGame[];
    player1Digi7?: CardTypeGame[];
    player1Digi8?: CardTypeGame[];
    player1Digi9?: CardTypeGame[];
    player1Digi10?: CardTypeGame[];
    player1Digi11?: CardTypeGame[];
    player1Digi12?: CardTypeGame[];
    player1Digi13?: CardTypeGame[];
    player1Digi14?: CardTypeGame[];
    player1Digi15?: CardTypeGame[];
    player1Digi16?: CardTypeGame[];
    player1Digi17?: CardTypeGame[];
    player1Digi18?: CardTypeGame[];
    player1Digi19?: CardTypeGame[];
    player1Digi20?: CardTypeGame[];
    player1Digi21?: CardTypeGame[];

    player1BreedingArea?: CardTypeGame[];

    player1Link1?: CardTypeGame[];
    player1Link2?: CardTypeGame[];
    player1Link3?: CardTypeGame[];
    player1Link4?: CardTypeGame[];
    player1Link5?: CardTypeGame[];
    player1Link6?: CardTypeGame[];
    player1Link7?: CardTypeGame[];
    player1Link8?: CardTypeGame[];
    player1Link9?: CardTypeGame[];
    player1Link10?: CardTypeGame[];
    player1Link11?: CardTypeGame[];
    player1Link12?: CardTypeGame[];
    player1Link13?: CardTypeGame[];
    player1Link14?: CardTypeGame[];
    player1Link15?: CardTypeGame[];
    player1Link16?: CardTypeGame[];

    player2Hand: CardTypeGame[];
    player2DeckField: CardTypeGame[];
    player2EggDeck: CardTypeGame[];
    player2Trash?: CardTypeGame[];
    player2Security: CardTypeGame[];

    player2Digi1?: CardTypeGame[];
    player2Digi2?: CardTypeGame[];
    player2Digi3?: CardTypeGame[];
    player2Digi4?: CardTypeGame[];
    player2Digi5?: CardTypeGame[];
    player2Digi6?: CardTypeGame[];
    player2Digi7?: CardTypeGame[];
    player2Digi8?: CardTypeGame[];
    player2Digi9?: CardTypeGame[];
    player2Digi10?: CardTypeGame[];
    player2Digi11?: CardTypeGame[];
    player2Digi12?: CardTypeGame[];
    player2Digi13?: CardTypeGame[];
    player2Digi14?: CardTypeGame[];
    player2Digi15?: CardTypeGame[];
    player2Digi16?: CardTypeGame[];
    player2Digi17?: CardTypeGame[];
    player2Digi18?: CardTypeGame[];
    player2Digi19?: CardTypeGame[];
    player2Digi20?: CardTypeGame[];
    player2Digi21?: CardTypeGame[];
    player2BreedingArea?: CardTypeGame[];

    player2Link1?: CardTypeGame[];
    player2Link2?: CardTypeGame[];
    player2Link3?: CardTypeGame[];
    player2Link4?: CardTypeGame[];
    player2Link5?: CardTypeGame[];
    player2Link6?: CardTypeGame[];
    player2Link7?: CardTypeGame[];
    player2Link8?: CardTypeGame[];
    player2Link9?: CardTypeGame[];
    player2Link10?: CardTypeGame[];
    player2Link11?: CardTypeGame[];
    player2Link12?: CardTypeGame[];
    player2Link13?: CardTypeGame[];
    player2Link14?: CardTypeGame[];
    player2Link15?: CardTypeGame[];
    player2Link16?: CardTypeGame[];
};

type UpdateDistribution = GameDistribution & {
    player1Reveal?: CardTypeGame[];
    player2Reveal?: CardTypeGame[];
    playerMemory?: number;
    playerPhase?: Phase;
    isPlayerTurn?: boolean;
};

export type State = BoardState & {
    gameId: string;

    isLoading: boolean;
    cardIdWithEffect: string;
    cardIdWithTarget: string;
    isHandHidden: boolean;

    /**
     * Id and location of a card that is going to be sent to security or egg-deck
     * Retrieve this to use also in {@link setModifiers}
     * Should be refactored.
     */
    cardToSend: { id: string; location: string };
    inheritCardInfo: string[];
    linkCardInfo: { dp: number; effect: string }[];
    setLinkCardInfo: (linkCardInfo: { dp: number; effect: string }[]) => void;
    getLinkCardsForLocation: (location: string) => CardTypeGame[];

    bootStage: BootStage;
    restartObject: { me: Player; opponent: Player };

    initialDistributionState: string;
    myAvatar: string;
    opponentAvatar: string;
    mySleeve: string;
    opponentSleeve: string;

    phase: Phase;
    isMyTurn: boolean;
    myAttackPhase: AttackPhase | false;
    opponentAttackPhase: AttackPhase | false;
    savedGameStateChunks: string;

    messages: string[];
    setMessages: (message: string) => void;
    stackSliceIndex: number;
    isOpponentOnline: boolean;
    startingPlayer: string;

    // --------------------------------------------------------

    mulligan: () => void;
    opponentReady: boolean;
    setOpponentReady: (ready: boolean) => void;

    setUpGame: (me: Player, opponent: Player) => void;
    clearBoard: () => void;
    distributeCards: (
        user: string,
        chunk: string,
        gameId: string,
        sendLoaded: () => void,
        playDrawCardSfx: () => void
    ) => void;
    moveCard: (cardId: string, from: string, to: string, facing?: "down" | "up") => void;
    getUpdateDistributionString: (user: string, gameId: string) => string;
    updateFields: (chunk: string, sendLoaded: () => void, user: string, gameId: string) => void;

    moveCardToStack: SendToStackFunction;
    setMemory: (memory: number) => void;
    setPhase: () => void;
    setTurn: (isMyTurn: boolean) => void;
    shuffleSecurity: () => void;
    tiltCard: (cardId: string, location: string, playSuspendSfx: () => void, playUnsuspendSfx: () => void) => void;
    createToken: (token: CardType, side: SIDE, id: string) => void;
    moveCardStack: (
        index: number,
        from: string,
        to: string,
        handleDropToField: (id: string, from: string, to: string, name: string, isFaceUp: boolean) => void
    ) => void;
    areCardsSuspended: (from?: string) => boolean;
    nextPhaseTrigger: (nextPhaseFunction: () => void, currentPhase?: string) => void;
    unsuspendAll: (side: SIDE) => void;
    getIsMyTurn: () => boolean;
    getMyAttackPhase: () => AttackPhase | false;
    getOpponentAttackPhase: () => AttackPhase | false;
    setMyAttackPhase: (phase: AttackPhase | false) => void;
    setOpponentAttackPhase: (phase: AttackPhase | false) => void;
    getOpponentReady: () => boolean;
    getDigimonNumber: (location: string) => string;
    getCardType: (location: string) => string;
    getPhase: () => Phase;
    setIsLoading: (isLoading: boolean) => void;
    setCardIdWithEffect: (cardId: string) => void;
    getIsCardEffect: (compareCardId: string) => boolean;
    setCardIdWithTarget: (cardId: string) => void;
    getIsCardTarget: (compareCardId: string) => boolean;
    setCardToSend: (cardId: string, location: string) => void;
    setBootStage: (phase: BootStage) => void;
    setRestartObject: (restartObject: { me: Player; opponent: Player }) => void;
    setGameId: (gameId: string) => void;
    setInheritCardInfo: (inheritedEffects: string[]) => void;
    setModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void;
    getCardLocationById: (id: string) => string;
    toggleIsHandHidden: () => void;
    setStackSliceIndex: (index: number) => void;
    setIsOpponentOnline: (isOpponentOnline: boolean) => void;
    setStartingPlayer: (side: SIDE | "") => void;

    flipCard: (cardId: string, location: string) => void;

    isReconnecting: boolean;
    setIsReconnecting: (isReconnecting: boolean) => void;
};

const modifierLocations = ["myHand", "myDeckField", "myEggDeck", "myTrash"];

const resetModifierLocations = [
    ...modifierLocations,
    "opponentHand",
    "opponentDeckField",
    "opponentEggDeck",
    "opponentTrash",
];

const destroyTokenLocations = [
    ...modifierLocations,
    "myTamer",
    "myDelay",
    "mySecurity",
    "myBreedingArea",
    "opponentHand",
    "opponentSecurity",
    "opponentDeckField",
    "opponentEggDeck",
    "opponentBreedingArea",
    "opponentTrash",
];

const opponentLocations = [
    ...opponentLinkLocations,
    "opponentHand",
    "opponentSecurity",
    "opponentDeckField",
    "opponentEggDeck",
    "opponentBreedingArea",
    "opponentTrash",
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentReveal",
];

const fieldDefaultValues = {
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
    myDigi16: [],
    myDigi17: [],
    myDigi18: [],
    myDigi19: [],
    myDigi20: [],
    myDigi21: [],
    myBreedingArea: [],

    myLink1: [],
    myLink2: [],
    myLink3: [],
    myLink4: [],
    myLink5: [],
    myLink6: [],
    myLink7: [],
    myLink8: [],
    myLink9: [],
    myLink10: [],
    myLink11: [],
    myLink12: [],
    myLink13: [],
    myLink14: [],
    myLink15: [],
    myLink16: [],

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
    opponentDigi16: [],
    opponentDigi17: [],
    opponentDigi18: [],
    opponentDigi19: [],
    opponentDigi20: [],
    opponentDigi21: [],
    opponentBreedingArea: [],

    opponentLink1: [],
    opponentLink2: [],
    opponentLink3: [],
    opponentLink4: [],
    opponentLink5: [],
    opponentLink6: [],
    opponentLink7: [],
    opponentLink8: [],
    opponentLink9: [],
    opponentLink10: [],
    opponentLink11: [],
    opponentLink12: [],
    opponentLink13: [],
    opponentLink14: [],
    opponentLink15: [],
    opponentLink16: [],
};

export const useGameBoardStates = create<State>()(
    devtools(
        persist(
            (set, get) => ({
                gameId: "",

                isLoading: false,
                cardIdWithEffect: "",
                cardIdWithTarget: "",
                isHandHidden: false,
                cardToSend: { id: "", location: "" },
                inheritCardInfo: [],
                linkCardInfo: [],

                isReconnecting: false,
                setIsReconnecting: (isReconnecting: boolean) => set({ isReconnecting }),

                bootStage: BootStage.CLEAR,
                restartObject: { me: emptyPlayer, opponent: emptyPlayer },

                initialDistributionState: "",
                myAvatar: "",
                opponentAvatar: "",
                mySleeve: "",
                opponentSleeve: "",

                ...fieldDefaultValues,
                myMemory: 0,
                opponentMemory: 0,

                phase: Phase.BREEDING,
                isMyTurn: false,
                myAttackPhase: false,
                opponentAttackPhase: false,
                savedGameStateChunks: "",

                messages: [],
                opponentReady: false,
                stackSliceIndex: 0,
                isOpponentOnline: true,
                startingPlayer: "",

                setOpponentReady: (ready) => set({ opponentReady: ready }),

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
                        ...fieldDefaultValues,
                        myMemory: 0,
                        opponentMemory: 0,
                        phase: Phase.BREEDING,
                        isMyTurn: false,
                        restartObject: { me: emptyPlayer, opponent: emptyPlayer },
                        opponentAttackPhase: false,
                        myAttackPhase: false,
                        opponentReady: false,
                        isLoading: false,
                        bootStage: BootStage.CLEAR,
                        initialDistributionState: "",
                        savedGameStateChunks: "",
                        isOpponentOnline: true,
                    });
                },

                distributeCards: (user, chunk, gameId, sendLoaded, playDrawCardSfx) => {
                    set((state) => ({ initialDistributionState: state.initialDistributionState + chunk }));

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

                getUpdateDistributionString: (user, gameId) => {
                    const isPlayer1 = gameId.split("‗")[0] === user;
                    const updatedGame: UpdateDistribution = {
                        player1Reveal: isPlayer1 ? get().myReveal : get().opponentReveal,
                        player1Hand: isPlayer1 ? get().myHand : get().opponentHand,
                        player1DeckField: isPlayer1 ? get().myDeckField : get().opponentDeckField,
                        player1EggDeck: isPlayer1 ? get().myEggDeck : get().opponentEggDeck,
                        player1Trash: isPlayer1 ? get().myTrash : get().opponentTrash,
                        player1Security: isPlayer1 ? get().mySecurity : get().opponentSecurity,
                        player1Digi1: isPlayer1 ? get().myDigi1 : get().opponentDigi1,
                        player1Digi2: isPlayer1 ? get().myDigi2 : get().opponentDigi2,
                        player1Digi3: isPlayer1 ? get().myDigi3 : get().opponentDigi3,
                        player1Digi4: isPlayer1 ? get().myDigi4 : get().opponentDigi4,
                        player1Digi5: isPlayer1 ? get().myDigi5 : get().opponentDigi5,
                        player1Digi6: isPlayer1 ? get().myDigi6 : get().opponentDigi6,
                        player1Digi7: isPlayer1 ? get().myDigi7 : get().opponentDigi7,
                        player1Digi8: isPlayer1 ? get().myDigi8 : get().opponentDigi8,
                        player1Digi9: isPlayer1 ? get().myDigi9 : get().opponentDigi9,
                        player1Digi10: isPlayer1 ? get().myDigi10 : get().opponentDigi10,
                        player1Digi11: isPlayer1 ? get().myDigi11 : get().opponentDigi11,
                        player1Digi12: isPlayer1 ? get().myDigi12 : get().opponentDigi12,
                        player1Digi13: isPlayer1 ? get().myDigi13 : get().opponentDigi13,
                        player1Digi14: isPlayer1 ? get().myDigi14 : get().opponentDigi14,
                        player1Digi15: isPlayer1 ? get().myDigi15 : get().opponentDigi15,
                        player1Digi16: isPlayer1 ? get().myDigi16 : get().opponentDigi16,
                        player1Digi17: isPlayer1 ? get().myDigi17 : get().opponentDigi17,
                        player1Digi18: isPlayer1 ? get().myDigi18 : get().opponentDigi18,
                        player1Digi19: isPlayer1 ? get().myDigi19 : get().opponentDigi19,
                        player1Digi20: isPlayer1 ? get().myDigi20 : get().opponentDigi20,
                        player1Digi21: isPlayer1 ? get().myDigi21 : get().opponentDigi21,
                        player1BreedingArea: isPlayer1 ? get().myBreedingArea : get().opponentBreedingArea,
                        player1Link1: isPlayer1 ? get().myLink1 : get().opponentLink1,
                        player1Link2: isPlayer1 ? get().myLink2 : get().opponentLink2,
                        player1Link3: isPlayer1 ? get().myLink3 : get().opponentLink3,
                        player1Link4: isPlayer1 ? get().myLink4 : get().opponentLink4,
                        player1Link5: isPlayer1 ? get().myLink5 : get().opponentLink5,
                        player1Link6: isPlayer1 ? get().myLink6 : get().opponentLink6,
                        player1Link7: isPlayer1 ? get().myLink7 : get().opponentLink7,
                        player1Link8: isPlayer1 ? get().myLink8 : get().opponentLink8,
                        player1Link9: isPlayer1 ? get().myLink9 : get().opponentLink9,
                        player1Link10: isPlayer1 ? get().myLink10 : get().opponentLink10,
                        player1Link11: isPlayer1 ? get().myLink11 : get().opponentLink11,
                        player1Link12: isPlayer1 ? get().myLink12 : get().opponentLink12,
                        player1Link13: isPlayer1 ? get().myLink13 : get().opponentLink13,
                        player1Link14: isPlayer1 ? get().myLink14 : get().opponentLink14,
                        player1Link15: isPlayer1 ? get().myLink15 : get().opponentLink15,
                        player1Link16: isPlayer1 ? get().myLink16 : get().opponentLink16,

                        player2Reveal: isPlayer1 ? get().opponentReveal : get().myReveal,
                        player2Hand: isPlayer1 ? get().opponentHand : get().myHand,
                        player2DeckField: isPlayer1 ? get().opponentDeckField : get().myDeckField,
                        player2EggDeck: isPlayer1 ? get().opponentEggDeck : get().myEggDeck,
                        player2Trash: isPlayer1 ? get().opponentTrash : get().myTrash,
                        player2Security: isPlayer1 ? get().opponentSecurity : get().mySecurity,
                        player2Digi1: isPlayer1 ? get().opponentDigi1 : get().myDigi1,
                        player2Digi2: isPlayer1 ? get().opponentDigi2 : get().myDigi2,
                        player2Digi3: isPlayer1 ? get().opponentDigi3 : get().myDigi3,
                        player2Digi4: isPlayer1 ? get().opponentDigi4 : get().myDigi4,
                        player2Digi5: isPlayer1 ? get().opponentDigi5 : get().myDigi5,
                        player2Digi6: isPlayer1 ? get().opponentDigi6 : get().myDigi6,
                        player2Digi7: isPlayer1 ? get().opponentDigi7 : get().myDigi7,
                        player2Digi8: isPlayer1 ? get().opponentDigi8 : get().myDigi8,
                        player2Digi9: isPlayer1 ? get().opponentDigi9 : get().myDigi9,
                        player2Digi10: isPlayer1 ? get().opponentDigi10 : get().myDigi10,
                        player2Digi11: isPlayer1 ? get().opponentDigi11 : get().myDigi11,
                        player2Digi12: isPlayer1 ? get().opponentDigi12 : get().myDigi12,
                        player2Digi13: isPlayer1 ? get().opponentDigi13 : get().myDigi13,
                        player2Digi14: isPlayer1 ? get().opponentDigi14 : get().myDigi14,
                        player2Digi15: isPlayer1 ? get().opponentDigi15 : get().myDigi15,
                        player2Digi16: isPlayer1 ? get().opponentDigi16 : get().myDigi16,
                        player2Digi17: isPlayer1 ? get().opponentDigi17 : get().myDigi17,
                        player2Digi18: isPlayer1 ? get().opponentDigi18 : get().myDigi18,
                        player2Digi19: isPlayer1 ? get().opponentDigi19 : get().myDigi19,
                        player2Digi20: isPlayer1 ? get().opponentDigi20 : get().myDigi20,
                        player2Digi21: isPlayer1 ? get().opponentDigi21 : get().myDigi21,
                        player2BreedingArea: isPlayer1 ? get().opponentBreedingArea : get().myBreedingArea,
                        player2Link1: isPlayer1 ? get().opponentLink1 : get().myLink1,
                        player2Link2: isPlayer1 ? get().opponentLink2 : get().myLink2,
                        player2Link3: isPlayer1 ? get().opponentLink3 : get().myLink3,
                        player2Link4: isPlayer1 ? get().opponentLink4 : get().myLink4,
                        player2Link5: isPlayer1 ? get().opponentLink5 : get().myLink5,
                        player2Link6: isPlayer1 ? get().opponentLink6 : get().myLink6,
                        player2Link7: isPlayer1 ? get().opponentLink7 : get().myLink7,
                        player2Link8: isPlayer1 ? get().opponentLink8 : get().myLink8,
                        player2Link9: isPlayer1 ? get().opponentLink9 : get().myLink9,
                        player2Link10: isPlayer1 ? get().opponentLink10 : get().myLink10,
                        player2Link11: isPlayer1 ? get().opponentLink11 : get().myLink11,
                        player2Link12: isPlayer1 ? get().opponentLink12 : get().myLink12,
                        player2Link13: isPlayer1 ? get().opponentLink13 : get().myLink13,
                        player2Link14: isPlayer1 ? get().opponentLink14 : get().myLink14,
                        player2Link15: isPlayer1 ? get().opponentLink15 : get().myLink15,
                        player2Link16: isPlayer1 ? get().opponentLink16 : get().myLink16,

                        playerMemory: get().opponentMemory,
                        playerPhase: get().phase,
                        isPlayerTurn: !get().isMyTurn,
                    };
                    return JSON.stringify(updatedGame);
                },

                updateFields: (chunk, sendLoaded, user, gameId) => {
                    const isPlayer1 = gameId.split("‗")[0] === user;

                    set((state) => {
                        if (!state.isLoading) {
                            return {
                                savedGameStateChunks: chunk,
                                isLoading: true,
                            };
                        }
                        return { savedGameStateChunks: state.savedGameStateChunks + chunk };
                    });

                    if (chunk.length < 1000 || chunk.endsWith(":true}") || chunk.endsWith(":false}")) {
                        const gameJson: UpdateDistribution = JSON.parse(get().savedGameStateChunks);

                        set({ savedGameStateChunks: "" });

                        set({
                            opponentReveal: isPlayer1 ? gameJson.player2Reveal : gameJson.player1Reveal,
                            opponentHand: isPlayer1 ? gameJson.player2Hand : gameJson.player1Hand,
                            opponentDeckField: isPlayer1 ? gameJson.player2DeckField : gameJson.player1DeckField,
                            opponentEggDeck: isPlayer1 ? gameJson.player2EggDeck : gameJson.player1EggDeck,
                            opponentTrash: isPlayer1 ? gameJson.player2Trash : gameJson.player1Trash,
                            opponentSecurity: isPlayer1 ? gameJson.player2Security : gameJson.player1Security,
                            opponentDigi1: isPlayer1 ? gameJson.player2Digi1 : gameJson.player1Digi1,
                            opponentDigi2: isPlayer1 ? gameJson.player2Digi2 : gameJson.player1Digi2,
                            opponentDigi3: isPlayer1 ? gameJson.player2Digi3 : gameJson.player1Digi3,
                            opponentDigi4: isPlayer1 ? gameJson.player2Digi4 : gameJson.player1Digi4,
                            opponentDigi5: isPlayer1 ? gameJson.player2Digi5 : gameJson.player1Digi5,
                            opponentDigi6: isPlayer1 ? gameJson.player2Digi6 : gameJson.player1Digi6,
                            opponentDigi7: isPlayer1 ? gameJson.player2Digi7 : gameJson.player1Digi7,
                            opponentDigi8: isPlayer1 ? gameJson.player2Digi8 : gameJson.player1Digi8,
                            opponentDigi9: isPlayer1 ? gameJson.player2Digi9 : gameJson.player1Digi9,
                            opponentDigi10: isPlayer1 ? gameJson.player2Digi10 : gameJson.player1Digi10,
                            opponentDigi11: isPlayer1 ? gameJson.player2Digi11 : gameJson.player1Digi11,
                            opponentDigi12: isPlayer1 ? gameJson.player2Digi12 : gameJson.player1Digi12,
                            opponentDigi13: isPlayer1 ? gameJson.player2Digi13 : gameJson.player1Digi13,
                            opponentDigi14: isPlayer1 ? gameJson.player2Digi14 : gameJson.player1Digi14,
                            opponentDigi15: isPlayer1 ? gameJson.player2Digi15 : gameJson.player1Digi15,
                            opponentDigi16: isPlayer1 ? gameJson.player2Digi16 : gameJson.player1Digi16,
                            opponentDigi17: isPlayer1 ? gameJson.player2Digi17 : gameJson.player1Digi17,
                            opponentDigi18: isPlayer1 ? gameJson.player2Digi18 : gameJson.player1Digi18,
                            opponentDigi19: isPlayer1 ? gameJson.player2Digi19 : gameJson.player1Digi19,
                            opponentDigi20: isPlayer1 ? gameJson.player2Digi20 : gameJson.player1Digi20,
                            opponentDigi21: isPlayer1 ? gameJson.player2Digi21 : gameJson.player1Digi21,
                            opponentBreedingArea: isPlayer1
                                ? gameJson.player2BreedingArea
                                : gameJson.player1BreedingArea,
                            opponentLink1: isPlayer1 ? gameJson.player2Link1 : gameJson.player1Link1,
                            opponentLink2: isPlayer1 ? gameJson.player2Link2 : gameJson.player1Link2,
                            opponentLink3: isPlayer1 ? gameJson.player2Link3 : gameJson.player1Link3,
                            opponentLink4: isPlayer1 ? gameJson.player2Link4 : gameJson.player1Link4,
                            opponentLink5: isPlayer1 ? gameJson.player2Link5 : gameJson.player1Link5,
                            opponentLink6: isPlayer1 ? gameJson.player2Link6 : gameJson.player1Link6,
                            opponentLink7: isPlayer1 ? gameJson.player2Link7 : gameJson.player1Link7,
                            opponentLink8: isPlayer1 ? gameJson.player2Link8 : gameJson.player1Link8,
                            opponentLink9: isPlayer1 ? gameJson.player2Link9 : gameJson.player1Link9,
                            opponentLink10: isPlayer1 ? gameJson.player2Link10 : gameJson.player1Link10,
                            opponentLink11: isPlayer1 ? gameJson.player2Link11 : gameJson.player1Link11,
                            opponentLink12: isPlayer1 ? gameJson.player2Link12 : gameJson.player1Link12,
                            opponentLink13: isPlayer1 ? gameJson.player2Link13 : gameJson.player1Link13,
                            opponentLink14: isPlayer1 ? gameJson.player2Link14 : gameJson.player1Link14,
                            opponentLink15: isPlayer1 ? gameJson.player2Link15 : gameJson.player1Link15,
                            opponentLink16: isPlayer1 ? gameJson.player2Link16 : gameJson.player1Link16,

                            myReveal: isPlayer1 ? gameJson.player1Reveal : gameJson.player2Reveal,
                            myHand: isPlayer1 ? gameJson.player1Hand : gameJson.player2Hand,
                            myDeckField: isPlayer1 ? gameJson.player1DeckField : gameJson.player2DeckField,
                            myEggDeck: isPlayer1 ? gameJson.player1EggDeck : gameJson.player2EggDeck,
                            myTrash: isPlayer1 ? gameJson.player1Trash : gameJson.player2Trash,
                            mySecurity: isPlayer1 ? gameJson.player1Security : gameJson.player2Security,
                            myDigi1: isPlayer1 ? gameJson.player1Digi1 : gameJson.player2Digi1,
                            myDigi2: isPlayer1 ? gameJson.player1Digi2 : gameJson.player2Digi2,
                            myDigi3: isPlayer1 ? gameJson.player1Digi3 : gameJson.player2Digi3,
                            myDigi4: isPlayer1 ? gameJson.player1Digi4 : gameJson.player2Digi4,
                            myDigi5: isPlayer1 ? gameJson.player1Digi5 : gameJson.player2Digi5,
                            myDigi6: isPlayer1 ? gameJson.player1Digi6 : gameJson.player2Digi6,
                            myDigi7: isPlayer1 ? gameJson.player1Digi7 : gameJson.player2Digi7,
                            myDigi8: isPlayer1 ? gameJson.player1Digi8 : gameJson.player2Digi8,
                            myDigi9: isPlayer1 ? gameJson.player1Digi9 : gameJson.player2Digi9,
                            myDigi10: isPlayer1 ? gameJson.player1Digi10 : gameJson.player2Digi10,
                            myDigi11: isPlayer1 ? gameJson.player1Digi11 : gameJson.player2Digi11,
                            myDigi12: isPlayer1 ? gameJson.player1Digi12 : gameJson.player2Digi12,
                            myDigi13: isPlayer1 ? gameJson.player1Digi13 : gameJson.player2Digi13,
                            myDigi14: isPlayer1 ? gameJson.player1Digi14 : gameJson.player2Digi14,
                            myDigi15: isPlayer1 ? gameJson.player1Digi15 : gameJson.player2Digi15,
                            myDigi16: isPlayer1 ? gameJson.player1Digi16 : gameJson.player2Digi16,
                            myDigi17: isPlayer1 ? gameJson.player1Digi17 : gameJson.player2Digi17,
                            myDigi18: isPlayer1 ? gameJson.player1Digi18 : gameJson.player2Digi18,
                            myDigi19: isPlayer1 ? gameJson.player1Digi19 : gameJson.player2Digi19,
                            myDigi20: isPlayer1 ? gameJson.player1Digi20 : gameJson.player2Digi20,
                            myDigi21: isPlayer1 ? gameJson.player1Digi21 : gameJson.player2Digi21,
                            myBreedingArea: isPlayer1 ? gameJson.player1BreedingArea : gameJson.player2BreedingArea,
                            myLink1: isPlayer1 ? gameJson.player1Link1 : gameJson.player2Link1,
                            myLink2: isPlayer1 ? gameJson.player1Link2 : gameJson.player2Link2,
                            myLink3: isPlayer1 ? gameJson.player1Link3 : gameJson.player2Link3,
                            myLink4: isPlayer1 ? gameJson.player1Link4 : gameJson.player2Link4,
                            myLink5: isPlayer1 ? gameJson.player1Link5 : gameJson.player2Link5,
                            myLink6: isPlayer1 ? gameJson.player1Link6 : gameJson.player2Link6,
                            myLink7: isPlayer1 ? gameJson.player1Link7 : gameJson.player2Link7,
                            myLink8: isPlayer1 ? gameJson.player1Link8 : gameJson.player2Link8,
                            myLink9: isPlayer1 ? gameJson.player1Link9 : gameJson.player2Link9,
                            myLink10: isPlayer1 ? gameJson.player1Link10 : gameJson.player2Link10,
                            myLink11: isPlayer1 ? gameJson.player1Link11 : gameJson.player2Link11,
                            myLink12: isPlayer1 ? gameJson.player1Link12 : gameJson.player2Link12,
                            myLink13: isPlayer1 ? gameJson.player1Link13 : gameJson.player2Link13,
                            myLink14: isPlayer1 ? gameJson.player1Link14 : gameJson.player2Link14,
                            myLink15: isPlayer1 ? gameJson.player1Link15 : gameJson.player2Link15,
                            myLink16: isPlayer1 ? gameJson.player1Link16 : gameJson.player2Link16,

                            myMemory: gameJson.playerMemory,
                            phase: gameJson.playerPhase,
                            isMyTurn: gameJson.isPlayerTurn,

                            isLoading: false,
                            bootStage: BootStage.GAME_IN_PROGRESS,
                        });
                    }
                    sendLoaded();
                },

                moveCard: (cardId, from, to, facing?: "down" | "up") => {
                    if (!cardId || !from || !to) return;

                    const fromState = get()[from as keyof State] as CardTypeGame[];
                    const card = fromState.find((card) => card.id === cardId);

                    if (!card) return;
                    if (resetModifierLocations.includes(to))
                        card.modifiers = { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: card.color };

                    if (facing) {
                        facing === "up" ? (card.isFaceUp = true) : (card.isFaceUp = false);
                    } else if (from.includes("EggDeck") || to.includes("Reveal") || to.includes("Trash")) {
                        card.isFaceUp = true;
                    } else if (["myHand", "opponentHand", "myDeck", "opponentDeck"].includes(to)) {
                        card.isFaceUp = false;
                    } else if (["myHand", "opponentHand"].includes(from)) card.isFaceUp = true; // hand to hand should be face down

                    const updatedFromState = fromState.filter((card) => card.id !== cardId);

                    const toState = get()[to as keyof State] as CardTypeGame[];

                    if (toState.length > 0) {
                        const prevTopCard = toState[toState.length - 1];

                        if (prevTopCard.isTilted) {
                            prevTopCard.isTilted = false;
                            card.isTilted = !tamerLocations.includes(to);
                        } else card.isTilted = false;

                        if (!card.modifiers.plusDp) {
                            card.modifiers.plusDp = prevTopCard.modifiers.plusDp;
                            prevTopCard.modifiers.plusDp = 0;
                        } else prevTopCard.modifiers.plusDp = 0;

                        if (!card.modifiers.plusSecurityAttacks) {
                            card.modifiers.plusSecurityAttacks = prevTopCard.modifiers.plusSecurityAttacks;
                            prevTopCard.modifiers.plusSecurityAttacks = 0;
                        } else prevTopCard.modifiers.plusSecurityAttacks = 0;

                        if (!card.modifiers.keywords.length) {
                            card.modifiers.keywords = prevTopCard.modifiers.keywords;
                            prevTopCard.modifiers.keywords = [];
                        } else prevTopCard.modifiers.keywords = [];

                        prevTopCard.modifiers.colors = prevTopCard.color;
                    }

                    if (from === to) {
                        set({ [from]: [...updatedFromState, card] });
                        return;
                    }

                    if (
                        get().bootStage === BootStage.MULLIGAN &&
                        !opponentLocations.includes(from) &&
                        !opponentLocations.includes(to)
                    ) {
                        set({ bootStage: BootStage.GAME_IN_PROGRESS });
                    }

                    if (destroyTokenLocations.includes(to) && card.id.startsWith("TOKEN")) {
                        set({ [from]: updatedFromState });
                        return;
                    }

                    const updatedToState = [...toState, card];
                    set({
                        [from]: updatedFromState,
                        [to]: updatedToState,
                    });
                },

                moveCardToStack: (topOrBottom, cardId, cardLocation, to, facing) => {
                    if (!get().opponentReady) return;

                    const locationCards = get()[cardLocation as keyof State] as CardTypeGame[];
                    const card = locationCards.find((card: CardTypeGame) => card.id === cardId);

                    if (!card) return;

                    const updatedLocationCards = locationCards.filter((card: CardTypeGame) => card.id !== cardId);

                    if (topOrBottom === "Top") card.isTilted = false;

                    if (resetModifierLocations.includes(to) && card)
                        card.modifiers = { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: card.color };

                    if (cardLocation === to) {
                        set({
                            [cardLocation]: [],
                        });
                        const timer1 = setTimeout(() => {
                            set({ [to]: [card, ...updatedLocationCards] });
                        }, 10);
                        return () => clearTimeout(timer1);
                    } else
                        set((state) => {
                            const toStack = state[to as keyof State] as CardTypeGame[];
                            const newCard = facing ? { ...card, isFaceUp: facing === "up" } : card;
                            const updatedDeck = topOrBottom === "Top" ? [newCard, ...toStack] : [...toStack, newCard];
                            return {
                                [cardLocation]: updatedLocationCards,
                                [to]: updatedDeck,
                            };
                        });
                },

                setMemory: (memory: number) => set({ myMemory: memory, opponentMemory: -memory }),

                setPhase: () => {
                    const phase = get().phase;
                    set({ myAttackPhase: false, opponentAttackPhase: false });
                    switch (phase) {
                        case Phase.UNSUSPEND:
                            set({ phase: Phase.DRAW });
                            return;
                        case Phase.DRAW:
                            set({ phase: Phase.BREEDING });
                            return;
                        case Phase.BREEDING:
                            set({ phase: Phase.MAIN });
                            return;
                        case Phase.MAIN:
                            set({ phase: Phase.UNSUSPEND });
                            return;
                    }
                },

                setTurn: (isMyTurn: boolean) => set({ isMyTurn }),

                shuffleSecurity: () => {
                    set((state) => {
                        const security = state.mySecurity;
                        const cryptoArray = new Uint32Array(security.length);
                        crypto.getRandomValues(cryptoArray);

                        for (let i = security.length - 1; i > 0; i--) {
                            const j = cryptoArray[i] % (i + 1);
                            [security[i], security[j]] = [security[j], security[i]];
                        }
                        return {
                            mySecurity: security,
                            isLoading: true,
                        };
                    });
                },

                mulligan: () => {
                    set((state) => {
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
                            isLoading: true, // will be set false in distributeCards
                        };
                    });
                },

                tiltCard: (cardId, location, playSuspendSfx, playUnsuspendSfx) => {
                    set((state) => {
                        return {
                            [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                                if (card.id === cardId) {
                                    const isTilted = card.isTilted;
                                    card.isTilted = !isTilted;
                                    isTilted ? playUnsuspendSfx() : playSuspendSfx();
                                }
                                return card;
                            }),
                        };
                    });
                },

                setMessages: (message: string) => {
                    set((state) => {
                        return {
                            messages: [message, ...state.messages],
                        };
                    });
                },

                createToken: (tokenVariant, side, id) => {
                    if (!get().opponentReady) return;
                    const token: CardTypeGame = {
                        ...tokenVariant,
                        id: id,
                        isTilted: false,
                        isFaceUp: true,
                        modifiers: { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: tokenVariant.color },
                    };
                    set((state) => {
                        for (let i = 1; i <= 8; i++) {
                            const digiKey = `${side}Digi${i}` as keyof State;
                            if (
                                Array.isArray(state[digiKey] as CardTypeGame[]) &&
                                (state[digiKey] as CardTypeGame[]).length === 0
                            ) {
                                return {
                                    [digiKey]: [token],
                                };
                            }
                        }
                        return state;
                    });
                },

                moveCardStack: (index, from, to, handleDropToField) => {
                    const locationCards = get()[from as keyof State] as CardTypeGame[];
                    const cards = tamerLocations.includes(from)
                        ? locationCards.slice(index)
                        : locationCards.slice(0, index + 1);

                    if (
                        (tamerLocations.includes(from) && digimonLocations.includes(to)) ||
                        (digimonLocations.includes(from) && tamerLocations.includes(to))
                    ) {
                        cards.reverse();
                    }
                    cards.forEach((card) => handleDropToField(card.id, from, to, card.name, card.isFaceUp));
                },

                areCardsSuspended: (from) => {
                    if (from) return (get()[from as keyof State] as CardTypeGame[]).some((card) => card.isTilted);

                    return (
                        get().myDigi1.some((card) => card.isTilted) ||
                        get().myDigi2.some((card) => card.isTilted) ||
                        get().myDigi3.some((card) => card.isTilted) ||
                        get().myDigi4.some((card) => card.isTilted) ||
                        get().myDigi5.some((card) => card.isTilted) ||
                        get().myDigi6.some((card) => card.isTilted) ||
                        get().myDigi7.some((card) => card.isTilted) ||
                        get().myDigi8.some((card) => card.isTilted) ||
                        get().myDigi9.some((card) => card.isTilted) ||
                        get().myDigi10.some((card) => card.isTilted) ||
                        get().myDigi11.some((card) => card.isTilted) ||
                        get().myDigi12.some((card) => card.isTilted) ||
                        get().myDigi13.some((card) => card.isTilted) ||
                        get().myDigi14.some((card) => card.isTilted) ||
                        get().myDigi15.some((card) => card.isTilted) ||
                        get().myDigi16.some((card) => card.isTilted) ||
                        get().myDigi17.some((card) => card.isTilted) ||
                        get().myDigi18.some((card) => card.isTilted) ||
                        get().myDigi19.some((card) => card.isTilted) ||
                        get().myDigi20.some((card) => card.isTilted) ||
                        get().myDigi21.some((card) => card.isTilted) ||
                        get().myBreedingArea.some((card) => card.isTilted)
                    );
                },

                nextPhaseTrigger: (nextPhaseFunction, currentPhase) => {
                    if (get().phase === Phase.MAIN || !get().isMyTurn) return;

                    if (
                        (get().phase === Phase.BREEDING && currentPhase === Phase.BREEDING) ||
                        (get().phase === Phase.DRAW && currentPhase === Phase.DRAW) ||
                        (get().phase === Phase.UNSUSPEND && !get().areCardsSuspended())
                    ) {
                        nextPhaseFunction();
                    }
                },

                unsuspendAll: (side) => {
                    for (let i = 1; i <= 21; i++) {
                        set((state) => {
                            const digiKey = `${side}Digi${i}` as keyof State;
                            return {
                                [digiKey]: (state[digiKey] as CardTypeGame[]).map((card) => {
                                    card.isTilted = false;
                                    return card;
                                }),
                            };
                        });
                    }
                    set((state) => ({
                        myBreedingArea: (state.myBreedingArea as CardTypeGame[]).map((card) => ({
                            ...card,
                            isTilted: false,
                        })),
                    }));
                },

                getIsMyTurn: () => get().isMyTurn,

                getMyAttackPhase: () => get().myAttackPhase,

                getOpponentAttackPhase: () => get().opponentAttackPhase,

                setMyAttackPhase: (phase) => set({ myAttackPhase: phase }),

                setOpponentAttackPhase: (phase) => set({ opponentAttackPhase: phase }),

                getOpponentReady: () => get().opponentReady,

                getDigimonNumber: (location) => {
                    const locationState = get()[location as keyof State] as CardTypeGame[];
                    return locationState[locationState.length - 1].cardNumber;
                },

                getCardType: (location) => {
                    const locationState = get()[location as keyof State] as CardTypeGame[];
                    return locationState[locationState.length - 1].cardType;
                },

                getPhase: () => get().phase,

                setIsLoading: (isLoading) => set({ isLoading }),

                setCardIdWithEffect: (cardIdWithEffect) => set({ cardIdWithEffect }),

                getIsCardEffect: (compareCardId) => compareCardId === get().cardIdWithEffect,

                setCardIdWithTarget: (cardIdWithTarget) => set({ cardIdWithTarget }),

                getIsCardTarget: (compareCardId) => compareCardId === get().cardIdWithTarget,

                setCardToSend: (id, location) => set({ cardToSend: { id, location } }),

                setBootStage: (stage) => set({ bootStage: stage }),

                setRestartObject: (restartObject) => set({ restartObject }),

                setGameId: (gameId) => set({ gameId }),

                setInheritCardInfo: (inheritedEffects) => set({ inheritCardInfo: inheritedEffects }),

                setLinkCardInfo: (linkCardInfo) => set({ linkCardInfo }),

                getCardLocationById: (cardId) => {
                    if (!cardId) return "";
                    const state = get();
                    for (const key in state) {
                        if (Object.prototype.hasOwnProperty.call(state, key)) {
                            const locationState = state[key as keyof State] as CardTypeGame[];
                            if (
                                Array.isArray(locationState) &&
                                locationState.length &&
                                locationState.find((card) => card?.id === cardId)
                            ) {
                                return key;
                            }
                        }
                    }
                    return "";
                },

                setModifiers: (cardId, location, modifiers) => {
                    set((state) => {
                        return {
                            [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                                if (card.id === cardId) card.modifiers = modifiers;
                                return card;
                            }),
                        };
                    });
                },

                toggleIsHandHidden: () => set((state) => ({ isHandHidden: !state.isHandHidden })),

                setStackSliceIndex: (index) => set({ stackSliceIndex: index }),

                setIsOpponentOnline: (isOpponentOnline) => set({ isOpponentOnline }),

                setStartingPlayer: (startingPlayer) => set({ startingPlayer }),

                getLinkCardsForLocation: (location) => {
                    if (!battleAreaLocations.includes(location)) return [] as CardTypeGame[];
                    return get()[location.replace("Digi", "Link") as keyof State] as CardTypeGame[];
                },

                flipCard: (cardId, location) => {
                    set((state) => {
                        return {
                            [location]: (state[location as keyof State] as CardTypeGame[]).map((card: CardTypeGame) => {
                                if (card.id === cardId) card.isFaceUp = !card.isFaceUp;
                                return card;
                            }),
                        };
                    });
                },
            }),
            { name: "bearStore" }
        )
    )
);
