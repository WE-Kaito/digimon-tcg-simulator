package com.github.wekaito.backend.websocket.game.models;

import lombok.Getter;
import lombok.Setter;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
//@Builder
public class BoardState {
    private int player1Memory = 0;
    private List<GameCard> player1Deck = new ArrayList<>();
    private List<GameCard> player1Hand = new ArrayList<>();
    private List<GameCard> player1EggDeck = new ArrayList<>();
    private List<GameCard> player1Trash = new ArrayList<>();
    private List<GameCard> player1Security = new ArrayList<>();
    private List<GameCard> player1Reveal = new ArrayList<>();
    private List<GameCard> player1BreedingArea = new ArrayList<>();

    private List<GameCard> player1OriginalHand; // Store original distribution for mulligan
    private List<GameCard> player1OriginalDeck; // Store original distribution for mulligan

    private List<GameCard> player1Digi1 = new ArrayList<>();
    private List<GameCard> player1Digi2 = new ArrayList<>();
    private List<GameCard> player1Digi3 = new ArrayList<>();
    private List<GameCard> player1Digi4 = new ArrayList<>();
    private List<GameCard> player1Digi5 = new ArrayList<>();
    private List<GameCard> player1Digi6 = new ArrayList<>();
    private List<GameCard> player1Digi7 = new ArrayList<>();
    private List<GameCard> player1Digi8 = new ArrayList<>();
    private List<GameCard> player1Digi9 = new ArrayList<>();
    private List<GameCard> player1Digi10 = new ArrayList<>();
    private List<GameCard> player1Digi11 = new ArrayList<>();
    private List<GameCard> player1Digi12 = new ArrayList<>();
    private List<GameCard> player1Digi13 = new ArrayList<>();
    private List<GameCard> player1Digi14 = new ArrayList<>();
    private List<GameCard> player1Digi15 = new ArrayList<>();
    private List<GameCard> player1Digi16 = new ArrayList<>();
    private List<GameCard> player1Digi17 = new ArrayList<>(); // Tamer
    private List<GameCard> player1Digi18 = new ArrayList<>(); // Tamer
    private List<GameCard> player1Digi19 = new ArrayList<>(); // Tamer
    private List<GameCard> player1Digi20 = new ArrayList<>(); // Tamer
    private List<GameCard> player1Digi21 = new ArrayList<>(); // Tamer

    private List<GameCard> player1Link1 = new ArrayList<>();
    private List<GameCard> player1Link2 = new ArrayList<>();
    private List<GameCard> player1Link3 = new ArrayList<>();
    private List<GameCard> player1Link4 = new ArrayList<>();
    private List<GameCard> player1Link5 = new ArrayList<>();
    private List<GameCard> player1Link6 = new ArrayList<>();
    private List<GameCard> player1Link7 = new ArrayList<>();
    private List<GameCard> player1Link8 = new ArrayList<>();
    private List<GameCard> player1Link9 = new ArrayList<>();
    private List<GameCard> player1Link10 = new ArrayList<>();
    private List<GameCard> player1Link11 = new ArrayList<>();
    private List<GameCard> player1Link12 = new ArrayList<>();
    private List<GameCard> player1Link13 = new ArrayList<>();
    private List<GameCard> player1Link14 = new ArrayList<>();
    private List<GameCard> player1Link15 = new ArrayList<>();
    private List<GameCard> player1Link16 = new ArrayList<>();

    private int player2Memory = 0;
    private List<GameCard> player2Deck = new ArrayList<>();
    private List<GameCard> player2Hand = new ArrayList<>();
    private List<GameCard> player2EggDeck = new ArrayList<>();
    private List<GameCard> player2Trash = new ArrayList<>();
    private List<GameCard> player2Security = new ArrayList<>();
    private List<GameCard> player2Reveal = new ArrayList<>();
    private List<GameCard> player2BreedingArea = new ArrayList<>();

    private List<GameCard> player2OriginalHand; // Store original distribution for mulligan
    private List<GameCard> player2OriginalDeck; // Store original distribution for mulligan

    private List<GameCard> player2Digi1 = new ArrayList<>();
    private List<GameCard> player2Digi2 = new ArrayList<>();
    private List<GameCard> player2Digi3 = new ArrayList<>();
    private List<GameCard> player2Digi4 = new ArrayList<>();
    private List<GameCard> player2Digi5 = new ArrayList<>();
    private List<GameCard> player2Digi6 = new ArrayList<>();
    private List<GameCard> player2Digi7 = new ArrayList<>();
    private List<GameCard> player2Digi8 = new ArrayList<>();
    private List<GameCard> player2Digi9 = new ArrayList<>();
    private List<GameCard> player2Digi10 = new ArrayList<>();
    private List<GameCard> player2Digi11 = new ArrayList<>();
    private List<GameCard> player2Digi12 = new ArrayList<>();
    private List<GameCard> player2Digi13 = new ArrayList<>();
    private List<GameCard> player2Digi14 = new ArrayList<>();
    private List<GameCard> player2Digi15 = new ArrayList<>();
    private List<GameCard> player2Digi16 = new ArrayList<>();
    private List<GameCard> player2Digi17 = new ArrayList<>(); // Tamer
    private List<GameCard> player2Digi18 = new ArrayList<>(); // Tamer
    private List<GameCard> player2Digi19 = new ArrayList<>(); // Tamer
    private List<GameCard> player2Digi20 = new ArrayList<>(); // Tamer
    private List<GameCard> player2Digi21 = new ArrayList<>(); // Tamer

    private List<GameCard> player2Link1 = new ArrayList<>();
    private List<GameCard> player2Link2 = new ArrayList<>();
    private List<GameCard> player2Link3 = new ArrayList<>();
    private List<GameCard> player2Link4 = new ArrayList<>();
    private List<GameCard> player2Link5 = new ArrayList<>();
    private List<GameCard> player2Link6 = new ArrayList<>();
    private List<GameCard> player2Link7 = new ArrayList<>();
    private List<GameCard> player2Link8 = new ArrayList<>();
    private List<GameCard> player2Link9 = new ArrayList<>();
    private List<GameCard> player2Link10 = new ArrayList<>();
    private List<GameCard> player2Link11 = new ArrayList<>();
    private List<GameCard> player2Link12 = new ArrayList<>();
    private List<GameCard> player2Link13 = new ArrayList<>();
    private List<GameCard> player2Link14 = new ArrayList<>();
    private List<GameCard> player2Link15 = new ArrayList<>();
    private List<GameCard> player2Link16 = new ArrayList<>();

    public List<GameCard> getFieldByName(String name) {
        try {
            Field field = this.getClass().getDeclaredField(name);
            field.setAccessible(true);
            return (List<GameCard>) field.get(this);
        } catch (NoSuchFieldException | IllegalAccessException e ) {
            System.out.println("No field found with name " + name + "/n" + e);
            return new ArrayList<>();
        }
    }

    public void setFieldByName(String name, List<GameCard> newCards) {
        try {
            Field field = this.getClass().getDeclaredField(name);
            field.setAccessible(true);
            field.set(this, newCards);
        } catch (NoSuchFieldException | IllegalAccessException e ) {
            System.out.println("No field found with name " + name + "/n" + e);
        }
    }
}
