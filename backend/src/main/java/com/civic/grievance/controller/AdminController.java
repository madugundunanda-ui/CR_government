package com.civic.grievance.controller;

import com.civic.grievance.dto.*;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.service.ComplaintService;
import com.civic.grievance.service.DepartmentService;
import com.civic.grievance.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final DepartmentService departmentService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    // ─── Complaints ───────────────────────────────────────────────────────────

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody AssignOfficerRequest request) {
        return ResponseEntity.ok(complaintService.assignOfficer(id, request.getOfficerId()));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(complaintService.updateStatusByAdmin(id, request));
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @RequestParam(defaultValue = "CITIZEN") String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/users/pending-officers")
    public ResponseEntity<List<UserResponse>> getPendingOfficers() {
        return ResponseEntity.ok(userService.getPendingOfficers());
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<UserResponse> approveOfficer(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveOfficer(id));
    }

    // ─── Departments ─────────────────────────────────────────────────────────

    @PostMapping("/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.create(request));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.update(id, request));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse> deleteDepartment(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.builder().message("Department deleted").build());
    }

    // ─── Reports / Stats ─────────────────────────────────────────────────────

    @GetMapping("/reports/stats")
    public ResponseEntity<ComplaintStatsResponse> getStats() {
        ComplaintStatsResponse stats = ComplaintStatsResponse.builder()
                .total(complaintRepository.count())
                .pending(complaintRepository.countByStatus(Status.PENDING))
                .assigned(complaintRepository.countByStatus(Status.ASSIGNED))
                .inProgress(complaintRepository.countByStatus(Status.IN_PROGRESS))
                .resolved(complaintRepository.countByStatus(Status.RESOLVED))
                .closed(complaintRepository.countByStatus(Status.CLOSED))
                .highPriority(complaintRepository.countByPriority(com.civic.grievance.entity.enums.Priority.HIGH))
                .urgentPriority(complaintRepository.countByPriority(com.civic.grievance.entity.enums.Priority.URGENT))
                .totalCitizens(userRepository.findByRole(Role.CITIZEN).size())
                .totalOfficers(userRepository.findByRole(Role.OFFICER).size())
                .build();
        return ResponseEntity.ok(stats);
    }
}