package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Card;
import com.github.wekaito.backend.models.Deck;
import com.github.wekaito.backend.models.DeckCreateDto;
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

    public void addDeck(DeckCreateDto deckWithoutId) {
        Deck deckToSave = new Deck(
                UUID.randomUUID().toString(),
                deckWithoutId.name(),
                deckWithoutId.mainDeckList(),
                deckWithoutId.eggDeckList(),
                deckWithoutId.deckImageCardUrl(),
                deckWithoutId.mainSleeveName(),
                deckWithoutId.eggSleeveName(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public List<Deck> getDecksByAuthorId(String authorId) {
        return deckRepo.findByAuthorId(authorId);
    }

    public void updateDeck(String id, @Valid DeckCreateDto deckWithoutId) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                deckWithoutId.name(),
                deckWithoutId.mainDeckList(),
                deckWithoutId.eggDeckList(),
                existingDeck.deckImageCardUrl(),
                existingDeck.mainSleeveName(),
                existingDeck.eggSleeveName(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public Deck getDeckById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        return optionalDeck.orElse(null);
    }

    public List<Card> getMainDeckCardsById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        List<Card> cards = new ArrayList<>();
        if (optionalDeck.isPresent()) {
            Deck deck = optionalDeck.get();
            for (String uniqueCardNumber : deck.mainDeckList()) {
                Card card = cardService.getCardByUniqueCardNumber(uniqueCardNumber);
                cards.add(card);
            }
        }
        else throw new IllegalArgumentException();

        return cards;
    }

    public List<Card> getEggDeckCardsById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        List<Card> cards = new ArrayList<>();
        if (optionalDeck.isPresent()) {
            Deck deck = optionalDeck.get();
            for (String uniqueCardNumber : deck.eggDeckList()) {
                Card card = cardService.getCardByUniqueCardNumber(uniqueCardNumber);
                cards.add(card);
            }
        }
        else throw new IllegalArgumentException();

        return cards;
    }

    public void deleteDeck(String id) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck deck = getDeckById(id);
        List<Deck> decksByAuthor = deckRepo.findByAuthorId(deck.authorId());
        if (decksByAuthor.size() > 1) this.deckRepo.deleteById(id);
    }

    public void updateDeckImage(String id, String imageUrl) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                existingDeck.name(),
                existingDeck.mainDeckList(),
                existingDeck.eggDeckList(),
                imageUrl,
                existingDeck.mainSleeveName(),
                existingDeck.eggSleeveName(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public void updateMainDeckSleeve(String id, String sleeveName) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                existingDeck.name(),
                existingDeck.mainDeckList(),
                existingDeck.eggDeckList(),
                existingDeck.deckImageCardUrl(),
                sleeveName,
                existingDeck.eggSleeveName(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public void updateEggDeckSleeve(String id, String sleeveName) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck existingDeck = getDeckById(id);
        Deck deckToSave = new Deck(
                id,
                existingDeck.name(),
                existingDeck.mainDeckList(),
                existingDeck.eggDeckList(),
                existingDeck.deckImageCardUrl(),
                existingDeck.mainSleeveName(),
                sleeveName,
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public String getDeckSleeveById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        if (optionalDeck.isEmpty()) throw new IllegalArgumentException();
        return optionalDeck.get().mainSleeveName();
    }

    public String getEggDeckSleeveById(String id) {
        Optional<Deck> optionalDeck = this.deckRepo.findById(id);
        if (optionalDeck.isEmpty()) throw new IllegalArgumentException();
        return optionalDeck.get().eggSleeveName();
    }

}

