package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.Deck;
import com.github.wekaito.backend.models.DeckWithoutId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckRepo deckRepo;

    private final CardService cardService;

    private final UserIdService userIdService;

    public void addDeck(DeckWithoutId deckWithoutId) {
        Deck deckToSave = new Deck(
                UUID.randomUUID().toString(),
                deckWithoutId.name(),
                deckWithoutId.decklist(),
                deckWithoutId.deckImageCardUrl(),
                deckWithoutId.sleeveName(),
                deckWithoutId.isAllowed_en(),
                deckWithoutId.isAllowed_jp(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public void addStarterDecksForNewUser(String newUserId, String firstDeckId) {
        Deck gallantmonDeck = new Deck(
                firstDeckId,
                "[STARTER] Gallantmon",
                StarterDeckService.GALLANTMON,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST7-09.webp",
                "Guilmon",
                true,
                true,
                newUserId
        );

        Deck beelzemonDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Beelzemon",
                StarterDeckService.BEELZEMON,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST14-10.webp",
                "Impmon",
                true,
                true,
                newUserId
        );

        Deck dragonOfCourageDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Dragon Of Courage",
                StarterDeckService.DRAGON_OF_COURAGE,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST15-12.webp",
                "Agumon",
                true,
                true,
                newUserId
        );

        Deck vortexWarriorsDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Vortex Warriors",
                StarterDeckService.DRAGON_OF_COURAGE,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/P-038_P4-J.webp",
                "Pteromon",
                true,
                true,
                newUserId
        );

        this.deckRepo.saveAll(List.of(
                gallantmonDeck,
                beelzemonDeck,
                dragonOfCourageDeck,
                vortexWarriorsDeck
        ));
    }

    public List<Deck> getDecksByAuthorId(String authorId) {
        System.out.println("Fetching decks for author ID: " + authorId);
        return deckRepo.findByAuthorId(authorId);
    }

    public void updateDeck(String id, @Valid DeckWithoutId deckWithoutId) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                deckWithoutId.name(),
                deckWithoutId.decklist(),
                existingDeck.deckImageCardUrl(),
                existingDeck.sleeveName(),
                deckWithoutId.isAllowed_en(),
                deckWithoutId.isAllowed_jp(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public Deck getDeckById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        return optionalDeck.orElse(null);
    }

    public List<Card> getDeckCardsById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        List<Card> cards = new ArrayList<>();
        if (optionalDeck.isPresent()) {
            Deck deck = optionalDeck.get();
            for (String uniqueCardNumber : deck.decklist()) {
                Card card = cardService.getCardByUniqueCardNumber(uniqueCardNumber);

                // If the alt art card is not found replace it with the regular card
                if (card == null && uniqueCardNumber.contains("_")) {
                    String cardNumber = uniqueCardNumber.split("_")[0];
                    card = cardService.getCardByUniqueCardNumber(cardNumber);
                }

                // Add the card (either the complete one or the fallback) to the list
                if (card != null) {
                    cards.add(card);
                }
            }
        }
        else throw new IllegalArgumentException();

        return cards;
    }

    public void deleteDeck(String id) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        this.deckRepo.deleteById(id);
    }

    public void updateDeckImage(String id, String imageUrl) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                existingDeck.name(),
                existingDeck.decklist(),
                imageUrl,
                existingDeck.sleeveName(),
                existingDeck.isAllowed_en(),
                existingDeck.isAllowed_jp(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public void updateDeckSleeve(String id, String sleeveName) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                existingDeck.name(),
                existingDeck.decklist(),
                existingDeck.deckImageCardUrl(),
                sleeveName,
                existingDeck.isAllowed_en(),
                existingDeck.isAllowed_jp(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public String getDeckSleeveById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        if (optionalDeck.isEmpty()) throw new IllegalArgumentException();
        return optionalDeck.get().sleeveName();
    }

}

