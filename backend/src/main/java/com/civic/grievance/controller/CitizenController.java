package com.civic.grievance.controller;

import com.civic.grievance.dto.*;
import com.civic.grievance.entity.User;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.service.ComplaintService;
import com.civic.grievance.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
public class CitizenController {

    private final ComplaintService complaintService;
    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    @PostMapping("/complaints")
    public ResponseEntity<ComplaintResponse> raiseComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User citizen = resolveUser(userDetails);
        request.setCitizenId(citizen.getId()); // enforce from JWT, not request body
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.createComplaint(request));
    }

    @GetMapping("/my-complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        User citizen = resolveUser(userDetails);
        return ResponseEntity.ok(complaintService.getComplaintsByCitizen(citizen.getId()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User citizen = resolveUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.submitFeedback(request, citizen.getId()));
    }

    @GetMapping("/feedback/{complaintId}")
    public ResponseEntity<FeedbackResponse> getFeedback(
            @PathVariable Long complaintId) {
        return ResponseEntity.ok(feedbackService.getFeedbackForComplaint(complaintId));
    }

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}