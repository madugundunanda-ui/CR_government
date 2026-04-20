package com.civic.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ComplaintStatsResponse {
    private long total;
    private long pending;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long closed;
    private long highPriority;
    private long urgentPriority;
    private long totalCitizens;
    private long totalOfficers;
}