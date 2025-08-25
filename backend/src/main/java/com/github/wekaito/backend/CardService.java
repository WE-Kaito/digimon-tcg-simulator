package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.FetchCard;
import com.github.wekaito.backend.models.Restrictions;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {

    private static final String BASE_URL = "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/";

    private final CardRepo cardRepo;

    private final List<Card> cardCollection;

    private final Card fallbackCard = new Card(
            "1110101", // fallbackCardNumber defined in useGeneralStates.ts
            "Fallback Card",
            "https://raw.githubusercontent.com/WE-Kaito/digimon-tcg-simulator/main/frontend/src/assets/tokens/tokenCard.jpg",
            "Digimon",
            List.of("Unknown"),
            "Fallback",
            "1110101", // fallbackCardNumber defined in useGeneralStates.ts
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

    @Scheduled(fixedRate = 3600000) // 1hour
    void fetchCards() {
        String responseBody = null;
        try (InputStream inputStream = getClass().getResourceAsStream("/cardFallback.json")) {
            if (inputStream != null) {
                responseBody = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.error("Failed to read cardFallback.json", e);
            return;
        }

        if (responseBody == null) {
            log.error("cardFallback.json not found in resources");
            return;
        }

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
                            condition.level().matches("\\d+") ? Integer.parseInt(condition.level()) : null
                    ))
                    .toList();

            List<String> digiTypes = Arrays.stream(card.type().split("/")).toList();
            List<String> colors = Arrays.stream(card.color().split("/")).toList();

            if(!card.name().english().equals("[[:Category:|]]")) {
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
                        (card.rule().equals("-")) ? null : card.rule(),
                        (card.linkDP().equals("-") ? null : Integer.parseInt(card.linkDP().replaceAll("[^\\d-]", ""))),
                        (card.linkEffect().equals("-")) ? null : card.linkEffect(),
                        (card.linkRequirement().equals("-")) ? null : card.linkRequirement(),
                        (card.assembly().equals("-")) ? null : card.assembly(),
                        card.restrictions(),
                        card.illustrator()));
            }
        });

        // CardRepo is a fail-safe in case the API is missing cards or shuts down
        for (Card repoCard : this.cardRepo.findAll()) {
            if(!repoCard.name().equals("[[:Category:|]]")) {
                if (cards.stream().noneMatch(card -> card.uniqueCardNumber().equals(repoCard.uniqueCardNumber()))) {
                    cards.add(repoCard);
                }
            }
        }

        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(cards);

        cardCollection.clear();
        cardCollection.addAll(cards);
    }
}
