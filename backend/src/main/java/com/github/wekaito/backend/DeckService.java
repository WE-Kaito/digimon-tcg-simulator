package com.github.wekaito.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckRepo deckRepo;

    private final CardService cardService;

    private final IdService idService;

    private final UserIdService userIdService;

    public void addDeck(DeckWithoutId deckWithoutId) {
        Deck deckToSave = new Deck(
                idService.createId(),
                deckWithoutId.name(),
                deckWithoutId.color(),
                deckWithoutId.decklist(),
                userIdService.getCurrentUserId()
        );
        this.deckRepo.save(deckToSave);
    }

    public List<Deck> getDecksByAuthorId(String authorId) {
        return deckRepo.findByAuthorId(authorId);
    }

    public void updateDeck(String id, DeckWithoutId deckWithoutId) {
        if (!deckRepo.existsById(id)) throw new IllegalArgumentException();
        Deck deckToSave = new Deck(
                id,
                deckWithoutId.name(),
                deckWithoutId.color(),
                deckWithoutId.decklist(),
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
}
