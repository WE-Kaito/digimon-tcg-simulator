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

        List<Card> cards = new ArrayList<>(Arrays.asList(Objects.requireNonNull(Objects.requireNonNull(response).getBody())));
        Card replaceCard1 = cards.stream().filter(card -> "EX5-020".equals(card.cardnumber())).findFirst().orElse(null);
        Card replaceCard2 = cards.stream().filter(card -> "EX5-012".equals(card.cardnumber())).findFirst().orElse(null);
        cards.removeIf(card -> "EX5-020".equals(card.cardnumber()));
        cards.removeIf(card -> "EX5-012".equals(card.cardnumber()));
        cards.add(new Card(replaceCard1.name(), "Digimon", replaceCard1.color(), replaceCard1.image_url(), "EX5-020", replaceCard1.stage(), replaceCard1.attribute(), replaceCard1.digi_type(), replaceCard1.dp(), replaceCard1.play_cost(), replaceCard1.evolution_cost(), replaceCard1.level(), replaceCard1.maineffect(), replaceCard1.soureeffect()));
        cards.add(new Card(replaceCard2.name(), "Digimon", replaceCard2.color(), replaceCard2.image_url(), "EX5-012", replaceCard2.stage(), replaceCard2.attribute(), replaceCard2.digi_type(), replaceCard2.dp(), replaceCard2.play_cost(), replaceCard2.evolution_cost(), replaceCard2.level(), replaceCard2.maineffect(), replaceCard2.soureeffect()));
        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(cards);

        if (cardCollection != cards) {
            cardCollection.clear();
            cardCollection.addAll(cards);
        }
    }
}
