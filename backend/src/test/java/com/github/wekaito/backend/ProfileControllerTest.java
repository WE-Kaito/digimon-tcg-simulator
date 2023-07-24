package com.github.wekaito.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void expectArrayOfCards_whenGetCards() throws Exception {

        Card exampleCard = new Card(
                "Agumon",
                "Digimon",
                "Red",
                "https://images.digimoncard.io/images/cards/BT1-010.jpg",
                "BT1-010",
                Optional.of("Rookie"),
                Optional.of("Vaccine"),
                Optional.of("Reptile"),
                Optional.of(2000),
                Optional.of(3),
                Optional.of(0),
                Optional.of(3),
                Optional.of("[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand. Place the remaining cards at the bottom of your deck in any order."),
                Optional.empty()
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/cards"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Card[] cards = objectMapper.readValue(response, Card[].class);

        assertThat(cards).contains(exampleCard).isInstanceOf(Card[].class).hasSizeGreaterThan(200);
    }
}
