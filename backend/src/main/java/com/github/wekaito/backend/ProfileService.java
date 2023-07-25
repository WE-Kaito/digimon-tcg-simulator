package com.github.wekaito.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://digimoncard.io/api-public")
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(1024 * 1024 * 10))
                    .build())
            .build();

    Card[] fetchCards() {
        ResponseEntity<Card[]> response = webClient.get()
                .uri("/search.php?sort=name&series=Digimon Card Game")
                .retrieve()
                .toEntity(Card[].class)
                .block();
        return Objects.requireNonNull(response).getBody();
    }
}
