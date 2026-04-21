package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DepartmentStatsResponse {
    private Long departmentId;
    private String departmentName;
    private String headName;
    private long totalComplaints;
    private long pending;
    private long inProgress;
    private long resolved;
    private long closed;
    private long slaBreached;
    private double resolutionRatePct;
    private double slaCompliancePct;
    private long totalOfficers;
}
