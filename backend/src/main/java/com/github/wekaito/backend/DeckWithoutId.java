package com.github.wekaito.backend;

import java.util.Arrays;
import java.util.Objects;

public record DeckWithoutId(String name, Card[] cards) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeckWithoutId that = (DeckWithoutId) o;
        return Objects.equals(name, that.name) &&
                Arrays.equals(cards, that.cards);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, Arrays.hashCode(cards));
    }

    @Override
    public String toString() {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{");
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
