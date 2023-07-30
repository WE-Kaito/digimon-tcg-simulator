package com.github.wekaito.backend;

import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;

public class DeckUtils {

    public static String deckToString(String id, String name, Card[] cards) {
        String cardsJson = Arrays.stream(cards)
                .map(card -> cardToString(card))
                .collect(Collectors.joining(","));

        return "{\"id\":\"" + id + "\",\"name\":\"" + name + "\",\"cards\":[" + cardsJson + "]}";
    }

    public static String deckWithoutIdToString(String name, Card[] cards) {
        String cardsJson = Arrays.stream(cards)
                .map(card -> cardToString(card))
                .collect(Collectors.joining(","));

        return "{\"name\":\"" + name + "\",\"cards\":[" + cardsJson + "]}";
    }

    public static String cardToString(Card card) {
        return "{\"name\":\"" + card.name() + "\",\"type\":\"" + card.type() + "\",\"color\":\"" + card.color()
                + "\",\"image_url\":\"" + card.image_url() + "\",\"cardnumber\":\"" + card.cardnumber()
                + "\",\"stage\":\"" + card.stage() + "\",\"attribute\":\"" + card.attribute() + "\",\"digi_type\":\""
                + card.digi_type() + "\",\"dp\":" + card.dp() + ",\"play_cost\":" + card.play_cost()
                + ",\"evolution_cost\":" + card.evolution_cost() + ",\"level\":" + card.level() + ",\"maineffect\":\""
                + card.maineffect() + "\",\"soureeffect\":\"" + card.soureeffect() + "\"}";
    }

    public static int hashCode(Deck deck) {
        return Objects.hash(deck.id(), deck.name(), Arrays.hashCode(deck.cards()));
    }

    public static int hashCode(DeckWithoutId deckWithoutId) {
        return Objects.hash(deckWithoutId.name(), Arrays.hashCode(deckWithoutId.cards()));
    }

    public static boolean areDecksEqual(Deck deck1, Deck deck2) {
        if (deck1 == deck2) return true;
        if (deck1 == null || deck2 == null) return false;

        return Objects.equals(deck1.id(), deck2.id()) &&
                Objects.equals(deck1.name(), deck2.name()) &&
                Arrays.equals(deck1.cards(), deck2.cards());
    }

    public static boolean areDecksWithoutIdEqual(DeckWithoutId deck1, DeckWithoutId deck2) {
        if (deck1 == deck2) return true;
        if (deck1 == null || deck2 == null) return false;

        return Objects.equals(deck1.name(), deck2.name()) &&
                Arrays.equals(deck1.cards(), deck2.cards());
    }
}
