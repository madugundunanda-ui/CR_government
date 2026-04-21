package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ComplaintHistoryResponse {
    private Long id;
    private Long complaintId;
    private Long changedById;
    private String changedByName;
    private String changedByRole;
    private Status fromStatus;
    private Status toStatus;
    private String remarks;
    private LocalDateTime changedAt;
}
