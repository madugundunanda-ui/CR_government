package com.civic.grievance.service;

import com.civic.grievance.dto.OfficerPerformanceResponse;
import com.civic.grievance.dto.UserResponse;
import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.DepartmentRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;

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

    public List<OfficerPerformanceResponse> getOfficerPerformance() {
        List<User> officers = userRepository.findByRoleIn(List.of(Role.OFFICER, Role.SUPERVISOR));
        return officers.stream().map(this::mapToPerformance).toList();
    }

    public List<OfficerPerformanceResponse> getOfficerPerformanceByDepartment(Long deptId) {
        return userRepository.findByDepartmentId(deptId).stream()
                .filter(u -> u.getRole() == Role.OFFICER || u.getRole() == Role.SUPERVISOR)
                .map(this::mapToPerformance).toList();
    }

    public UserResponse mapToResponse(User u) {
        String deptName = null;
        if (u.getDepartmentId() != null) {
            deptName = departmentRepository.findById(u.getDepartmentId())
                    .map(Department::getName).orElse(null);
        }
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .contactNumber(u.getContactNumber())
                .address(u.getAddress())
                .approved(u.isApproved())
                .departmentId(u.getDepartmentId())
                .departmentName(deptName)
                .createdAt(u.getCreatedAt())
                .build();
    }

    private OfficerPerformanceResponse mapToPerformance(User u) {
        long total    = complaintRepository.countByAssignedOfficer_Id(u.getId());
        long inProg   = complaintRepository.countByAssignedOfficer_IdAndStatus(u.getId(), Status.IN_PROGRESS);
        long resolved = complaintRepository.countByAssignedOfficer_IdAndStatus(u.getId(), Status.RESOLVED);
        long closed   = complaintRepository.countByAssignedOfficer_IdAndStatus(u.getId(), Status.CLOSED);
        long breached = complaintRepository.findByAssignedOfficer_Id(u.getId()).stream()
                .filter(c -> c.getSlaDeadline() != null && c.getSlaDeadline().isBefore(LocalDateTime.now())
                        && c.getStatus() != Status.RESOLVED && c.getStatus() != Status.CLOSED).count();

        String deptName = u.getDepartmentId() != null
                ? departmentRepository.findById(u.getDepartmentId()).map(Department::getName).orElse(null)
                : null;

        double resRate = total > 0 ? Math.round(((resolved + closed) * 100.0) / total * 10) / 10.0 : 0;
        double slaRate = total > 0 ? Math.round(((total - breached) * 100.0) / total * 10) / 10.0 : 100;

        return OfficerPerformanceResponse.builder()
                .officerId(u.getId())
                .officerName(u.getName())
                .officerEmail(u.getEmail())
                .departmentId(u.getDepartmentId())
                .departmentName(deptName)
                .totalAssigned(total)
                .inProgress(inProg)
                .resolved(resolved)
                .closed(closed)
                .slaBreached(breached)
                .resolutionRatePct(resRate)
                .slaCompliancePct(slaRate)
                .build();
    }
}