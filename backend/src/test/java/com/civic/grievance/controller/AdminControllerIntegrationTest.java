package com.civic.grievance.controller;

import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminControllerIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("Admin can update citizen profile")
    void adminCanUpdateCitizen() throws Exception {
        String body = """
            {
                "name": "Updated Citizen",
                "email": "citizen@test.com",
                "contactNumber": "9998887776",
                "address": "Updated Address",
                "approved": true
            }
            """;
        mockMvc.perform(put("/api/admin/users/" + citizenUser.getId())
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Citizen"))
                .andExpect(jsonPath("$.contactNumber").value("9998887776"))
                .andExpect(jsonPath("$.address").value("Updated Address"));
    }

    @Test
    @DisplayName("Admin can update officer to supervisor and assign department")
    void adminCanPromoteOfficerToSupervisor() throws Exception {
        Department dept = departmentRepository.save(Department.builder().name("Health").build());

        String body = """
            {
                "name": "Promoted Officer",
                "email": "officer@test.com",
                "role": "SUPERVISOR",
                "departmentId": %d,
                "approved": true
            }
            """.formatted(dept.getId());

        mockMvc.perform(put("/api/admin/users/" + officerUser.getId())
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("SUPERVISOR"))
                .andExpect(jsonPath("$.departmentId").value(dept.getId()))
                .andExpect(jsonPath("$.name").value("Promoted Officer"));
        
        // Verify changes are persisted
        User updatedUser = userRepository.findById(officerUser.getId()).orElseThrow();
        assertThat(updatedUser.getRole()).isEqualTo(Role.SUPERVISOR);
        assertThat(updatedUser.getDepartmentId()).isEqualTo(dept.getId());
    }

    @Test
    @DisplayName("Admin can view audit logs")
    void adminCanViewAuditLogs() throws Exception {
        // First perform an action to generate an audit log
        mockMvc.perform(put("/api/admin/users/" + officerUser.getId() + "/approve")
                .header("Authorization", bearer(adminToken)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk());

        // Now fetch audit logs
        mockMvc.perform(get("/api/admin/audit-logs")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].action").value("USER_APPROVED"));
    }
}
