package com.github.wekaito.backend;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private static final String BASE_URL = "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/";

    private final CardRepo cardRepo;

    private final List<Card> cardCollection;

    private final Card fallbackCard = new Card(
            "1110101",
            "Fallback Card",
            "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/tokens/tokenCard.jpg",
            "Digimon",
            List.of("Unknown"),
            "Fallback",
            "1110101",
            List.of(new DigivolveCondition("Unknown", 0, 0)),
            null,
            "Rookie",
            List.of("Unknown"),
            0,
            0,
            1,
            "If you see this card, the actual card was not found.",
            null,
            null,
            null,
            null,
            null,
            null,
            new Restrictions("","","",""),
            null
    );

    private static final Gson gson = new Gson();

    public List<Card> getCards() {
        return cardCollection;
    }

    public Card getCardByUniqueCardNumber(String uniqueCardNumber) {
        return cardCollection.stream().filter(card -> uniqueCardNumber.equals(card.uniqueCardNumber())).findFirst().orElse(fallbackCard);
    }

    private final WebClient webClient = WebClient.builder()
            .baseUrl(BASE_URL)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.toString())
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

    @Scheduled(fixedRate = 10800000) // 3 hours
    void fetchCards() {
        
        String responseBody = webClient.get()
                .uri("assets/cardlists/PreparedDigimonCardsENG.json")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        Type listType = new TypeToken<List<FetchCard>>() {
        }.getType();
        List<FetchCard> fetchedCards = gson.fromJson(responseBody, listType);
        List<Card> cards = new ArrayList<>();

        assert fetchedCards != null;
        
        fetchedCards.forEach(card -> {
        List<DigivolveCondition> digivolveConditions = card.digivolveCondition().stream()
                .map(condition -> new DigivolveCondition(
                        condition.color(),
                        Integer.parseInt(condition.cost()),
                        !condition.level().equals("Tamer") ? Integer.parseInt(condition.level()) : null
                ))
                .toList();

        List<String> digiTypes = Arrays.stream(card.type().split("/")).toList();
        List<String> colors = Arrays.stream(card.color().split("/")).toList();

        cards.add(new Card(
                card.id(),
                card.name().english(),
                BASE_URL + card.cardImage(),
                card.cardType(),
                colors,
                (card.attribute().equals("-")) ? null : card.attribute(),
                (card.cardNumber().equals("-")) ? null : card.cardNumber(),
                digivolveConditions,
                (card.specialDigivolve().equals("-")) ? null : card.specialDigivolve(),
                (card.form().equals("-")) ? null : card.form(),
                digiTypes,
                (card.dp().equals("-")) ? null : Integer.parseInt(card.dp()),
                (card.playCost().equals("-")) ? null : Integer.parseInt(card.playCost()),
                (card.cardLv().equals("-")) ? null : Integer.parseInt(card.cardLv().split("\\.")[1]),
                (card.effect().equals("-")) ? null : card.effect(),
                (card.digivolveEffect().equals("-")) ? null : card.digivolveEffect(),
                (card.aceEffect().equals("-")) ? null : card.aceEffect(),
                (card.burstDigivolve().equals("-")) ? null : card.burstDigivolve(),
                (card.digiXros().equals("-")) ? null : card.digiXros(),
                (card.dnaDigivolve().equals("-")) ? null : card.dnaDigivolve(),
                (card.securityEffect().equals("-")) ? null : card.securityEffect(),
                card.restrictions(),
                card.illustrator()));
        });

        // CardRepo is a fail-safe in case the API is missing cards or shuts down
        for (Card repoCard : this.cardRepo.findAll()) {
            if (cards.stream().noneMatch(card -> card.cardNumber().equals(repoCard.cardNumber()))) {
                cards.add(repoCard);
            }
        }

        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(cards);

        if (cardCollection != cards) {
            cardCollection.clear();
            cardCollection.addAll(cards);
        }
    }
}
