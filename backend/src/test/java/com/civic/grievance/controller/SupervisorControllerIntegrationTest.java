package com.civic.grievance.controller;

import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Role;
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

class SupervisorControllerIntegrationTest extends IntegrationTestBase {

    @Autowired private ComplaintRepository complaintRepository;

    @Test
    @DisplayName("Supervisor can assign officer in same department")
    void supervisorAssignOfficerInSameDepartment() throws Exception {
        Department dept = departmentRepository.save(Department.builder().name("Roads_Assign").build());
        
        supervisorUser.setDepartmentId(dept.getId());
        userRepository.save(supervisorUser);
        
        officerUser.setDepartmentId(dept.getId());
        userRepository.save(officerUser);

        Complaint c = complaintRepository.save(Complaint.builder()
                .title("Pothole")
                .description("Test")
                .priority(Priority.HIGH)
                .status(Status.PENDING)
                .citizen(citizenUser)
                .department(dept)
                .createdAt(LocalDateTime.now())
                .slaDeadline(LocalDateTime.now().plusDays(2))
                .build());

        String body = "{\"officerId\":" + officerUser.getId() + "}";
        mockMvc.perform(put("/api/supervisor/complaints/" + c.getId() + "/assign")
                .header("Authorization", bearer(supervisorToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedOfficerId").value(officerUser.getId()));
    }

    @Test
    @DisplayName("Supervisor cannot assign officer in different department")
    void supervisorCannotAssignOfficerInDifferentDepartment() throws Exception {
        Department dept1 = departmentRepository.save(Department.builder().name("Roads_NoAssign1").build());
        Department dept2 = departmentRepository.save(Department.builder().name("Water_NoAssign2").build());
        
        supervisorUser.setDepartmentId(dept1.getId());
        userRepository.save(supervisorUser);
        
        officerUser.setDepartmentId(dept2.getId());
        userRepository.save(officerUser);

        Complaint c = complaintRepository.save(Complaint.builder()
                .title("Pothole")
                .description("Test")
                .priority(Priority.HIGH)
                .status(Status.PENDING)
                .citizen(citizenUser)
                .department(dept1)
                .createdAt(LocalDateTime.now())
                .slaDeadline(LocalDateTime.now().plusDays(2))
                .build());

        String body = "{\"officerId\":" + officerUser.getId() + "}";
        mockMvc.perform(put("/api/supervisor/complaints/" + c.getId() + "/assign")
                .header("Authorization", bearer(supervisorToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Officer must belong to the same department"));
    }

    @Test
    @DisplayName("Supervisor cannot assign complaint in different department")
    void supervisorCannotAssignComplaintInDifferentDepartment() throws Exception {
        Department dept1 = departmentRepository.save(Department.builder().name("Roads_NoReassign1").build());
        Department dept2 = departmentRepository.save(Department.builder().name("Water_NoReassign2").build());
        
        supervisorUser.setDepartmentId(dept1.getId());
        userRepository.save(supervisorUser);
        
        User otherOfficer = createUser("other@test.com", "Other", "pass", Role.OFFICER, true);
        otherOfficer.setDepartmentId(dept1.getId());
        userRepository.save(otherOfficer);

        Complaint c = complaintRepository.save(Complaint.builder()
                .title("Leak")
                .description("Test")
                .priority(Priority.HIGH)
                .status(Status.PENDING)
                .citizen(citizenUser)
                .department(dept2)
                .createdAt(LocalDateTime.now())
                .slaDeadline(LocalDateTime.now().plusDays(2))
                .build());

        String body = "{\"officerId\":" + otherOfficer.getId() + "}";
        mockMvc.perform(put("/api/supervisor/complaints/" + c.getId() + "/assign")
                .header("Authorization", bearer(supervisorToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("You can reassign only complaints in your department"));
    }

    @Test
    @DisplayName("Supervisor can update officer in same department")
    void supervisorCanUpdateOfficerInSameDepartment() throws Exception {
        Department dept = departmentRepository.save(Department.builder().name("Roads_UpdateOff").build());
        
        supervisorUser.setDepartmentId(dept.getId());
        userRepository.save(supervisorUser);
        
        officerUser.setDepartmentId(dept.getId());
        userRepository.save(officerUser);

        String body = """
            {
                "name": "Updated Officer",
                "email": "officer@test.com",
                "contactNumber": "1234567890",
                "address": "New Address"
            }
            """;
        mockMvc.perform(put("/api/supervisor/officers/" + officerUser.getId())
                .header("Authorization", bearer(supervisorToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Officer"))
                .andExpect(jsonPath("$.address").value("New Address"));
    }

    @Test
    @DisplayName("Supervisor cannot update officer in different department")
    void supervisorCannotUpdateOfficerInDifferentDepartment() throws Exception {
        Department dept1 = departmentRepository.save(Department.builder().name("Roads_NoUpdate1").build());
        Department dept2 = departmentRepository.save(Department.builder().name("Water_NoUpdate2").build());
        
        supervisorUser.setDepartmentId(dept1.getId());
        userRepository.save(supervisorUser);
        
        officerUser.setDepartmentId(dept2.getId());
        userRepository.save(officerUser);

        String body = """
            {
                "name": "Updated Officer",
                "email": "officer@test.com"
            }
            """;
        mockMvc.perform(put("/api/supervisor/officers/" + officerUser.getId())
                .header("Authorization", bearer(supervisorToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());
    }
}
