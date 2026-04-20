package com.civic.grievance.service;

import com.civic.grievance.dto.UserResponse;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getUsersByRole(String roleName) {
        try {
            Role role = Role.valueOf(roleName.toUpperCase());
            return userRepository.findByRole(role).stream().map(this::mapToResponse).toList();
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleName);
        }
    }

    public List<UserResponse> getPendingOfficers() {
        return userRepository.findByRoleAndApproved(Role.OFFICER, false)
                .stream().map(this::mapToResponse).toList();
    }

    public UserResponse approveOfficer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getRole() != Role.OFFICER && user.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException("User is not an officer");
        }
        user.setApproved(true);
        return mapToResponse(userRepository.save(user));
    }

    public UserResponse getUserById(Long id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    public UserResponse updateProfile(Long id, String name, String contactNumber, String address) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (name != null) user.setName(name);
        if (contactNumber != null) user.setContactNumber(contactNumber);
        if (address != null) user.setAddress(address);
        return mapToResponse(userRepository.save(user));
    }

    public UserResponse mapToResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .contactNumber(u.getContactNumber())
                .address(u.getAddress())
                .approved(u.isApproved())
                .createdAt(u.getCreatedAt())
                .build();
    }
}