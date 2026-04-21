package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private String name;
    private String description;
    private Long headId;
    private String headName;
    private String contactEmail;
    private long totalComplaints;
    private long pendingComplaints;
    private long resolvedComplaints;
    private LocalDateTime createdAt;
}