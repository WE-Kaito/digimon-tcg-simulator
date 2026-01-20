package com.github.wekaito.backend.websocket.game.models;

import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.Restrictions;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class GameCard {
    public String uniqueCardNumber;
    public String name;
    public String imgUrl;
    public String cardType;
    public List<String> color;
    public String attribute;
    public String cardNumber;
    public List<DigivolveCondition> digivolveConditions;
    public String specialDigivolve;
    public String stage;
    public List<String> digiType;
    public Integer dp;
    public Integer playCost;
    public Integer level;
    public String mainEffect;
    public String inheritedEffect;
    public String aceEffect;
    public String burstDigivolve;
    public String digiXros;
    public String dnaDigivolve;
    public String securityEffect;
    public Integer linkDP;
    public String linkEffect;
    public String linkRequirement;
    public String assemblyEffect;
    public Restrictions restrictions;
    public String illustrator;
    public UUID id;
    public Modifiers modifiers;
    public Boolean isTilted;
    public Boolean isFaceUp;

    public void tilt() {
        this.isTilted = !this.isTilted;
    }

    public void flip() {
        this.isFaceUp = !this.isFaceUp;
    }
}

