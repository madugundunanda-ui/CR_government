package com.civic.grievance.service;

import com.civic.grievance.dto.OfficerPerformanceResponse;
import com.civic.grievance.dto.OfficerManagementRequest;
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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;

    public List<UserResponse> getUsersByRole(String roleName) {
        try {
            Role role = Role.valueOf(roleName.toUpperCase());
            return userRepository.findByRole(role).stream().map(this::mapToResponse).toList();
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleName);
        }
    }

    public List<UserResponse> getPendingOfficers() {
        return userRepository.findByRoleIn(List.of(Role.OFFICER, Role.SUPERVISOR)).stream()
            .filter(u -> !u.isApproved())
            .map(this::mapToResponse)
            .toList();
    }

    public UserResponse approveOfficer(Long adminId, String adminName, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getRole() != Role.OFFICER && user.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException("User is not an officer");
        }
        user.setApproved(true);
        User saved = userRepository.save(user);

        auditLogService.log(
                "USER_APPROVED",
                "Admin approved " + saved.getRole() + " account for " + saved.getName() + " (" + saved.getEmail() + ")",
                adminId,
                adminName,
                saved.getId(),
                "USER"
        );

        return mapToResponse(saved);
    }

    public UserResponse getUserById(Long id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    public UserResponse updateProfile(Long id, String name, String email, String contactNumber, String address) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (name != null) user.setName(name);
        if (email != null && !email.isBlank() && !email.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email is already registered");
            }
            user.setEmail(email);
        }
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

    public List<UserResponse> getOfficerUsersByDepartment(Long deptId) {
        return userRepository.findByDepartmentId(deptId).stream()
                .filter(u -> u.getRole() == Role.OFFICER || u.getRole() == Role.SUPERVISOR)
                .map(this::mapToResponse)
                .toList();
    }

    public UserResponse updateOfficerByAdmin(Long adminId, String adminName, Long userId, OfficerManagementRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        applyCommonOfficerFields(user, request);

        if (user.getRole() == Role.CITIZEN) {
            if (request.getDepartmentId() != null) {
                throw new BadRequestException("Citizens cannot be assigned to a department");
            }
            if (request.getRole() != null && request.getRole() != Role.CITIZEN) {
                throw new BadRequestException("Citizen role cannot be changed via this endpoint");
            }
            if (request.getApproved() != null) {
                user.setApproved(request.getApproved());
            }
            User saved = userRepository.save(user);
            auditLogService.log(
                    "USER_UPDATED_BY_ADMIN",
                    "Admin updated citizen " + saved.getName() + " (" + saved.getEmail() + ")",
                    adminId,
                    adminName,
                    saved.getId(),
                    "USER"
            );
            return mapToResponse(saved);
        }

        ensureOfficerOrSupervisor(user);

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.getDepartmentId()));
            user.setDepartmentId(request.getDepartmentId());
        }

        if (request.getRole() != null) {
            if (request.getRole() != Role.OFFICER && request.getRole() != Role.SUPERVISOR) {
                throw new BadRequestException("Role can only be OFFICER or SUPERVISOR");
            }
            if (request.getRole() == Role.SUPERVISOR && user.getDepartmentId() == null) {
                throw new BadRequestException("SUPERVISOR must be assigned to a department");
            }
            user.setRole(request.getRole());
        }

        if (request.getApproved() != null) {
            user.setApproved(request.getApproved());
        }

        User saved = userRepository.save(user);
        auditLogService.log(
            "USER_UPDATED_BY_ADMIN",
            "Admin updated " + saved.getRole() + " user " + saved.getName()
                + " (" + saved.getEmail() + ")"
                + (saved.getDepartmentId() != null ? " in departmentId=" + saved.getDepartmentId() : ""),
            adminId,
            adminName,
            saved.getId(),
            "USER"
        );
        return mapToResponse(saved);
    }

    public UserResponse updateOfficerBySupervisor(Long supervisorId, Long officerId, OfficerManagementRequest request) {
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found: " + supervisorId));
        if (supervisor.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException("Only supervisors can use this endpoint");
        }
        if (supervisor.getDepartmentId() == null) {
            throw new BadRequestException("Supervisor has no department assigned");
        }

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found: " + officerId));
        ensureOfficerOrSupervisor(officer);

        if (!supervisor.getDepartmentId().equals(officer.getDepartmentId())) {
            throw new BadRequestException("You can manage only officers in your own department");
        }

        applyCommonOfficerFields(officer, request);

        if (request.getDepartmentId() != null && !supervisor.getDepartmentId().equals(request.getDepartmentId())) {
            throw new BadRequestException("You cannot move officers to another department");
        }

        if (request.getRole() != null || request.getApproved() != null) {
            throw new BadRequestException("Supervisors cannot change role or approval status");
        }

        User saved = userRepository.save(officer);
        auditLogService.log(
            "USER_UPDATED_BY_SUPERVISOR",
            "Supervisor updated officer profile for " + saved.getName() + " (" + saved.getEmail() + ")",
            supervisor.getId(),
            supervisor.getName(),
            saved.getId(),
            "USER"
        );
        return mapToResponse(saved);
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
                .identityType(u.getIdentityType())
                .identityNumber(u.getIdentityNumber())
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

    private void ensureOfficerOrSupervisor(User user) {
        if (user.getRole() != Role.OFFICER && user.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException("Target user must be OFFICER or SUPERVISOR");
        }
    }

    private void applyCommonOfficerFields(User user, OfficerManagementRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already registered");
            }
            user.setEmail(request.getEmail().trim());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
    }
}