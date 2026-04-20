package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private Status status;

    private String remarks;
}