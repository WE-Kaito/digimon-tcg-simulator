package com.github.wekaito.backend;

import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Arrays;
import java.util.Objects;

@Document("decks")
public record Deck(String id, String name, Card[] cards) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Deck deck = (Deck) o;
        return Objects.equals(id, deck.id) &&
                Objects.equals(name, deck.name) &&
                Arrays.equals(cards, deck.cards);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, Arrays.hashCode(cards));
    }

    @Override
    public String toString() {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{");
        jsonBuilder.append("\"id\":\"").append(id).append("\",");
        jsonBuilder.append("\"name\":\"").append(name).append("\",");
        jsonBuilder.append("\"cards\":[");
        for (int i = 0; i < cards.length; i++) {
            Card card = cards[i];
            jsonBuilder.append("{");
            jsonBuilder.append("\"name\":\"").append(card.name()).append("\",");
            jsonBuilder.append("\"type\":\"").append(card.type()).append("\",");
            jsonBuilder.append("\"color\":\"").append(card.color()).append("\",");
            jsonBuilder.append("\"image_url\":\"").append(card.image_url()).append("\",");
            jsonBuilder.append("\"cardnumber\":\"").append(card.cardnumber()).append("\",");
            jsonBuilder.append("\"stage\":\"").append(card.stage()).append("\",");
            jsonBuilder.append("\"attribute\":\"").append(card.attribute()).append("\",");
            jsonBuilder.append("\"digi_type\":\"").append(card.digi_type()).append("\",");
            jsonBuilder.append("\"dp\":").append(card.dp()).append(",");
            jsonBuilder.append("\"play_cost\":").append(card.play_cost()).append(",");
            jsonBuilder.append("\"evolution_cost\":").append(card.evolution_cost()).append(",");
            jsonBuilder.append("\"level\":").append(card.level()).append(",");
            jsonBuilder.append("\"maineffect\":\"").append(card.maineffect()).append("\",");
            jsonBuilder.append("\"soureeffect\":\"").append(card.soureeffect()).append("\"");
            jsonBuilder.append("}");
            if (i < cards.length - 1) {
                jsonBuilder.append(",");
            }
        }
        jsonBuilder.append("],");
        jsonBuilder.append("}");
        return jsonBuilder.toString();
    }
}
