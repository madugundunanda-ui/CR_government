package com.civic.grievance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignOfficerRequest {

    @NotNull(message = "Officer ID is required")
    private Long officerId;
}