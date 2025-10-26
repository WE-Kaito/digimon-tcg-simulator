package com.github.wekaito.backend.websocket.game;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.Restrictions;
import com.github.wekaito.backend.websocket.game.models.GameCard;
import com.github.wekaito.backend.websocket.game.models.Modifiers;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class CardJsonConverter {
    
    private final ObjectMapper objectMapper;
    
    public CardJsonConverter() {
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Converts a frontend CardTypeGame JSON object to a backend GameCard object
     */
    public GameCard convertToGameCard(String cardJson) throws Exception {
        JsonNode cardNode = objectMapper.readTree(cardJson);

        String idString = getStringField(cardNode, "id", "");
        UUID cardId = UUID.fromString(idString);

        String uniqueCardNumber = getStringField(cardNode, "uniqueCardNumber", "");
        String name = getStringField(cardNode, "name", "Unknown");
        String imgUrl = getStringField(cardNode, "imgUrl", "");
        String cardType = getStringField(cardNode, "cardType", "Digimon");
        List<String> color = getStringArrayField(cardNode, "color");
        String cardNumber = getStringField(cardNode, "cardNumber", "");

        String attribute = getStringField(cardNode, "attribute", null);
        String stage = getStringField(cardNode, "stage", null);
        String specialDigivolve = getStringField(cardNode, "specialDigivolve", null);
        Integer dp = getIntegerField(cardNode, "dp");
        Integer playCost = getIntegerField(cardNode, "playCost");
        Integer level = getIntegerField(cardNode, "level");
        String mainEffect = getStringField(cardNode, "mainEffect", null);
        String inheritedEffect = getStringField(cardNode, "inheritedEffect", null);
        String aceEffect = getStringField(cardNode, "aceEffect", null);
        String burstDigivolve = getStringField(cardNode, "burstDigivolve", null);
        String digiXros = getStringField(cardNode, "digiXros", null);
        String dnaDigivolve = getStringField(cardNode, "dnaDigivolve", null);
        String securityEffect = getStringField(cardNode, "securityEffect", null);
        Integer linkDP = getIntegerField(cardNode, "linkDP");
        String linkEffect = getStringField(cardNode, "linkEffect", null);
        String linkRequirement = getStringField(cardNode, "linkRequirement", null);
        String assemblyEffect = getStringField(cardNode, "assemblyEffect", null);
        String illustrator = getStringField(cardNode, "illustrator", "");

        Boolean isTilted = getBooleanField(cardNode, "isTilted", false);
        Boolean isFaceUp = getBooleanField(cardNode, "isFaceUp", true);

        List<String> digiType = getStringArrayField(cardNode, "digiType");
        List<DigivolveCondition> digivolveConditions = parseDigivolveConditions(cardNode.get("digivolveConditions"));
        Restrictions restrictions = parseRestrictions(cardNode.get("restrictions"));

        Modifiers modifiers = parseModifiers(cardNode.get("modifiers"));

        return new GameCard(
            uniqueCardNumber, name, imgUrl, cardType, color, attribute, cardNumber,
            digivolveConditions, specialDigivolve, stage, digiType, dp, playCost, level,
            mainEffect, inheritedEffect, aceEffect, burstDigivolve, digiXros, dnaDigivolve,
            securityEffect, linkDP, linkEffect, linkRequirement, assemblyEffect,
            restrictions, illustrator, cardId, modifiers, isTilted, isFaceUp
        );
    }
    
    private String getStringField(JsonNode node, String fieldName, String defaultValue) {
        JsonNode fieldNode = node.get(fieldName);
        return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asText() : defaultValue;
    }
    
    private Integer getIntegerField(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.get(fieldName);
        return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asInt() : null;
    }
    
    private Boolean getBooleanField(JsonNode node, String fieldName, Boolean defaultValue) {
        JsonNode fieldNode = node.get(fieldName);
        return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asBoolean() : defaultValue;
    }
    
    private List<String> getStringArrayField(JsonNode node, String fieldName) {
        JsonNode arrayNode = node.get(fieldName);
        List<String> result = new ArrayList<>();
        
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode element : arrayNode) {
                result.add(element.asText());
            }
        }
        
        return result;
    }
    
    private List<DigivolveCondition> parseDigivolveConditions(JsonNode conditionsNode) {
        List<DigivolveCondition> conditions = new ArrayList<>();
        
        if (conditionsNode != null && conditionsNode.isArray()) {
            for (JsonNode conditionNode : conditionsNode) {
                try {
                    String color = getStringField(conditionNode, "color", "");
                    Integer cost = getIntegerField(conditionNode, "cost");
                    Integer level = getIntegerField(conditionNode, "level");
                    
                    DigivolveCondition condition = new DigivolveCondition(color, cost, level);
                    conditions.add(condition);
                } catch (Exception e) {
                    // Skip invalid digivolve conditions
                }
            }
        }
        
        return conditions;
    }
    
    private Restrictions parseRestrictions(JsonNode restrictionsNode) {
        if (restrictionsNode == null || restrictionsNode.isNull()) {
            return new Restrictions("", "", "", "");
        }
        
        String chinese = getStringField(restrictionsNode, "chinese", "");
        String english = getStringField(restrictionsNode, "english", "");
        String japanese = getStringField(restrictionsNode, "japanese", "");
        String korean = getStringField(restrictionsNode, "korean", "");
        
        return new Restrictions(chinese, english, japanese, korean);
    }
    
    private Modifiers parseModifiers(JsonNode modifiersNode) {
        if (modifiersNode == null || modifiersNode.isNull()) {
            return new Modifiers(0, 0, new ArrayList<>(), new ArrayList<>());
        }
        
        Integer plusDp = getIntegerField(modifiersNode, "plusDp");
        Integer plusSecurityAttacks = getIntegerField(modifiersNode, "plusSecurityAttacks");
        List<String> keywords = getStringArrayField(modifiersNode, "keywords");
        List<String> colors = getStringArrayField(modifiersNode, "colors");
        
        return new Modifiers(plusDp, plusSecurityAttacks, keywords, colors);
    }
}
