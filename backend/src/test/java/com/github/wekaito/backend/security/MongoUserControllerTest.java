package com.github.wekaito.backend.security;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
class MongoUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    String testUserWithoutId = """
                {
                    "username": "testUser",
                    "password": "testPassWord1",
                    "question": "question?",
                    "answer": "answer!"
                }
            """;

    @Test
    void getAnonymousUser_whenGetUserName() throws Exception {
        // GIVEN that user is not logged in
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/me"))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("anonymousUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void getUsername_whenLoggedInGetUserName() throws Exception {
        // GIVEN that user is logged in
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("testUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void getUserName_whenLogin() throws Exception {
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("testUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void getStatusOk_whenLogout() throws Exception {
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/logout").with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectNoContent_whenLogoutUser() throws Exception {
        //GIVEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()));
        //WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/logout").with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    void expectRegistration_whenRegisterUser() throws Exception {

        //WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testUserWithoutId)
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Successfully registered!"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectActiveDeck_AfterSetActiveDeck() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/active-deck/12345")
                .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/active-deck")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("12345"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectTestAvatar_AfterSetAvatar() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/avatar/test-avatar")
                        .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/avatar")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("test-avatar"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectTestSleeve_AfterSetSleeve() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/sleeve/test-sleeve")
                        .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/sleeve")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("test-sleeve"));
    }

    @Test
    void expectQuestion_AfterGetRecoveryQuestion() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/recovery/testUser")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("question?"));
    }

    @Test
    void expectMessage_AfterChangePassword() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        String testRecoveryObject = """
                {
                    "username": "testUser",
                    "answer": "answer!",
                    "newPassword": "testPassword2"
                }
            """;

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/recovery")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testRecoveryObject)
                .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Password changed!"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectMessage_AfterChangeQuestion() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        String testSafetyQuestionChange = """
                {
                    "question": "Cutest Digimon?",
                    "answer": "Gammamon!"
                }
            """;

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/change-question")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testSafetyQuestionChange)
                        .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Safety question changed!"));
    }
}
