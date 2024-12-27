package com.github.wekaito.backend;

import java.util.List;

public record FetchCard(
        String id,
        Name name,
        String cardImage,
        String cardType,
        String color,
        String attribute,
        String cardNumber,
        List<FetchDigivolveCondition> digivolveCondition,
        String specialDigivolve,
        String form,
        String type,
        String dp,
        String playCost,
        String cardLv,
        String effect,
        String digivolveEffect,
        String aceEffect,
        String burstDigivolve,
        String digiXros,
        String dnaDigivolve,
        String securityEffect,
        Restrictions restrictions,
        String illustrator) {
}

record Name(
        String english
) {
}

record FetchDigivolveCondition(
        String color,
        String cost,
        String level
) {
}
