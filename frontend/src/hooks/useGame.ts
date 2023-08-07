import {create} from "zustand";
import {CardTypeWithId, Player} from "../utils/types.ts";
import 'react-toastify/dist/ReactToastify.css';
import {uid} from "uid";

type State = {
    myAvatar: string,
    myDeck: CardTypeWithId[],

    opponentName: string,
    opponentAvatar: string,
    opponentDeck: CardTypeWithId[],

    setUpGame: (me: Player, opponent: Player) => void;
};


export const useGame = create<State>((set) => ({

    myAvatar: "",
    myDeck: [],

    opponentName: "",
    opponentAvatar: "",
    opponentDeck: [],

    setUpGame: (me, opponent) => {

        function shuffleDeck(deck: CardTypeWithId[]) {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
                [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
            }
            return deck;
        }

        const meDeck = me.deck;
        const opponentDeck = opponent.deck;
        const meDeckWithIds = meDeck.map((card) => {
            return {...card, id: uid()};
        });
        const opponentDeckWithIds = opponentDeck.map((card) => {
            return {...card, id: uid()};
        });

        set({
            myAvatar: me.avatarName,
            myDeck: shuffleDeck(meDeckWithIds),
            opponentName: opponent.username,
            opponentAvatar: opponent.avatarName,
            opponentDeck: shuffleDeck(opponentDeckWithIds)
        });

    }

}));
