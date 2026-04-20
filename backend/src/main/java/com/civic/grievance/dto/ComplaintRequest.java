package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Category;
import com.civic.grievance.entity.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private Category category;

    @NotNull(message = "Citizen ID is required")
    private Long citizenId;

    private Long assignedOfficerId;
    private Long departmentId;
    private Double latitude;
    private Double longitude;
    private String address;
}