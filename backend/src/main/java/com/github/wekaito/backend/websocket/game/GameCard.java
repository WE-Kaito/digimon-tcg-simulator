package com.github.wekaito.backend.websocket.game;

import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.Restrictions;

import java.util.List;

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
        Restrictions restrictions,
        String illustrator,
        String id,
        Modifiers modifiers,
        Boolean isTilted
) {

}

record Modifiers(
        Integer plusDp,
        Integer plusSecurityAttacks,
        List<String> keywords,
        List<String> colors
) {
}
