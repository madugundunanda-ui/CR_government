package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfficerManagementRequest {
    private String name;
    private String email;
    private String contactNumber;
    private String address;
    private Long departmentId;
    private Role role;
    private Boolean approved;
}
