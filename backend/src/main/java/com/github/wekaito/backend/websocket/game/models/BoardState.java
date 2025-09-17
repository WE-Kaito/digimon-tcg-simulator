package com.github.wekaito.backend.websocket.game.models;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
//@Builder
public class BoardState {
    private int player1Memory = 0;
    private GameCard[] player1Deck = new GameCard[0];
    private GameCard[] player1Hand = new GameCard[0];
    private GameCard[] player1EggDeck = new GameCard[0];
    private GameCard[] player1Trash = new GameCard[0];
    private GameCard[] player1Security = new GameCard[0];
    private GameCard[] player1Reveal = new GameCard[0];
    private GameCard[] player1BreedingArea = new GameCard[0];

    // Store original distribution for mulligan
    private GameCard[] player1OriginalHand;
    private GameCard[] player1OriginalDeck;

    private GameCard[] player1Digi1 = new GameCard[0];
    private GameCard[] player1Digi2 = new GameCard[0];
    private GameCard[] player1Digi3 = new GameCard[0];
    private GameCard[] player1Digi4 = new GameCard[0];
    private GameCard[] player1Digi5 = new GameCard[0];
    private GameCard[] player1Digi6 = new GameCard[0];
    private GameCard[] player1Digi7 = new GameCard[0];
    private GameCard[] player1Digi8 = new GameCard[0];
    private GameCard[] player1Digi9 = new GameCard[0];
    private GameCard[] player1Digi10 = new GameCard[0];
    private GameCard[] player1Digi11 = new GameCard[0];
    private GameCard[] player1Digi12 = new GameCard[0];
    private GameCard[] player1Digi13 = new GameCard[0];
    private GameCard[] player1Digi14 = new GameCard[0];
    private GameCard[] player1Digi15 = new GameCard[0];
    private GameCard[] player1Digi16 = new GameCard[0];
    private GameCard[] player1Digi17 = new GameCard[0]; // Tamer
    private GameCard[] player1Digi18 = new GameCard[0]; // Tamer
    private GameCard[] player1Digi19 = new GameCard[0]; // Tamer
    private GameCard[] player1Digi20 = new GameCard[0]; // Tamer
    private GameCard[] player1Digi21 = new GameCard[0]; // Tamer

    private GameCard[] player1Link1 = new GameCard[0];
    private GameCard[] player1Link2 = new GameCard[0];
    private GameCard[] player1Link3 = new GameCard[0];
    private GameCard[] player1Link4 = new GameCard[0];
    private GameCard[] player1Link5 = new GameCard[0];
    private GameCard[] player1Link6 = new GameCard[0];
    private GameCard[] player1Link7 = new GameCard[0];
    private GameCard[] player1Link8 = new GameCard[0];
    private GameCard[] player1Link9 = new GameCard[0];
    private GameCard[] player1Link10 = new GameCard[0];
    private GameCard[] player1Link11 = new GameCard[0];
    private GameCard[] player1Link12 = new GameCard[0];
    private GameCard[] player1Link13 = new GameCard[0];
    private GameCard[] player1Link14 = new GameCard[0];
    private GameCard[] player1Link15 = new GameCard[0];
    private GameCard[] player1Link16 = new GameCard[0];

    private int player2Memory = 0;
    private GameCard[] player2Deck = new GameCard[0];
    private GameCard[] player2Hand = new GameCard[0];
    private GameCard[] player2EggDeck = new GameCard[0];
    private GameCard[] player2Trash = new GameCard[0];
    private GameCard[] player2Security = new GameCard[0];
    private GameCard[] player2Reveal = new GameCard[0];
    private GameCard[] player2BreedingArea = new GameCard[0];

    // Store original distribution for mulligan
    private GameCard[] player2OriginalHand;
    private GameCard[] player2OriginalDeck;
    private GameCard[] player2Digi1 = new GameCard[0];
    private GameCard[] player2Digi2 = new GameCard[0];
    private GameCard[] player2Digi3 = new GameCard[0];
    private GameCard[] player2Digi4 = new GameCard[0];
    private GameCard[] player2Digi5 = new GameCard[0];
    private GameCard[] player2Digi6 = new GameCard[0];
    private GameCard[] player2Digi7 = new GameCard[0];
    private GameCard[] player2Digi8 = new GameCard[0];
    private GameCard[] player2Digi9 = new GameCard[0];
    private GameCard[] player2Digi10 = new GameCard[0];
    private GameCard[] player2Digi11 = new GameCard[0];
    private GameCard[] player2Digi12 = new GameCard[0];
    private GameCard[] player2Digi13 = new GameCard[0];
    private GameCard[] player2Digi14 = new GameCard[0];
    private GameCard[] player2Digi15 = new GameCard[0];
    private GameCard[] player2Digi16 = new GameCard[0];
    private GameCard[] player2Digi17 = new GameCard[0]; // Tamer
    private GameCard[] player2Digi18 = new GameCard[0]; // Tamer
    private GameCard[] player2Digi19 = new GameCard[0]; // Tamer
    private GameCard[] player2Digi20 = new GameCard[0]; // Tamer
    private GameCard[] player2Digi21 = new GameCard[0]; // Tamer

    private GameCard[] player2Link1 = new GameCard[0];
    private GameCard[] player2Link2 = new GameCard[0];
    private GameCard[] player2Link3 = new GameCard[0];
    private GameCard[] player2Link4 = new GameCard[0];
    private GameCard[] player2Link5 = new GameCard[0];
    private GameCard[] player2Link6 = new GameCard[0];
    private GameCard[] player2Link7 = new GameCard[0];
    private GameCard[] player2Link8 = new GameCard[0];
    private GameCard[] player2Link9 = new GameCard[0];
    private GameCard[] player2Link10 = new GameCard[0];
    private GameCard[] player2Link11 = new GameCard[0];
    private GameCard[] player2Link12 = new GameCard[0];
    private GameCard[] player2Link13 = new GameCard[0];
    private GameCard[] player2Link14 = new GameCard[0];
    private GameCard[] player2Link15 = new GameCard[0];
    private GameCard[] player2Link16 = new GameCard[0];
}
