package com.github.wekaito.backend;

import com.github.wekaito.backend.models.Deck;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StarterDeckService {
    private final DeckRepo deckRepo;


    public static final List<String> GALLANTMON_MAIN = List.of(
            "ST1-16",
            "ST1-16",
            "ST1-16",
            "ST1-16",
            "ST7-11",
            "ST7-11",
            "ST7-12",
            "ST7-12",
            "ST7-12",
            "ST7-12",
            "BT1-009",
            "BT1-009",
            "BT1-009",
            "BT1-009",
            "ST7-02",
            "ST7-02",
            "ST7-02",
            "ST7-02",
            "ST7-03",
            "ST7-03",
            "ST7-04",
            "ST7-04",
            "ST7-04",
            "ST7-04",
            "BT1-019",
            "BT1-019",
            "BT1-019",
            "BT1-019",
            "ST7-05",
            "ST7-05",
            "ST7-06",
            "ST7-06",
            "ST7-06",
            "ST7-06",
            "BT1-020",
            "BT1-020",
            "ST7-07",
            "ST7-07",
            "ST7-07",
            "ST7-07",
            "ST7-08",
            "ST7-08",
            "ST7-08",
            "ST7-08",
            "ST7-09",
            "ST7-09",
            "ST7-10",
            "ST7-10",
            "ST7-10",
            "ST7-10"
    );

    public static final List<String> GALLANTMON_EGGS = List.of(
            "ST7-01",
            "ST7-01",
            "ST7-01",
            "ST7-01"
    );

    public static final List<String> BEELZEMON_MAIN = List.of(
            "EX2-071",
            "EX2-071",
            "EX2-071",
            "EX2-071",
            "ST14-12",
            "ST14-12",
            "ST14-11",
            "ST14-11",
            "ST14-11",
            "ST14-11",
            "ST14-04",
            "ST14-04",
            "ST14-04",
            "ST14-04",
            "BT2-068",
            "BT2-068",
            "BT2-068",
            "BT2-068",
            "ST14-02",
            "ST14-02",
            "ST14-03",
            "ST14-03",
            "ST14-03",
            "ST14-03",
            "P-077",
            "P-077",
            "P-077",
            "P-077",
            "ST14-05",
            "ST14-05",
            "ST14-05",
            "ST14-05",
            "ST14-06",
            "ST14-06",
            "ST14-06",
            "ST14-06",
            "BT8-079",
            "BT8-079",
            "BT8-079",
            "BT8-079",
            "ST14-07",
            "ST14-07",
            "ST14-07",
            "ST14-07",
            "ST14-08",
            "ST14-08",
            "ST14-09",
            "ST14-09",
            "ST14-10",
            "ST14-10"
    );

    public static final List<String> BEELZEMON_EGGS = List.of(
            "ST14-01",
            "ST14-01",
            "ST14-01",
            "ST14-01"
    );

    public static final List<String> DRAGON_OF_COURAGE_MAIN = List.of(
            "ST15-02_P1",
            "ST15-12_P1",
            "ST15-11_P1",
            "ST15-11_P1",
            "ST15-02",
            "ST15-03",
            "ST15-03",
            "ST15-03",
            "ST15-03",
            "ST15-04",
            "ST15-04",
            "ST15-04",
            "ST15-04",
            "ST15-05",
            "ST15-05",
            "ST15-05",
            "ST15-05",
            "ST15-06",
            "ST15-06",
            "ST15-06",
            "ST15-06",
            "ST15-07",
            "ST15-07",
            "ST15-07",
            "ST15-07",
            "ST15-08",
            "ST15-08",
            "ST15-09",
            "ST15-09",
            "ST15-09",
            "ST15-09",
            "ST15-10",
            "ST15-10",
            "ST15-10",
            "ST15-10",
            "ST15-12",
            "ST15-13",
            "ST15-13",
            "ST15-13",
            "ST15-13",
            "ST15-14",
            "ST15-14",
            "ST15-14",
            "ST15-14",
            "ST15-15",
            "ST15-15",
            "ST15-16",
            "ST15-16",
            "ST15-16",
            "ST15-16"
    );

    public static final List<String> DRAGON_OF_COURAGE_EGGS = List.of(
            "ST15-01",
            "ST15-01",
            "ST15-01",
            "ST15-01"
    );

    public static final List<String> VORTEX_WARRIORS_MAIN = List.of(
            "P-038_P4",
            "P-038_P4",
            "ST18-15",
            "ST18-15",
            "ST18-15",
            "ST18-15",
            "ST18-14",
            "ST18-14",
            "ST18-14",
            "ST18-14",
            "ST18-13",
            "ST18-13",
            "ST18-13",
            "ST18-13",
            "ST18-12",
            "ST18-12",
            "ST18-11",
            "ST18-11",
            "ST18-11",
            "ST18-11",
            "ST18-10",
            "ST18-10",
            "ST18-09",
            "ST18-09",
            "ST18-09",
            "ST18-09",
            "ST18-08",
            "ST18-08",
            "ST18-07",
            "ST18-07",
            "ST18-07",
            "ST18-07",
            "ST18-06",
            "ST18-06",
            "ST18-06",
            "ST18-06",
            "ST18-05",
            "ST18-05",
            "ST18-05",
            "ST18-05",
            "ST18-04",
            "ST18-04",
            "ST18-03",
            "ST18-03",
            "ST18-03",
            "ST18-03",
            "ST18-02",
            "ST18-02",
            "ST18-02",
            "ST18-02"
    );

    public static final List<String> VORTEX_WARRIORS_EGGS = List.of(
            "ST18-01",
            "ST18-01",
            "ST18-01",
            "ST18-01"
    );

    public void createStarterDecksForUser(String userId, String firstDeckId) {
        Deck gallantmonDeck = new Deck(
                firstDeckId,
                "[STARTER] Gallantmon",
                GALLANTMON_MAIN,
                GALLANTMON_EGGS,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST7-09.webp",
                "Guilmon",
                "Default",
                userId
        );

        Deck beelzemonDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Beelzemon",
                BEELZEMON_MAIN,
                BEELZEMON_EGGS,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST14-10.webp",
                "Impmon",
                "Default",
                userId
        );

        Deck dragonOfCourageDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Dragon Of Courage",
                DRAGON_OF_COURAGE_MAIN,
                DRAGON_OF_COURAGE_EGGS,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/ST15-12.webp",
                "Agumon",
                "Default",
                userId
        );

        Deck vortexWarriorsDeck = new Deck(
                UUID.randomUUID().toString(),
                "[STARTER] Vortex Warriors",
                VORTEX_WARRIORS_MAIN,
                VORTEX_WARRIORS_EGGS,
                "https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/images/cards/P-038_P4-J.webp",
                "Pteromon",
                "Default",
                userId
        );

        this.deckRepo.saveAll(List.of(
                gallantmonDeck,
                beelzemonDeck,
                dragonOfCourageDeck,
                vortexWarriorsDeck
        ));
    }
}
