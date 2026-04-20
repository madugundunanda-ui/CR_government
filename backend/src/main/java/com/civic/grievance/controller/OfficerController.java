package com.civic.grievance.controller;

import com.civic.grievance.dto.ComplaintResponse;
import com.civic.grievance.dto.UpdateStatusRequest;
import com.civic.grievance.entity.User;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
public class OfficerController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    /**
     * Returns ONLY complaints assigned to the currently logged-in officer.
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<ComplaintResponse>> getMyTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        User officer = resolveUser(userDetails);
        return ResponseEntity.ok(complaintService.getComplaintsByOfficer(officer.getId()));
    }

    /**
     * Officer can update status ONLY on complaints assigned to them.
     */
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<ComplaintResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User officer = resolveUser(userDetails);
        return ResponseEntity.ok(complaintService.updateStatus(id, request, officer.getId()));
    }

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}