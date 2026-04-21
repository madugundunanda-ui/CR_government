package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class OfficerPerformanceResponse {
    private Long officerId;
    private String officerName;
    private String officerEmail;
    private Long departmentId;
    private String departmentName;
    private long totalAssigned;
    private long inProgress;
    private long resolved;
    private long closed;
    private long slaBreached;
    private double resolutionRatePct;
    private double slaCompliancePct;
}
