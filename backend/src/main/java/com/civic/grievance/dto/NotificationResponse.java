package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private boolean read;
    private Long relatedComplaintId;
    private LocalDateTime createdAt;
}