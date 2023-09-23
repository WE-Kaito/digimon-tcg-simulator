package com.github.wekaito.backend;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepo cardRepo;

    public Card[] getCards() {
        return cardRepo.findAll().toArray(new Card[0]);
    }

    public Card findByCardnumber(String cardnumber) {
        return cardRepo.findByCardnumber(cardnumber);
    }

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://digimoncard.io/api-public")
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(1024 * 1024 * 10))
                    .build())
            .build();

    @PostConstruct
    public void init() {
        fetchCards();
    }

    @Scheduled(fixedRate = 43200000) // 12 hours
    void fetchCards() {
        ResponseEntity<Card[]> response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search.php")
                        .queryParam("sort", "name")
                        .queryParam("series", "Digimon Card Game")
                        .build())
                .retrieve()
                .toEntity(Card[].class)
                .block();
        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(Arrays.asList(Objects.requireNonNull(Objects.requireNonNull(response).getBody())));
    }
}
