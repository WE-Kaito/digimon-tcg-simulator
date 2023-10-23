package com.github.wekaito.backend;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepo cardRepo;

    private final List<Card> cardCollection;

    public List<Card> getCards() {
        return cardCollection;
    }

    public Card getCardByCardumber(String cardnumber) {
        return cardCollection.stream().filter(card -> cardnumber.equals(card.cardnumber())).findFirst().orElse(null);
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

        List<Card> cards = new ArrayList<>(Arrays.asList(Objects.requireNonNull(Objects.requireNonNull(response).getBody())));
        String cardnumber = "EX5-012";
        Card replaceCard = cards.stream().filter(card -> cardnumber.equals(card.cardnumber())).findFirst().orElse(null);
        cards.removeIf(card -> cardnumber.equals(card.cardnumber()));
        cards.add(new Card(Objects.requireNonNull(replaceCard).name(), "Digimon", replaceCard.color(), replaceCard.image_url(), cardnumber, replaceCard.stage(), replaceCard.attribute(), replaceCard.digi_type(), replaceCard.dp(), replaceCard.play_cost(), replaceCard.evolution_cost(), replaceCard.level(), replaceCard.maineffect(), replaceCard.soureeffect()));
        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(cards);

        if (cardCollection != cards) {
            cardCollection.clear();
            cardCollection.addAll(cards);
        }
    }
}
