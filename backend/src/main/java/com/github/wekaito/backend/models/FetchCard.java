package com.github.wekaito.backend.models;

import java.util.List;

public record FetchCard(
        String id,
        FetchCardName name,
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

