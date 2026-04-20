package com.civic.grievance.service;

import com.civic.grievance.dto.FeedbackRequest;
import com.civic.grievance.dto.FeedbackResponse;
import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.Feedback;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.FeedbackRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public FeedbackResponse submitFeedback(FeedbackRequest request, Long citizenId) {
        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + request.getComplaintId()));

        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new BadRequestException("You can only rate your own complaints");
        }

        if (complaint.getStatus() != Status.RESOLVED && complaint.getStatus() != Status.CLOSED) {
            throw new BadRequestException("Feedback can only be submitted for RESOLVED or CLOSED complaints");
        }

        if (feedbackRepository.existsByComplaint_Id(request.getComplaintId())) {
            throw new BadRequestException("Feedback already submitted for this complaint");
        }

        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found: " + citizenId));

        Feedback feedback = Feedback.builder()
                .complaint(complaint)
                .citizen(citizen)
                .rating(request.getRating())
                .comments(request.getComments())
                .build();

        return mapToResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse getFeedbackForComplaint(Long complaintId) {
        Feedback f = feedbackRepository.findByComplaint_Id(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("No feedback for complaint: " + complaintId));
        return mapToResponse(f);
    }

    private FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .complaintId(f.getComplaint().getId())
                .complaintTitle(f.getComplaint().getTitle())
                .citizenId(f.getCitizen().getId())
                .citizenName(f.getCitizen().getName())
                .rating(f.getRating())
                .comments(f.getComments())
                .createdAt(f.getCreatedAt())
                .build();
    }
}