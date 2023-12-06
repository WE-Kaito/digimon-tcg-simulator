package com.github.wekaito.backend;

import java.util.List;

public record Card(
        String name,
        String image_url,
        String card_type,
        List<String> color,
        String attribute,
        String cardnumber,
        List<DigivolveCondition> digivolve_conditions,
        String special_digivolve,
        String stage,
        List<String> digi_type,
        Integer dp,
        Integer play_cost,
        Integer level,
        String main_effect,
        String inherited_effect,
        String ace_effect,
        String burst_digivolve,
        String digi_xros,
        String dna_digivolve,
        String security_effect,
        String restriction_en,
        String restriction_jp,
        String illustrator

) {

}

record DigivolveCondition(
        String color,
        Integer cost,
        Integer level
) {

}