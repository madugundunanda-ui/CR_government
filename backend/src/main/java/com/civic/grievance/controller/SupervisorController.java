package com.civic.grievance.controller;

import com.civic.grievance.dto.*;
import com.civic.grievance.entity.User;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.service.ComplaintService;
import com.civic.grievance.service.DepartmentService;
import com.civic.grievance.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Supervisor endpoints — SUPERVISOR or ADMIN only.
 * Supervisors see everything within their assigned department.
 */
@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final DepartmentService departmentService;
    private final UserRepository userRepository;

    /** All complaints in the supervisor's department */
    @GetMapping("/department/complaints")
    public ResponseEntity<List<ComplaintResponse>> getDepartmentComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        Long deptId = getDepartmentId(supervisor);
        return ResponseEntity.ok(complaintService.getComplaintsByDepartment(deptId));
    }

    /** Department-level stats */
    @GetMapping("/department/stats")
    public ResponseEntity<DepartmentStatsResponse> getDepartmentStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        Long deptId = getDepartmentId(supervisor);
        return ResponseEntity.ok(
                departmentService.getDepartmentStats().stream()
                        .filter(s -> deptId.equals(s.getDepartmentId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Department stats not found"))
        );
    }

    /** All officers in the supervisor's department with performance metrics */
    @GetMapping("/department/officers")
    public ResponseEntity<List<OfficerPerformanceResponse>> getDepartmentOfficers(
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        Long deptId = getDepartmentId(supervisor);
        return ResponseEntity.ok(userService.getOfficerPerformanceByDepartment(deptId));
    }

    /** Basic officer user details in supervisor's department for management/editing */
    @GetMapping("/department/officer-users")
    public ResponseEntity<List<UserResponse>> getDepartmentOfficerUsers(
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        Long deptId = getDepartmentId(supervisor);
        return ResponseEntity.ok(userService.getOfficerUsersByDepartment(deptId));
    }

    /** Supervisor can edit officers in own department (no cross-department move) */
    @PutMapping("/officers/{id}")
    public ResponseEntity<UserResponse> updateOfficerBySupervisor(
            @PathVariable Long id,
            @RequestBody OfficerManagementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        return ResponseEntity.ok(userService.updateOfficerBySupervisor(supervisor.getId(), id, request));
    }

    /** Supervisor can reassign a complaint within their department */
    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> reassignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignOfficerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        Long deptId = getDepartmentId(supervisor);

        ComplaintResponse complaint = complaintService.getComplaintById(id);
        if (complaint.getDepartmentId() == null || !deptId.equals(complaint.getDepartmentId())) {
            throw new BadRequestException("You can reassign only complaints in your department");
        }

        // Validate target officer is in same department
        User targetOfficer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found"));
        if (!deptId.equals(targetOfficer.getDepartmentId())) {
            throw new BadRequestException("Officer must belong to the same department");
        }

        return ResponseEntity.ok(complaintService.assignOfficer(id, request.getOfficerId()));
    }

    /** Supervisor can update status of any complaint in their department */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User supervisor = resolveUser(userDetails);
        return ResponseEntity.ok(complaintService.updateStatus(id, request, supervisor.getId()));
    }

    /** Get complaint history/timeline */
    @GetMapping("/complaints/{id}/history")
    public ResponseEntity<List<ComplaintHistoryResponse>> getComplaintHistory(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintHistory(id));
    }

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long getDepartmentId(User supervisor) {
        if (supervisor.getDepartmentId() == null) {
            throw new BadRequestException("You are not assigned to any department. Contact admin.");
        }
        return supervisor.getDepartmentId();
    }
}
