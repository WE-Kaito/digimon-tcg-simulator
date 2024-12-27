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

    public List<Deck> getDecksByAuthorId(String authorId) {
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
