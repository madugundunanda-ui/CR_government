package com.civic.grievance.dto;

import com.civic.grievance.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String message;
    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private boolean approved;
}