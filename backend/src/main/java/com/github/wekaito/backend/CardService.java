package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.DigivolveCondition;
import com.github.wekaito.backend.models.FetchCard;
import com.github.wekaito.backend.models.IoFetchCard;
import com.github.wekaito.backend.models.Restrictions;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class CardService {

    private static final String BASE_URL = "https://raw.githubusercontent.com/TakaOtaku/Digimon-Cards/refs/heads/main/src/";
    private static final String EX10_API_URL = "https://digimoncard.io/api-public/search.php?pack=ex-10";
    private static final String BT22_API_URL = "https://digimoncard.io/api-public/search.php?pack=bt-22";
    private static final String IMAGE_BASE_URL = "https://images.digimoncard.io/images/cards/{card-id}.jpg";

    private final CardRepo cardRepo;
    private final ImageDownloader imageDownloader;

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

    private final WebClient webClient = WebClient.builder()
            .baseUrl(BASE_URL)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.toString())
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(1024 * 1024 * 100)) // 100MB
                    .build())
            .build();

    private final WebClient fallbackWebClient = WebClient.builder()
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.toString())
            .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Digimon TCG Simulator)")
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(1024 * 1024 * 100)) // 100MB
                    .build())
            .build();

    @PostConstruct
    public void init() {
        fetchCards();
    }

    @Scheduled(fixedRate = 3600000) // 1hour
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
                            condition.level().matches("\\d+") ? Integer.parseInt(condition.level()) : null
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
                    (card.rule().equals("-")) ? null : card.rule(),
                    (card.linkDP().equals("-") ? null : Integer.parseInt(card.linkDP().replaceAll("[^\\d-]", ""))),
                    (card.linkEffect().equals("-")) ? null : card.linkEffect(),
                    (card.linkRequirement().equals("-")) ? null : card.linkRequirement(),
                    (card.assembly().equals("-")) ? null : card.assembly(),
                    card.restrictions(),
                    card.illustrator()));
        });

        // Remove any existing EX10 and BT22 cards that might be in the main source
        // Check multiple fields since the main source might use different formats
        int originalSize = cards.size();
        cards.removeIf(card -> {
            boolean isEX10OrBT22 = isEX10OrBT22Card(card);
            if (isEX10OrBT22) {
                log.info("Removing EX10/BT22 card from main source: {} ({})", card.name(), card.uniqueCardNumber());
            }
            return isEX10OrBT22;
        });
        int removedCount = originalSize - cards.size();
        log.info("Removed {} EX10/BT22 cards from main source", removedCount);

        // Fetch fallback cards for EX10 and BT22 sets
        List<Card> fallbackCards = fetchFallbackCards();
        log.info("Adding {} fallback cards to collection", fallbackCards.size());
        cards.addAll(fallbackCards);
        
        // Copy images to production directory if needed
        imageDownloader.copyImagesToProduction();

        // CardRepo is a fail-safe in case the API is missing cards or shuts down
        // But exclude EX10/BT22 cards from repository fallback since we have fresh data
        for (Card repoCard : this.cardRepo.findAll()) {
            if (cards.stream().noneMatch(card -> card.cardNumber().equals(repoCard.cardNumber())) &&
                !isEX10OrBT22Card(repoCard)) {
                cards.add(repoCard);
            }
        }

        this.cardRepo.deleteAll();
        this.cardRepo.saveAll(cards);

        cardCollection.clear();
        cardCollection.addAll(cards);
    }

    private List<Card> fetchFallbackCards() {
        List<Card> allFallbackCards = new ArrayList<>();
        
        // Fetch EX10 cards
        allFallbackCards.addAll(fetchCardsFromUrl(EX10_API_URL, "EX10"));
        
        // Fetch BT22 cards
        allFallbackCards.addAll(fetchCardsFromUrl(BT22_API_URL, "BT22"));
        
        log.info("Total fallback cards fetched: {} (EX10: {}, BT22: {})", 
            allFallbackCards.size(),
            allFallbackCards.stream().filter(c -> c.uniqueCardNumber().startsWith("EX10-")).count(),
            allFallbackCards.stream().filter(c -> c.uniqueCardNumber().startsWith("BT22-")).count());

        // Download images asynchronously
        List<String> cardIds = allFallbackCards.stream()
                .map(Card::uniqueCardNumber)
                .toList();
        
        new Thread(() -> imageDownloader.downloadImagesAsync(cardIds, IMAGE_BASE_URL))
                .start();

        return allFallbackCards;
    }

    private List<Card> fetchCardsFromUrl(String apiUrl, String setName) {
        try {
            log.info("Fetching {} cards from digimoncard.io API", setName);
            String responseBody = fallbackWebClient.get()
                    .uri(apiUrl)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Type listType = new TypeToken<List<IoFetchCard>>() {}.getType();
            List<IoFetchCard> fetchedCards = gson.fromJson(responseBody, listType);
            
            if (fetchedCards == null) {
                log.warn("No {} cards received from API", setName);
                return List.of();
            }

            log.info("Received {} {} cards from API", fetchedCards.size(), setName);

            // Convert all cards from this set
            List<Card> convertedCards = fetchedCards.stream()
                    .map(this::convertIoFetchCardToCard)
                    .toList();

            log.info("Converted {} {} cards", convertedCards.size(), setName);
            return convertedCards;
            
        } catch (Exception e) {
            log.error("Failed to fetch {} cards: {}", setName, e.getMessage(), e);
            return List.of();
        }
    }

    private Card convertIoFetchCardToCard(IoFetchCard ioCard) {
        // Build color list
        List<String> colors = new ArrayList<>();
        if (ioCard.color() != null && !ioCard.color().isEmpty()) {
            colors.add(ioCard.color());
        }
        if (ioCard.color2() != null && !ioCard.color2().isEmpty()) {
            colors.add(ioCard.color2());
        }

        // Build digi type list
        List<String> digiTypes = new ArrayList<>();
        if (ioCard.digi_type() != null && !ioCard.digi_type().isEmpty()) {
            digiTypes.add(ioCard.digi_type());
        }
        if (ioCard.digi_type2() != null && !ioCard.digi_type2().isEmpty()) {
            digiTypes.add(ioCard.digi_type2());
        }

        // Create digivolve conditions (empty for now, as IoFetchCard doesn't have this info)
        List<DigivolveCondition> digivolveConditions = new ArrayList<>();
        if (ioCard.evolution_cost() != null) {
            digivolveConditions.add(new DigivolveCondition(
                    colors.get(0), // Use the first color as the main color
                    ioCard.evolution_cost(),
                    1
            ));
        }

        return new Card(
                ioCard.id(),                                    // uniqueCardNumber
                ioCard.name(),                                  // name
                imageDownloader.getLocalImagePath(ioCard.id()), // imgUrl - local path
                ioCard.type(),                                  // cardType
                colors,                                         // color
                ioCard.attribute(),                             // attribute
                ioCard.id(),                                    // cardNumber
                digivolveConditions,                            // digivolveConditions
                ioCard.alt_effect(),                            // specialDigivolve
                ioCard.form(),                                  // stage
                digiTypes,                                      // digiType
                ioCard.dp(),                                    // dp
                ioCard.play_cost(),                             // playCost
                ioCard.level(),                                 // level
                ioCard.main_effect(),                           // mainEffect
                ioCard.source_effect().startsWith("Link Requirements") || ioCard.source_effect().startsWith("Ace Overflow") ? null : ioCard.source_effect(),// inheritedEffect
                ioCard.source_effect().startsWith("Ace Overflow") ? ioCard.source_effect() : null,// aceEffect
                null,                                           // burstDigivolve
                ioCard.xros_req().startsWith("[App") || ioCard.xros_req().startsWith("[Digivolve") ? null : ioCard.xros_req(),// digiXros
                null,                                           // dnaDigivolve
                null,                                           // securityEffect
                null,                                           // rule
                ioCard.source_effect().startsWith("Link Requirements") ? 0 : null,                                           // linkDP
                ioCard.source_effect().startsWith("Link Requirements") ? "FALLBACK: see image" : null, // linkEffect
                ioCard.source_effect().startsWith("Link Requirements") ? ioCard.source_effect() : null,// linkRequirement
                null,                                           // assemblyEffect
                new Restrictions("", "", "", ""),               // restrictions
                ioCard.artist()                                 // illustrator
        );
    }

    private boolean isEX10OrBT22Card(Card card) {
        // Check multiple fields for EX10 or BT22 identification
        return (card.uniqueCardNumber() != null && 
                (card.uniqueCardNumber().startsWith("EX10-") || 
                 card.uniqueCardNumber().startsWith("BT22-") ||
                 card.uniqueCardNumber().contains("EX10") ||
                 card.uniqueCardNumber().contains("BT22"))) ||
               (card.cardNumber() != null && 
                (card.cardNumber().startsWith("EX10-") || 
                 card.cardNumber().startsWith("BT22-") ||
                 card.cardNumber().contains("EX10") ||
                 card.cardNumber().contains("BT22"))) ||
               (card.name() != null && 
                (card.name().contains("EX10") || card.name().contains("BT22"))) ||
               // Check image URL path for set identifiers
               (card.imgUrl() != null && 
                (card.imgUrl().contains("EX10") || card.imgUrl().contains("BT22") ||
                 card.imgUrl().contains("ex10") || card.imgUrl().contains("bt22")));
    }
}
