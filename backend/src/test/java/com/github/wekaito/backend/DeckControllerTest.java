package com.github.wekaito.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "testUser", password = "testPassWord1")
class DeckControllerTest {

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

    List<String> decklist = new ArrayList<>(List.of("BT1-010", "BT1-010", "BT1-010"));
    DeckWithoutId exampleDeckWithoutId = new DeckWithoutId("New Deck", "Red", decklist);

    @BeforeEach
    void setUp() throws Exception {

        String testUserWithoutId = """
                {
                    "username": "testUser",
                    "password": "testPassWord1"
                }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());
    }
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

        String requestBody = objectMapper.writeValueAsString(exampleDeckWithoutId);

        mockMvc.perform(
                        MockMvcRequestBuilders.post("/api/profile/decks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                                .with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk());

    }

    @Test
    @DirtiesContext
    void expectPostedDeck_whenGetDecks() throws Exception {

        String requestBody = objectMapper.writeValueAsString(exampleDeckWithoutId);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/profile/decks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .with(csrf()));

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks").with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("New Deck"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].decklist[0]").value("BT1-010"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Deck[] decks = objectMapper.readValue(response, Deck[].class);

        assertThat(decks).isInstanceOf(Deck[].class);
    }

    @Test
    @DirtiesContext
    void expectDeckName_whenUpdateDeck() throws Exception {

        String requestBody = objectMapper.writeValueAsString(exampleDeckWithoutId);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/profile/decks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .with(csrf()));

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks").with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("New Deck"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].decklist[0]").value("BT1-010"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Deck[] decks = objectMapper.readValue(response, Deck[].class);


        String id = decks[0].id();

        Deck exampleDeck = new Deck(id,"New Deck2", "Red", decklist, "authorId");
        String requestBody2 = objectMapper.writeValueAsString(exampleDeck);

        mockMvc.perform(
                MockMvcRequestBuilders.put("/api/profile/decks/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody2)
                        .with(csrf()));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks").with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("New Deck2"));
    }

    @Test
    @DirtiesContext
    void expectEmptyList_whenDeleteDeck() throws Exception {

        String requestBody = objectMapper.writeValueAsString(exampleDeckWithoutId);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/profile/decks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .with(csrf()));

        String response = mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks").with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Deck[] decks = objectMapper.readValue(response, Deck[].class);
        String id = decks[0].id();

        mockMvc.perform(
                MockMvcRequestBuilders.delete("/api/profile/decks/" + id).with(csrf()));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/profile/decks").with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isEmpty());
    }
}
