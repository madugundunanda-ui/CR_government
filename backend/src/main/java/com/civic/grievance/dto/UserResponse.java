package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String contactNumber;
    private String address;
    private String identityType;
    private String identityNumber;
    private boolean approved;
    private Long departmentId;
    private String departmentName;
    private LocalDateTime createdAt;
}

