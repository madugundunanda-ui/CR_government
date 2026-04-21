package com.civic.grievance.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for /api/auth endpoints.
 * Spec cases: 3 (JWT login), 23 (duplicate email).
 */
class AuthControllerIntegrationTest extends IntegrationTestBase {

    // ─── Test Case 3: Admin login returns JWT ───────────────────────────────

    @Test
    @DisplayName("TC-03: Admin login returns token in response")
    void adminLogin_returnsJwt() throws Exception {
        String body = """
            {"email":"admin@test.com","password":"admin123"}
            """;
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.approved").value(true));
    }

    // ─── Test Case 4: Unauthenticated admin route returns 403/401 ───────────

    @Test
    @DisplayName("TC-04: Admin route without token returns 401")
    void adminRoute_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/api/admin/complaints/1/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"officerId\":1}"))
                .andExpect(status().isUnauthorized());
    }

    // ─── Citizen cannot access admin route ───────────────────────────────────

    @Test
    @DisplayName("TC-04b: Citizen token on admin route returns 403")
    void adminRoute_withCitizenToken_returns403() throws Exception {
        mockMvc.perform(post("/api/admin/complaints/1/assign")
                .header("Authorization", bearer(citizenToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"officerId\":1}"))
                .andExpect(status().isForbidden());
    }

    // ─── Test Case 23: Duplicate email ───────────────────────────────────────

    @Test
    @DisplayName("TC-23: Registering with existing email returns 400")
    void register_duplicateEmail_returns400() throws Exception {
        String body = """
            {"name":"Dupe","email":"citizen@test.com","password":"pass123",
             "role":"CITIZEN","address":"addr","contactNumber":"9876"}
            """;
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("New citizen registers successfully")
    void register_newCitizen_returns201() throws Exception {
        String body = """
            {"name":"New Person","email":"new@test.com","password":"pass1234",
             "role":"CITIZEN","address":"New Address","contactNumber":"9876543210"}
            """;
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isNumber())
                .andExpect(jsonPath("$.approved").value(true));
    }

    @Test
    @DisplayName("Officer registration creates unapproved account")
    void register_officer_createsUnapproved() throws Exception {
        String body = """
            {"name":"New Officer","email":"newoff@test.com","password":"pass1234",
             "role":"OFFICER","address":"Office Addr","contactNumber":"9876543210"}
            """;
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.approved").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("approval")));
    }
}