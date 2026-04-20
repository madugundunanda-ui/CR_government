package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Category;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private Category category;
    private Long citizenId;
    private String citizenName;
    private Long assignedOfficerId;
    private String assignedOfficerName;
    private Long departmentId;
    private String departmentName;
    private Double latitude;
    private Double longitude;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime slaDeadline;
    private LocalDateTime resolvedAt;
}
