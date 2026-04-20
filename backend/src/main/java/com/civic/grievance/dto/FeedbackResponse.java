package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long complaintId;
    private String complaintTitle;
    private Long citizenId;
    private String citizenName;
    private int rating;
    private String comments;
    private LocalDateTime createdAt;
}
