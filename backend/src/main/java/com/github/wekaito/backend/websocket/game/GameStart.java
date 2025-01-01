package com.github.wekaito.backend.websocket.game;

import java.util.List;

public record GameStart(
        List<GameCard> player1Hand,
        List<GameCard> player1DeckField,
        List<GameCard> player1EggDeck,
        List<GameCard> player1Security,
        List<GameCard> player2Hand,
        List<GameCard> player2DeckField,
        List<GameCard> player2EggDeck,
        List<GameCard> player2Security
) {
}
