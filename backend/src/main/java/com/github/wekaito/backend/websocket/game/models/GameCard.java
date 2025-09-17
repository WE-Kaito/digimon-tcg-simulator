package com.github.wekaito.backend.websocket.game.models;

import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.Restrictions;

import java.util.List;
import java.util.UUID;

public record GameCard (
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
        Integer linkDP,
        String linkEffect,
        String linkRequirement,
        String assemblyEffect,
        Restrictions restrictions,
        String illustrator,
        UUID id,
        Modifiers modifiers,
        Boolean isTilted,
        Boolean isFaceUp
) {

}

