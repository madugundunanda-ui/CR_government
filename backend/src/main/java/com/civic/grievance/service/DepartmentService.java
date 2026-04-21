package com.civic.grievance.service;

import com.civic.grievance.dto.DepartmentRequest;
import com.civic.grievance.dto.DepartmentResponse;
import com.civic.grievance.dto.DepartmentStatsResponse;
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
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Department already exists: " + request.getName());
        }
        Department dept = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .contactEmail(request.getContactEmail())
                .build();
        return mapToResponse(departmentRepository.save(dept));
    }

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public DepartmentResponse getById(Long id) {
        return mapToResponse(departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id)));
    }

    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        if (request.getContactEmail() != null) dept.setContactEmail(request.getContactEmail());
        return mapToResponse(departmentRepository.save(dept));
    }

    public DepartmentResponse assignHead(Long deptId, Long userId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + deptId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getRole() != Role.SUPERVISOR && user.getRole() != Role.OFFICER) {
            throw new BadRequestException("Department head must be an OFFICER or SUPERVISOR");
        }

        // Promote to SUPERVISOR if they're just an OFFICER
        if (user.getRole() == Role.OFFICER) {
            user.setRole(Role.SUPERVISOR);
        }
        user.setDepartmentId(deptId);
        userRepository.save(user);

        dept.setHeadId(userId);
        dept.setHeadName(user.getName());
        return mapToResponse(departmentRepository.save(dept));
    }

    public void delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found: " + id);
        }
        departmentRepository.deleteById(id);
    }

    public List<DepartmentStatsResponse> getDepartmentStats() {
        return departmentRepository.findAll().stream().map(this::mapToStats).toList();
    }

    private DepartmentResponse mapToResponse(Department d) {
        long total = complaintRepository.countByDepartment_Id(d.getId());
        long pending = complaintRepository.countByDepartment_IdAndStatus(d.getId(), Status.PENDING)
                     + complaintRepository.countByDepartment_IdAndStatus(d.getId(), Status.ASSIGNED);
        long resolved = complaintRepository.countByDepartment_IdAndStatus(d.getId(), Status.RESOLVED)
                      + complaintRepository.countByDepartment_IdAndStatus(d.getId(), Status.CLOSED);
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .headId(d.getHeadId())
                .headName(d.getHeadName())
                .contactEmail(d.getContactEmail())
                .totalComplaints(total)
                .pendingComplaints(pending)
                .resolvedComplaints(resolved)
                .createdAt(d.getCreatedAt())
                .build();
    }

    private DepartmentStatsResponse mapToStats(Department d) {
        List<com.civic.grievance.entity.Complaint> complaints = complaintRepository.findByDepartment_Id(d.getId());
        long total      = complaints.size();
        long pending    = complaints.stream().filter(c -> c.getStatus() == Status.PENDING).count();
        long inProgress = complaints.stream().filter(c -> c.getStatus() == Status.IN_PROGRESS).count();
        long resolved   = complaints.stream().filter(c -> c.getStatus() == Status.RESOLVED).count();
        long closed     = complaints.stream().filter(c -> c.getStatus() == Status.CLOSED).count();
        long slaBreached = complaints.stream()
                .filter(c -> c.getSlaDeadline() != null && c.getSlaDeadline().isBefore(LocalDateTime.now())
                        && c.getStatus() != Status.RESOLVED && c.getStatus() != Status.CLOSED).count();
        long officers = userRepository.findByDepartmentId(d.getId()).stream()
                .filter(u -> u.getRole() == Role.OFFICER || u.getRole() == Role.SUPERVISOR).count();

        double resRate = total > 0 ? Math.round(((resolved + closed) * 100.0) / total * 10) / 10.0 : 0;
        double slaCompliance = total > 0 ? Math.round(((total - slaBreached) * 100.0) / total * 10) / 10.0 : 100;

        return DepartmentStatsResponse.builder()
                .departmentId(d.getId())
                .departmentName(d.getName())
                .headName(d.getHeadName())
                .totalComplaints(total)
                .pending(pending)
                .inProgress(inProgress)
                .resolved(resolved)
                .closed(closed)
                .slaBreached(slaBreached)
                .resolutionRatePct(resRate)
                .slaCompliancePct(slaCompliance)
                .totalOfficers(officers)
                .build();
    }
}