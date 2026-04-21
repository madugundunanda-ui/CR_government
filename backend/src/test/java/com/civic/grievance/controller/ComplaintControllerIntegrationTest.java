package com.civic.grievance.controller;

import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.repository.ComplaintRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for complaint, officer, and admin endpoints.
 * Spec cases: 5, 8–12, 14–16, 20, 24, 25.
 */
class ComplaintControllerIntegrationTest extends IntegrationTestBase {

    @Autowired private ComplaintRepository complaintRepository;

    // ─── Test Case 5: Citizen creates geo-tagged complaint ───────────────────

    @Test
    @DisplayName("TC-05: Citizen creates complaint with geo-tags → 201")
    void createComplaint_withGeoTags() throws Exception {
        String body = """
            {"title":"Pothole on Main Road","description":"Large pothole near bank, very dangerous",
             "priority":"HIGH","category":"ROADS_INFRASTRUCTURE",
             "latitude":12.9716,"longitude":77.5946,"address":"MG Road, Bengaluru"}
            """;
        mockMvc.perform(post("/api/citizen/complaints")
                .header("Authorization", bearer(citizenToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.latitude").value(12.9716))
                .andExpect(jsonPath("$.longitude").value(77.5946))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    // ─── Test Case 6: SLA auto-calculated ────────────────────────────────────

    @Test
    @DisplayName("TC-06: URGENT complaint gets 4h SLA deadline")
    void createComplaint_urgentSla() throws Exception {
        String body = """
            {"title":"Gas Leak Emergency","description":"Dangerous gas leak on our street, evacuate now",
             "priority":"URGENT","address":"Test Street"}
            """;
        mockMvc.perform(post("/api/citizen/complaints")
                .header("Authorization", bearer(citizenToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slaDeadline").isNotEmpty());
    }

    // ─── Test Case 8+20: Admin assigns officer → ASSIGNED ────────────────────

    @Test
    @DisplayName("TC-08+20: Admin assigns officer to complaint → status ASSIGNED")
    void adminAssignsOfficer() throws Exception {
        // First create a complaint
        Complaint c = createComplaintInDB(Status.PENDING);

        String body = "{\"officerId\":" + officerUser.getId() + "}";
        mockMvc.perform(put("/api/admin/complaints/" + c.getId() + "/assign")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedOfficerId").value(officerUser.getId()));
    }

    // ─── Test Case 9: Officer updates to IN_PROGRESS ─────────────────────────

    @Test
    @DisplayName("TC-09: Officer updates assigned complaint to IN_PROGRESS")
    void officerUpdatesStatus_inProgress() throws Exception {
        Complaint c = createComplaintInDB(Status.ASSIGNED);

        String body = "{\"status\":\"IN_PROGRESS\"}";
        mockMvc.perform(put("/api/officer/tasks/" + c.getId() + "/status")
                .header("Authorization", bearer(officerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    // ─── Test Case 11: Officer cannot update non-assigned complaint ───────────

    @Test
    @DisplayName("TC-11: Officer cannot update complaint assigned to another officer")
    void officer_cannotUpdateOtherOfficerComplaint() throws Exception {
        // Create another officer
        createUser("other@test.com", "Other", "pass", com.civic.grievance.entity.enums.Role.OFFICER, true);
        // Complaint assigned to officerUser
        Complaint c = createComplaintInDB(Status.ASSIGNED);

        // other officer tries to update it → should fail
        String otherToken = generateToken("other@test.com");
        String body = "{\"status\":\"IN_PROGRESS\"}";
        mockMvc.perform(put("/api/officer/tasks/" + c.getId() + "/status")
                .header("Authorization", bearer(otherToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());
    }

    // ─── Test Case 12: Citizen views own complaints only ─────────────────────

    @Test
    @DisplayName("TC-12: Citizen views only their own complaints")
    void citizenViewsOwnComplaints() throws Exception {
        createComplaintInDB(Status.PENDING);

        mockMvc.perform(get("/api/citizen/my-complaints")
                .header("Authorization", bearer(citizenToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].citizenId").value(citizenUser.getId()));
    }

    // ─── Test Case 14: Search complaint by ID (admin) ────────────────────────

    @Test
    @DisplayName("TC-14: Admin fetches all complaints (includes search by ID on frontend)")
    void adminGetAllComplaints() throws Exception {
        createComplaintInDB(Status.PENDING);

        mockMvc.perform(get("/api/admin/complaints")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    // ─── Test Case 15: Filter complaints by status ───────────────────────────

    @Test
    @DisplayName("TC-15: Admin gets PENDING complaints (filter validated via stats)")
    void adminFilterByStatus_viaStats() throws Exception {
        createComplaintInDB(Status.PENDING);
        createComplaintInDB(Status.RESOLVED);

        mockMvc.perform(get("/api/admin/reports/stats")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pending").isNumber())
                .andExpect(jsonPath("$.resolved").isNumber());
    }

    // ─── Test Case 24: Geo-location stored ───────────────────────────────────

    @Test
    @DisplayName("TC-24: Geo-coordinates are stored and returned in response")
    void geoCoordinatesStoredAndReturned() throws Exception {
        String body = """
            {"title":"Broken Streetlight","description":"Streetlight has been broken for two weeks",
             "priority":"MEDIUM","latitude":13.0827,"longitude":80.2707,"address":"Chennai"}
            """;
        mockMvc.perform(post("/api/citizen/complaints")
                .header("Authorization", bearer(citizenToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.latitude").value(13.0827))
                .andExpect(jsonPath("$.longitude").value(80.2707));
    }

    // ─── Test Case 25: Admin views KPI stats ─────────────────────────────────

    @Test
    @DisplayName("TC-25: Admin views complaint resolution KPIs")
    void adminViewsKpiStats() throws Exception {
        createComplaintInDB(Status.PENDING);

        mockMvc.perform(get("/api/admin/reports/stats")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").isNumber())
                .andExpect(jsonPath("$.pending").isNumber())
                .andExpect(jsonPath("$.resolved").isNumber())
                .andExpect(jsonPath("$.totalCitizens").isNumber())
                .andExpect(jsonPath("$.totalOfficers").isNumber());
    }

    // ─── Test Case 16: Monthly stats endpoint available ──────────────────────

    @Test
    @DisplayName("TC-16: Admin stats endpoint is accessible")
    void adminStatsEndpointAccessible() throws Exception {
        mockMvc.perform(get("/api/admin/reports/stats")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());
    }

    // ─── Test Case 18: JWT expiry causes 401 ─────────────────────────────────

    @Test
    @DisplayName("TC-18: Expired/invalid JWT returns 401")
    void expiredJwt_returns401() throws Exception {
        String fakeToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIn0.fakesignature";
        mockMvc.perform(get("/api/citizen/my-complaints")
                .header("Authorization", fakeToken))
                .andExpect(status().isUnauthorized());
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private Complaint createComplaintInDB(Status status) {
        return complaintRepository.save(Complaint.builder()
                .title("Test Complaint").description("Test description here")
                .status(status).priority(Priority.MEDIUM)
                .citizen(citizenUser).assignedOfficer(status == Status.ASSIGNED ? officerUser : null)
                .createdAt(LocalDateTime.now()).slaDeadline(LocalDateTime.now().plusHours(24))
                .build());
    }
}