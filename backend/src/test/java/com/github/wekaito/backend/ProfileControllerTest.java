package com.github.wekaito.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    Card exampleCard = new Card(
            "Agumon",
            "Digimon",
            "Red",
            "https://images.digimoncard.io/images/cards/BT1-010.jpg",
            "BT1-010",
            "Rookie",
            "Vaccine",
            "Reptile",
            2000,
            3,
            0,
            3,
            "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order.",
            null
    );

    @Test
    void expectArrayOfCards_whenGetCards() throws Exception {

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/cards"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Card[] cards = objectMapper.readValue(response, Card[].class);

        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class).hasSizeGreaterThan(200);
    }


    @Test
    @DirtiesContext
    void expectOk_whenAddDeck() throws Exception {

        Card[] cards = {exampleCard, exampleCard, exampleCard};
        Deck exampleDeck = new Deck("New Deck", cards);

        mockMvc.perform(
                        MockMvcRequestBuilders.post("/api/profile/cards")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(exampleDeck.toString()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk());

    }

    @Test
    void expectEmptyList_whenGetDecks() throws Exception {

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().json("[]"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Deck[] decks = objectMapper.readValue(response, Deck[].class);

        assertThat(decks).isInstanceOf(Deck[].class);
    }
}
