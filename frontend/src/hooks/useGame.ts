import {create} from "zustand";
import {CardTypeWithId, GameDistribution, Player} from "../utils/types.ts";
import 'react-toastify/dist/ReactToastify.css';

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

    opponentDigi1: CardTypeWithId[],
    opponentDigi2: CardTypeWithId[],
    opponentDigi3: CardTypeWithId[],
    opponentDigi4: CardTypeWithId[],
    opponentDigi5: CardTypeWithId[],
    opponentBreedingArea: CardTypeWithId[],

    setUpGame: (me: Player, opponent: Player) => void;
    distributeCards: (user: string, game: GameDistribution, gameId: string) => void;
};


export const useGame = create<State>((set) => ({

    isLoading: false,

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
            opponentAvatar: opponent.avatarName
        });
    },

    distributeCards: (user, game, gameId) => {

        const player1 = gameId.split("_")[0];

        set ({memory: game.memory});

        if (user === player1) {
            set({
                myHand: game.player1Hand,
                myDeckField: game.player1DeckField,
                myEggDeck: game.player1EggDeck,
                myTrash: game.player1Trash,
                mySecurity: game.player1Security,
                myTamer: game.player1Tamer,
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
                opponentDigi1: game.player1Digi1,
                opponentDigi2: game.player1Digi2,
                opponentDigi3: game.player1Digi3,
                opponentDigi4: game.player1Digi4,
                opponentDigi5: game.player1Digi5,
                opponentBreedingArea: game.player1BreedingArea,
            });
        }
    }

}));
