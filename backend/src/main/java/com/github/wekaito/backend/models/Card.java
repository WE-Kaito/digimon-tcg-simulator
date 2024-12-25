package com.github.wekaito.backend.models;

import java.util.List;

public record Card(
        String uniqueCardNumber,
        String name,
        String imgUrl,
        String cardType,
        List<String> color,
        String attribute,
        String cardNumber,
        List<DigivolveCondition> digivolveConditions,
        String specialDigivolve,
        String stage,
        List<String> digiType,
        Integer dp,
        Integer playCost,
        Integer level,
        String mainEffect,
        String inheritedEffect,
        String aceEffect,
        String burstDigivolve,
        String digiXros,
        String dnaDigivolve,
        String securityEffect,
        Restrictions restrictions,
        String illustrator

) {

}

