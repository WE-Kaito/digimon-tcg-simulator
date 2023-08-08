package com.github.wekaito.backend.websocket;

import java.util.Arrays;
import java.util.Objects;

public record Game(
        int memory,

        GameCard[] player1Hand,
        GameCard[] player1DeckField,
        GameCard[] player1EggDeck,
        GameCard[] player1Trash,
        GameCard[] player1Security,
        GameCard[] player1Tamer,

        GameCard[] player1Digi1,
        GameCard[] player1Digi2,
        GameCard[] player1Digi3,
        GameCard[] player1Digi4,
        GameCard[] player1Digi5,
        GameCard[] player1BreedingArea,

        GameCard[] player2Hand,
        GameCard[] player2DeckField,
        GameCard[] player2EggDeck,
        GameCard[] player2Trash,
        GameCard[] player2Security,
        GameCard[] player2Tamer,

        GameCard[] player2Digi1,
        GameCard[] player2Digi2,
        GameCard[] player2Digi3,
        GameCard[] player2Digi4,
        GameCard[] player2Digi5,
        GameCard[] player2BreedingArea,

        GameCard[] player1Delay,
        GameCard[] player2Delay
) {
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Game game = (Game) o;
        return memory == game.memory &&
                Arrays.deepEquals(player1Hand, game.player1Hand) &&
                Arrays.deepEquals(player1DeckField, game.player1DeckField) &&
                Arrays.deepEquals(player1EggDeck, game.player1EggDeck) &&
                Arrays.deepEquals(player1Trash, game.player1Trash) &&
                Arrays.deepEquals(player1Security, game.player1Security) &&
                Arrays.deepEquals(player1Tamer, game.player1Tamer) &&
                Arrays.deepEquals(player1Digi1, game.player1Digi1) &&
                Arrays.deepEquals(player1Digi2, game.player1Digi2) &&
                Arrays.deepEquals(player1Digi3, game.player1Digi3) &&
                Arrays.deepEquals(player1Digi4, game.player1Digi4) &&
                Arrays.deepEquals(player1Digi5, game.player1Digi5) &&
                Arrays.deepEquals(player1BreedingArea, game.player1BreedingArea) &&
                Arrays.deepEquals(player2Hand, game.player2Hand) &&
                Arrays.deepEquals(player2DeckField, game.player2DeckField) &&
                Arrays.deepEquals(player2EggDeck, game.player2EggDeck) &&
                Arrays.deepEquals(player2Trash, game.player2Trash) &&
                Arrays.deepEquals(player2Security, game.player2Security) &&
                Arrays.deepEquals(player2Tamer, game.player2Tamer) &&
                Arrays.deepEquals(player2Digi1, game.player2Digi1) &&
                Arrays.deepEquals(player2Digi2, game.player2Digi2) &&
                Arrays.deepEquals(player2Digi3, game.player2Digi3) &&
                Arrays.deepEquals(player2Digi4, game.player2Digi4) &&
                Arrays.deepEquals(player2Digi5, game.player2Digi5) &&
                Arrays.deepEquals(player2BreedingArea, game.player2BreedingArea) &&
                Arrays.deepEquals(player1Delay, game.player1Delay) &&
                Arrays.deepEquals(player2Delay, game.player2Delay);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                memory,
                Arrays.hashCode(player1Hand),
                Arrays.hashCode(player1DeckField),
                Arrays.hashCode(player1EggDeck),
                Arrays.hashCode(player1Trash),
                Arrays.hashCode(player1Security),
                Arrays.hashCode(player1Tamer),
                Arrays.hashCode(player1Digi1),
                Arrays.hashCode(player1Digi2),
                Arrays.hashCode(player1Digi3),
                Arrays.hashCode(player1Digi4),
                Arrays.hashCode(player1Digi5),
                Arrays.hashCode(player1BreedingArea),
                Arrays.hashCode(player2Hand),
                Arrays.hashCode(player2DeckField),
                Arrays.hashCode(player2EggDeck),
                Arrays.hashCode(player2Trash),
                Arrays.hashCode(player2Security),
                Arrays.hashCode(player2Tamer),
                Arrays.hashCode(player2Digi1),
                Arrays.hashCode(player2Digi2),
                Arrays.hashCode(player2Digi3),
                Arrays.hashCode(player2Digi4),
                Arrays.hashCode(player2Digi5),
                Arrays.hashCode(player2BreedingArea),
                Arrays.hashCode(player1Delay),
                Arrays.hashCode(player2Delay)
        );
    }

    @Override
    public String toString() {
        return "Game{" +
                "memory='" + memory +'\'' +
                ", player1Hand='" + Arrays.toString(player1Hand) +'\'' +
                ", player1DeckField='" + Arrays.toString(player1DeckField) +'\'' +
                ", player1EggDeck='" + Arrays.toString(player1EggDeck) +'\'' +
                ", player1Trash='" + Arrays.toString(player1Trash) +'\'' +
                ", player1Security='" + Arrays.toString(player1Security) +'\'' +
                ", player1Tamer='" + Arrays.toString(player1Tamer) +'\'' +
                ", player1Digi1='" + Arrays.toString(player1Digi1) +'\'' +
                ", player1Digi2='" + Arrays.toString(player1Digi2) +'\'' +
                ", player1Digi3='" + Arrays.toString(player1Digi3) +'\'' +
                ", player1Digi4='" + Arrays.toString(player1Digi4) +'\'' +
                ", player1Digi5='" + Arrays.toString(player1Digi5) +'\'' +
                ", player1BreedingArea='" + Arrays.toString(player1BreedingArea) +'\'' +
                ", player2Hand='" + Arrays.toString(player2Hand) +'\'' +
                ", player2DeckField='" + Arrays.toString(player2DeckField) +'\'' +
                ", player2EggDeck='" + Arrays.toString(player2EggDeck) +'\'' +
                ", player2Trash='" + Arrays.toString(player2Trash) +'\'' +
                ", player2Security='" + Arrays.toString(player2Security) +'\'' +
                ", player2Tamer='" + Arrays.toString(player2Tamer) +'\'' +
                ", player2Digi1='" + Arrays.toString(player2Digi1) +'\'' +
                ", player2Digi2='" + Arrays.toString(player2Digi2) +'\'' +
                ", player2Digi3='" + Arrays.toString(player2Digi3) +'\'' +
                ", player2Digi4='" + Arrays.toString(player2Digi4) +'\'' +
                ", player2Digi5='" + Arrays.toString(player2Digi5) +'\'' +
                ", player2BreedingArea='" + Arrays.toString(player2BreedingArea) +'\'' +
                ", player1Delay='" + Arrays.toString(player1Delay) +'\'' +
                ", player2Delay='" + Arrays.toString(player2Delay) +'\'' +
                '}';
    }
}
