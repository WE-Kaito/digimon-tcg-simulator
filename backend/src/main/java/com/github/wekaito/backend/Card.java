package com.github.wekaito.backend;

import java.util.Optional;

public record Card(
        String name,
        String type,
        String color,
        String image_url,
        String cardnumber,
        Optional<String> stage,
        Optional<String> attribute,
        Optional<String> digi_type,
        Optional<Integer> dp,
        Optional<Integer> play_cost,
        Optional<Integer> evolution_cost,
        Optional<Integer> level,
        Optional<String> maineffect,
        Optional<String> soureeffect

) {
}

