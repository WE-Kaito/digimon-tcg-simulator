import { create } from "zustand";
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

export const tamerLocations = [
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

export type State = BoardState & {
    gameId: string;

    cardIdWithEffect: string;
    cardIdWithTarget: string;
    isHandHidden: boolean;

    /**
     * Id and location of a card that is going to be sent to security or egg-deck
     * Retrieve this to use also in {@link setModifiers}
     * Should be refactored.
     */
    cardToSend: { card: CardTypeGame; location: string } | null;
    inheritCardInfo: string[];
    linkCardInfo: { dp: number; effect: string }[];
    setLinkCardInfo: (linkCardInfo: { dp: number; effect: string }[]) => void;
    getLinkCardsForLocation: (location: string) => CardTypeGame[];

    bootStage: BootStage;

    player1: Player;
    player2: Player;

    phase: Phase;
    setPhase: (phase: Phase) => void;
    usernameTurn: string;
    myAttackPhase: AttackPhase | false;
    opponentAttackPhase: AttackPhase | false;

    messages: string[];
    setMessages: (message: string) => void;
    setAllMessages: (messages: string[]) => void;
    stackSliceIndex: number;
    isOpponentOnline: boolean;
    startingPlayer: string;

    // --------------------------------------------------------

    mulligan: (myDecision: boolean, opponentDecision: boolean) => Promise<void>;

    setPlayers: (player1: Player, player2: Player) => void;
    clearBoard: () => void;
    distributeCards: (user: string, distributionJSON: string, playDrawCardSfx: () => void) => void;
    moveCard: (cardId: string, from: string, to: string, facing?: "down" | "up") => void;
    moveCardToStack: SendToStackFunction;
    setMemory: (memory: number) => void;
    progressToNextPhase: () => void;
    setUsernameTurn: (usernameTurn: string) => void;
    shuffleSecurity: () => void;
    tiltCard: (cardId: string, location: string, playSuspendSfx: () => void, playUnsuspendSfx: () => void) => void;
    createToken: (token: CardType, side: SIDE, id: string) => void;
    moveCardStack: (
        index: number,
        from: string,
        to: string,
        handleDropToField: (id: string, from: string, to: string) => void,
        logCardMovement: (from: string, to: string, cards: CardTypeGame[]) => void
    ) => void;
    areCardsSuspended: (from?: string) => boolean;
    nextPhaseTrigger: (nextPhaseFunction: () => void, currentPhase?: string) => void;
    unsuspendAll: (side: SIDE) => void;
    getIsMyTurn: (username: string) => boolean;
    getMyAttackPhase: () => AttackPhase | false;
    getOpponentAttackPhase: () => AttackPhase | false;
    setMyAttackPhase: (phase: AttackPhase | false) => void;
    setOpponentAttackPhase: (phase: AttackPhase | false) => void;
    getDigimonNumber: (location: string) => string;
    getCardType: (location: string) => string;
    setCardIdWithEffect: (cardId: string) => void;
    getIsCardEffect: (compareCardId: string) => boolean;
    setCardIdWithTarget: (cardId: string) => void;
    getIsCardTarget: (compareCardId: string) => boolean;
    setCardToSend: (cardToSend: { card: CardTypeGame; location: string } | null) => void;
    setBootStage: (phase: BootStage) => void;
    setGameId: (gameId: string) => void;
    setInheritCardInfo: (inheritedEffects: string[]) => void;
    setModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void;
    getCardLocationById: (id: string) => string;
    toggleIsHandHidden: () => void;
    setStackSliceIndex: (index: number) => void;
    setIsOpponentOnline: (isOpponentOnline: boolean) => void;
    setStartingPlayer: (side: SIDE | "") => void;

    flipCard: (cardId: string, location: string) => void;

    hasDecidedMulligan: boolean;
    setHasDecidedMulligan: (hasDecidedMulligan: boolean) => void;

    markedCard: string;
    setMarkedCard: (cardId: string) => void;
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

export const useGameBoardStates = create<State>()((set, get) => ({
    gameId: localStorage.getItem("gameId") || "",

    cardIdWithEffect: "",
    cardIdWithTarget: "",
    isHandHidden: false,
    cardToSend: null,
    inheritCardInfo: [],
    linkCardInfo: [],

    bootStage: BootStage.CLEAR,

    player1: { avatarName: "", mainSleeveName: "", eggSleeveName: "", username: "" },
    player2: { avatarName: "", mainSleeveName: "", eggSleeveName: "", username: "" },

    ...fieldDefaultValues,
    myMemory: 0,
    opponentMemory: 0,

    phase: Phase.BREEDING,
    usernameTurn: "",
    myAttackPhase: false,
    opponentAttackPhase: false,

    messages: [],
    stackSliceIndex: 0,
    isOpponentOnline: true,
    startingPlayer: "",

    hasDecidedMulligan: false,
    setHasDecidedMulligan: (hasDecidedMulligan) => set({ hasDecidedMulligan }),

    setPlayers: (player1, player2) => {
        set({ player1, player2 });
    },

    setPhase: (phase) => set({ phase }),

    clearBoard: () => {
        set({
            ...fieldDefaultValues,
            myMemory: 0,
            opponentMemory: 0,
            phase: Phase.BREEDING,
            usernameTurn: "",
            opponentAttackPhase: false,
            myAttackPhase: false,
            bootStage: BootStage.CLEAR,
            isOpponentOnline: true,
            hasDecidedMulligan: false,
            messages: [],
            player1: { avatarName: "", mainSleeveName: "", eggSleeveName: "", username: "" },
            player2: { avatarName: "", mainSleeveName: "", eggSleeveName: "", username: "" },
        });
    },

    distributeCards: (user, distributionJSON, playDrawCardSfx) => {
        const player1 = get().player1;
        const gameData = JSON.parse(distributionJSON);

        const isPlayer1 = user === player1.username;

        // Check if this is BoardState format (has player1Deck) or GameStart format (has player1DeckField)
        const isBoardStateFormat = "player1Deck" in gameData;

        if (isBoardStateFormat) {
            // Handle complete BoardState format (reconnection)
            const boardState = gameData;
            set({
                myHand: isPlayer1 ? boardState.player1Hand : boardState.player2Hand,
                myDeckField: isPlayer1 ? boardState.player1Deck : boardState.player2Deck,
                myEggDeck: isPlayer1 ? boardState.player1EggDeck : boardState.player2EggDeck,
                mySecurity: isPlayer1 ? boardState.player1Security : boardState.player2Security,
                myTrash: isPlayer1 ? boardState.player1Trash : boardState.player2Trash,
                myReveal: isPlayer1 ? boardState.player1Reveal : boardState.player2Reveal,
                myDigi1: isPlayer1 ? boardState.player1Digi1 : boardState.player2Digi1,
                myDigi2: isPlayer1 ? boardState.player1Digi2 : boardState.player2Digi2,
                myDigi3: isPlayer1 ? boardState.player1Digi3 : boardState.player2Digi3,
                myDigi4: isPlayer1 ? boardState.player1Digi4 : boardState.player2Digi4,
                myDigi5: isPlayer1 ? boardState.player1Digi5 : boardState.player2Digi5,
                myDigi6: isPlayer1 ? boardState.player1Digi6 : boardState.player2Digi6,
                myDigi7: isPlayer1 ? boardState.player1Digi7 : boardState.player2Digi7,
                myDigi8: isPlayer1 ? boardState.player1Digi8 : boardState.player2Digi8,
                myDigi9: isPlayer1 ? boardState.player1Digi9 : boardState.player2Digi9,
                myDigi10: isPlayer1 ? boardState.player1Digi10 : boardState.player2Digi10,
                myDigi11: isPlayer1 ? boardState.player1Digi11 : boardState.player2Digi11,
                myDigi12: isPlayer1 ? boardState.player1Digi12 : boardState.player2Digi12,
                myDigi13: isPlayer1 ? boardState.player1Digi13 : boardState.player2Digi13,
                myDigi14: isPlayer1 ? boardState.player1Digi14 : boardState.player2Digi14,
                myDigi15: isPlayer1 ? boardState.player1Digi15 : boardState.player2Digi15,
                myDigi16: isPlayer1 ? boardState.player1Digi16 : boardState.player2Digi16,
                myDigi17: isPlayer1 ? boardState.player1Digi17 : boardState.player2Digi17,
                myDigi18: isPlayer1 ? boardState.player1Digi18 : boardState.player2Digi18,
                myDigi19: isPlayer1 ? boardState.player1Digi19 : boardState.player2Digi19,
                myDigi20: isPlayer1 ? boardState.player1Digi20 : boardState.player2Digi20,
                myDigi21: isPlayer1 ? boardState.player1Digi21 : boardState.player2Digi21,
                myBreedingArea: isPlayer1 ? boardState.player1BreedingArea : boardState.player2BreedingArea,
                myLink1: isPlayer1 ? boardState.player1Link1 : boardState.player2Link1,
                myLink2: isPlayer1 ? boardState.player1Link2 : boardState.player2Link2,
                myLink3: isPlayer1 ? boardState.player1Link3 : boardState.player2Link3,
                myLink4: isPlayer1 ? boardState.player1Link4 : boardState.player2Link4,
                myLink5: isPlayer1 ? boardState.player1Link5 : boardState.player2Link5,
                myLink6: isPlayer1 ? boardState.player1Link6 : boardState.player2Link6,
                myLink7: isPlayer1 ? boardState.player1Link7 : boardState.player2Link7,
                myLink8: isPlayer1 ? boardState.player1Link8 : boardState.player2Link8,
                myLink9: isPlayer1 ? boardState.player1Link9 : boardState.player2Link9,
                myLink10: isPlayer1 ? boardState.player1Link10 : boardState.player2Link10,
                myLink11: isPlayer1 ? boardState.player1Link11 : boardState.player2Link11,
                myLink12: isPlayer1 ? boardState.player1Link12 : boardState.player2Link12,
                myLink13: isPlayer1 ? boardState.player1Link13 : boardState.player2Link13,
                myLink14: isPlayer1 ? boardState.player1Link14 : boardState.player2Link14,
                myLink15: isPlayer1 ? boardState.player1Link15 : boardState.player2Link15,
                myLink16: isPlayer1 ? boardState.player1Link16 : boardState.player2Link16,

                // Opponent fields
                opponentHand: isPlayer1 ? boardState.player2Hand : boardState.player1Hand,
                opponentDeckField: isPlayer1 ? boardState.player2Deck : boardState.player1Deck,
                opponentEggDeck: isPlayer1 ? boardState.player2EggDeck : boardState.player1EggDeck,
                opponentSecurity: isPlayer1 ? boardState.player2Security : boardState.player1Security,
                opponentTrash: isPlayer1 ? boardState.player2Trash : boardState.player1Trash,
                opponentReveal: isPlayer1 ? boardState.player2Reveal : boardState.player1Reveal,
                opponentDigi1: isPlayer1 ? boardState.player2Digi1 : boardState.player1Digi1,
                opponentDigi2: isPlayer1 ? boardState.player2Digi2 : boardState.player1Digi2,
                opponentDigi3: isPlayer1 ? boardState.player2Digi3 : boardState.player1Digi3,
                opponentDigi4: isPlayer1 ? boardState.player2Digi4 : boardState.player1Digi4,
                opponentDigi5: isPlayer1 ? boardState.player2Digi5 : boardState.player1Digi5,
                opponentDigi6: isPlayer1 ? boardState.player2Digi6 : boardState.player1Digi6,
                opponentDigi7: isPlayer1 ? boardState.player2Digi7 : boardState.player1Digi7,
                opponentDigi8: isPlayer1 ? boardState.player2Digi8 : boardState.player1Digi8,
                opponentDigi9: isPlayer1 ? boardState.player2Digi9 : boardState.player1Digi9,
                opponentDigi10: isPlayer1 ? boardState.player2Digi10 : boardState.player1Digi10,
                opponentDigi11: isPlayer1 ? boardState.player2Digi11 : boardState.player1Digi11,
                opponentDigi12: isPlayer1 ? boardState.player2Digi12 : boardState.player1Digi12,
                opponentDigi13: isPlayer1 ? boardState.player2Digi13 : boardState.player1Digi13,
                opponentDigi14: isPlayer1 ? boardState.player2Digi14 : boardState.player1Digi14,
                opponentDigi15: isPlayer1 ? boardState.player2Digi15 : boardState.player1Digi15,
                opponentDigi16: isPlayer1 ? boardState.player2Digi16 : boardState.player1Digi16,
                opponentDigi17: isPlayer1 ? boardState.player2Digi17 : boardState.player1Digi17,
                opponentDigi18: isPlayer1 ? boardState.player2Digi18 : boardState.player1Digi18,
                opponentDigi19: isPlayer1 ? boardState.player2Digi19 : boardState.player1Digi19,
                opponentDigi20: isPlayer1 ? boardState.player2Digi20 : boardState.player1Digi20,
                opponentDigi21: isPlayer1 ? boardState.player2Digi21 : boardState.player1Digi21,
                opponentBreedingArea: isPlayer1 ? boardState.player2BreedingArea : boardState.player1BreedingArea,
                opponentLink1: isPlayer1 ? boardState.player2Link1 : boardState.player1Link1,
                opponentLink2: isPlayer1 ? boardState.player2Link2 : boardState.player1Link2,
                opponentLink3: isPlayer1 ? boardState.player2Link3 : boardState.player1Link3,
                opponentLink4: isPlayer1 ? boardState.player2Link4 : boardState.player1Link4,
                opponentLink5: isPlayer1 ? boardState.player2Link5 : boardState.player1Link5,
                opponentLink6: isPlayer1 ? boardState.player2Link6 : boardState.player1Link6,
                opponentLink7: isPlayer1 ? boardState.player2Link7 : boardState.player1Link7,
                opponentLink8: isPlayer1 ? boardState.player2Link8 : boardState.player1Link8,
                opponentLink9: isPlayer1 ? boardState.player2Link9 : boardState.player1Link9,
                opponentLink10: isPlayer1 ? boardState.player2Link10 : boardState.player1Link10,
                opponentLink11: isPlayer1 ? boardState.player2Link11 : boardState.player1Link11,
                opponentLink12: isPlayer1 ? boardState.player2Link12 : boardState.player1Link12,
                opponentLink13: isPlayer1 ? boardState.player2Link13 : boardState.player1Link13,
                opponentLink14: isPlayer1 ? boardState.player2Link14 : boardState.player1Link14,
                opponentLink15: isPlayer1 ? boardState.player2Link15 : boardState.player1Link15,
                opponentLink16: isPlayer1 ? boardState.player2Link16 : boardState.player1Link16,

                // Set memory values
                myMemory: isPlayer1 ? boardState.player1Memory : boardState.player2Memory,
                opponentMemory: isPlayer1 ? boardState.player2Memory : boardState.player1Memory,
            });
        } else {
            // Handle GameStart format (initial distribution)
            const game: GameDistribution = gameData;
            set({
                myHand: isPlayer1 ? game.player1Hand : game.player2Hand,
                myDeckField: isPlayer1 ? game.player1DeckField : game.player2DeckField,
                myEggDeck: isPlayer1 ? game.player1EggDeck : game.player2EggDeck,
                mySecurity: isPlayer1 ? game.player1Security : game.player2Security,
                opponentHand: isPlayer1 ? game.player2Hand : game.player1Hand,
                opponentDeckField: isPlayer1 ? game.player2DeckField : game.player1DeckField,
                opponentEggDeck: isPlayer1 ? game.player2EggDeck : game.player1EggDeck,
                opponentSecurity: isPlayer1 ? game.player2Security : game.player1Security,
            });
        }
        playDrawCardSfx();
    },

    moveCard: (cardId, from, to, facing?: "down" | "up") => {
        if (!cardId || !from || !to) return;

        const fromState = get()[from as keyof State] as CardTypeGame[];
        if (!fromState || !Array.isArray(fromState)) return; // Prevent null access

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
        if (!toState || !Array.isArray(toState)) return; // Prevent null access

        if (toState.length > 0) {
            const prevTopCard = toState[toState.length - 1];
            if (!prevTopCard) return; // Additional safety check

            if (prevTopCard.isTilted) {
                prevTopCard.isTilted = false;
                card.isTilted = !tamerLocations.includes(to);
            } else card.isTilted = false;

            if (card.modifiers && prevTopCard.modifiers) {
                if (!card.modifiers.plusDp) {
                    card.modifiers.plusDp = prevTopCard.modifiers.plusDp || 0;
                    prevTopCard.modifiers.plusDp = 0;
                } else prevTopCard.modifiers.plusDp = 0;

                if (!card.modifiers.plusSecurityAttacks) {
                    card.modifiers.plusSecurityAttacks = prevTopCard.modifiers.plusSecurityAttacks || 0;
                    prevTopCard.modifiers.plusSecurityAttacks = 0;
                } else prevTopCard.modifiers.plusSecurityAttacks = 0;

                if (!card.modifiers.keywords?.length) {
                    card.modifiers.keywords = prevTopCard.modifiers.keywords || [];
                    prevTopCard.modifiers.keywords = [];
                } else prevTopCard.modifiers.keywords = [];

                prevTopCard.modifiers.colors = prevTopCard.color;
            }
        }

        if (from === to) {
            if (get().markedCard === cardId && from === "opponentHand") get().setMarkedCard("");
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

        if (destroyTokenLocations.includes(to) && card.uniqueCardNumber.includes("TOKEN")) {
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
        const locationCards = get()[cardLocation as keyof State] as CardTypeGame[];
        const card = locationCards.find((card: CardTypeGame) => card.id === cardId);

        if (!card) return;

        const updatedLocationCards = locationCards.filter((card: CardTypeGame) => card.id !== cardId);

        if (topOrBottom === "Top") card.isTilted = false;

        if (resetModifierLocations.includes(to) && card)
            card.modifiers = { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: card.color };

        if (
            card.id === get().markedCard &&
            ["opponentDeckField", "opponentSecurityStack", "opponentEggDeck"].includes(to)
        ) {
            get().setMarkedCard("");
        }

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

    progressToNextPhase: () => {
        set({ myAttackPhase: false, opponentAttackPhase: false });

        const phase = get().phase;
        if (phase === Phase.UNSUSPEND) set({ phase: Phase.DRAW });
        if (phase === Phase.DRAW) set({ phase: Phase.BREEDING });
        if (phase === Phase.BREEDING) set({ phase: Phase.MAIN });
        if (phase === Phase.MAIN) set({ phase: Phase.UNSUSPEND });
    },

    setUsernameTurn: (usernameTurn) => set({ usernameTurn }),

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
            };
        });
    },

    mulligan: async (myDecision, opponentDecision) => {
        // Card redistribution is now handled by backend via [REDISTRIBUTE_CARDS] message
        // This function only handles UI state transitions for the "neither player mulligan" case
        if (!myDecision && !opponentDecision) set({ bootStage: BootStage.GAME_IN_PROGRESS });
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

    setAllMessages: (messages: string[]) => {
        set(() => {
            return {
                messages: messages,
            };
        });
    },

    createToken: (tokenVariant, side, id) => {
        const token: CardTypeGame = {
            ...tokenVariant,
            id: id,
            isTilted: false,
            isFaceUp: true,
            modifiers: { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: tokenVariant.color },
        };
        let placementPosition: string | null = null;

        set((state) => {
            for (let i = 1; i <= 16; i++) {
                const digiKey = `${side}Digi${i}` as keyof State;
                if (
                    Array.isArray(state[digiKey] as CardTypeGame[]) &&
                    (state[digiKey] as CardTypeGame[]).length === 0
                ) {
                    placementPosition = digiKey;
                    return {
                        [digiKey]: [token],
                    };
                }
            }
            return state;
        });

        return placementPosition;
    },

    moveCardStack: (index, from, to, handleDropToField, logCardMovement) => {
        const locationCards = get()[from as keyof State] as CardTypeGame[];
        const cards = tamerLocations.includes(from) ? locationCards.slice(index) : locationCards.slice(0, index + 1);

        if (
            (tamerLocations.includes(from) && digimonLocations.includes(to)) ||
            (digimonLocations.includes(from) && tamerLocations.includes(to))
        ) {
            cards.reverse();
        }

        cards.forEach((card) => handleDropToField(card.id, from, to));
        if (digimonLocations.includes(from) && tamerLocations.includes(to)) logCardMovement(from, to, cards);
        else logCardMovement(from, to, cards.reverse());
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
        if (get().phase === Phase.MAIN) return;
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

    getIsMyTurn: (username) => get().usernameTurn === username,

    getMyAttackPhase: () => get().myAttackPhase,

    getOpponentAttackPhase: () => get().opponentAttackPhase,

    setMyAttackPhase: (phase) => set({ myAttackPhase: phase }),

    setOpponentAttackPhase: (phase) => set({ opponentAttackPhase: phase }),

    getDigimonNumber: (location) => {
        const locationState = get()[location as keyof State] as CardTypeGame[];
        if (!locationState || locationState.length === 0) return "";
        return locationState[locationState.length - 1]?.cardNumber ?? "";
    },

    getCardType: (location) => {
        const locationState = get()[location as keyof State] as CardTypeGame[];
        if (!locationState || locationState.length === 0) return "";
        return locationState[locationState.length - 1]?.cardType ?? "";
    },

    setCardIdWithEffect: (cardIdWithEffect) => set({ cardIdWithEffect }),

    getIsCardEffect: (compareCardId) => compareCardId === get().cardIdWithEffect,

    setCardIdWithTarget: (cardIdWithTarget) => set({ cardIdWithTarget }),

    getIsCardTarget: (compareCardId) => compareCardId === get().cardIdWithTarget,

    setCardToSend: (cardToSend) => set({ cardToSend }),

    setBootStage: (stage) => set({ bootStage: stage }),

    setGameId: (gameId) => {
        localStorage.setItem("gameId", gameId);
        set({ gameId });
    },

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

    markedCard: "",
    setMarkedCard: (cardId) => set({ markedCard: cardId }),
}));
