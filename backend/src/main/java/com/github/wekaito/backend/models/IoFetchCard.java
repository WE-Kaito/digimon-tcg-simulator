package com.github.wekaito.backend.models;

import java.util.List;

public record IoFetchCard(
        String name,
        String type,
        String id,
        Integer level,
        Integer play_cost,
        Integer evolution_cost,
        String evolution_color,
        Integer evolution_level,
        String xros_req,
        String color,
        String color2,
        String digi_type,
        String digi_type2,
        String form,
        Integer dp,
        String attribute,
        String rarity,
        String stage,
        String artist,
        String main_effect,
        String source_effect,
        String alt_effect,
        String series,
        String pretty_url,
        String date_added,
        String tcgplayer_name,
        Integer tcgplayer_id,
        List<String> set_name
) {
}