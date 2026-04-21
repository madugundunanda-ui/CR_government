package com.civic.grievance.controller;

import com.civic.grievance.dto.*;
import com.civic.grievance.dto.AuditLogResponse;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.service.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final DepartmentService departmentService;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    // ─── Complaints ───────────────────────────────────────────────────────────

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(
            @RequestParam(required = false) Status status) {
        if (status != null) {
            return ResponseEntity.ok(complaintService.getComplaintsByStatus(status));
        }
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

    @GetMapping("/complaints/{id}/history")
    public ResponseEntity<List<ComplaintHistoryResponse>> getComplaintHistory(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintHistory(id));
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

    /** Assign a supervisor/officer as the department head */
    @PutMapping("/departments/{deptId}/head/{userId}")
    public ResponseEntity<DepartmentResponse> assignDepartmentHead(
            @PathVariable Long deptId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(departmentService.assignHead(deptId, userId));
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
                .totalCitizens(userRepository.countByRole(Role.CITIZEN))
                .totalOfficers(userRepository.countByRole(Role.OFFICER) + userRepository.countByRole(Role.SUPERVISOR))
                .build();
        return ResponseEntity.ok(stats);
    }

    /** Real per-department stats replacing the former mock data */
    @GetMapping("/reports/department-stats")
    public ResponseEntity<List<DepartmentStatsResponse>> getDepartmentStats() {
        return ResponseEntity.ok(departmentService.getDepartmentStats());
    }

    /** Officer performance analytics */
    @GetMapping("/reports/officer-performance")
    public ResponseEntity<List<OfficerPerformanceResponse>> getOfficerPerformance() {
        return ResponseEntity.ok(userService.getOfficerPerformance());
    }

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(auditLogService.getRecent(limit));
    }

    // ─── CSV Export ───────────────────────────────────────────────────────────

    @GetMapping("/reports/export-csv")
    public void exportComplaintsCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"complaints.csv\"");

        List<com.civic.grievance.dto.ComplaintResponse> complaints =
            complaintService.getAllComplaints();

        try (PrintWriter writer = response.getWriter()) {
            writer.println("ID,Title,Status,Priority,Category,Citizen,Officer,Department,Created,SLA Deadline,Remarks");
            for (var c : complaints) {
                writer.printf("%d,\"%s\",%s,%s,%s,\"%s\",\"%s\",\"%s\",%s,%s,\"%s\"%n",
                    c.getId(),
                    c.getTitle().replace("\"", "\"\""),
                    c.getStatus(),
                    c.getPriority(),
                    c.getCategory() != null ? c.getCategory() : "",
                    c.getCitizenName(),
                    c.getAssignedOfficerName() != null ? c.getAssignedOfficerName() : "Unassigned",
                    c.getDepartmentName() != null ? c.getDepartmentName() : "",
                    c.getCreatedAt(),
                    c.getSlaDeadline(),
                    c.getOfficerRemarks() != null ? c.getOfficerRemarks().replace("\"", "\"\"") : ""
                );
            }
        }
    }
}