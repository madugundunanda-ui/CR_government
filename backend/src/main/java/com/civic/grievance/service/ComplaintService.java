package com.civic.grievance.service;

import com.civic.grievance.dto.ComplaintRequest;
import com.civic.grievance.dto.ComplaintResponse;
import com.civic.grievance.dto.UpdateStatusRequest;
import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.DepartmentRepository;
import com.civic.grievance.repository.SlaConfigRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    public ComplaintResponse createComplaint(ComplaintRequest request) {
        User citizen = userRepository.findById(request.getCitizenId())
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found: " + request.getCitizenId()));

        if (citizen.getRole() != Role.CITIZEN) {
            throw new BadRequestException("Only citizens can raise complaints");
        }

        User assignedOfficer = null;
        if (request.getAssignedOfficerId() != null) {
            assignedOfficer = userRepository.findById(request.getAssignedOfficerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Officer not found: " + request.getAssignedOfficerId()));
            if (assignedOfficer.getRole() != Role.OFFICER && assignedOfficer.getRole() != Role.SUPERVISOR) {
                throw new BadRequestException("Assigned user must be OFFICER or SUPERVISOR");
            }
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.getDepartmentId()));
        }

        int slaHours = 24;
        if (request.getCategory() != null && request.getPriority() != null) {
            slaHours = slaConfigRepository
                    .findByCategoryAndPriority(request.getCategory(), request.getPriority())
                    .map(c -> c.getResolutionTimeHours())
                    .orElse(getDefaultSlaHours(request.getPriority()));
        } else if (request.getPriority() != null) {
            slaHours = getDefaultSlaHours(request.getPriority());
        }

        LocalDateTime now = LocalDateTime.now();
        Status initialStatus = assignedOfficer != null ? Status.ASSIGNED : Status.PENDING;

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .category(request.getCategory())
                .status(initialStatus)
                .citizen(citizen)
                .assignedOfficer(assignedOfficer)
                .department(department)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .createdAt(now)
                .slaDeadline(now.plusHours(slaHours))
                .build();

        Complaint saved = complaintRepository.save(complaint);

        notificationService.notifyUser(citizen, "Complaint Submitted",
                "Your complaint '" + saved.getTitle() + "' (GRV-" + saved.getId() + ") was received.", saved.getId());

        emailService.sendComplaintSubmitted(citizen.getEmail(), citizen.getName(), saved.getId(), saved.getTitle());

        auditLogService.log("COMPLAINT_CREATED",
                "Citizen " + citizen.getName() + " raised: " + saved.getTitle(),
                citizen.getId(), citizen.getName(), saved.getId(), "COMPLAINT");

        return mapToResponse(saved);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<ComplaintResponse> getComplaintsByCitizen(Long citizenId) {
        return complaintRepository.findByCitizen_Id(citizenId).stream().map(this::mapToResponse).toList();
    }

    public List<ComplaintResponse> getComplaintsByOfficer(Long officerId) {
        return complaintRepository.findByAssignedOfficer_Id(officerId).stream().map(this::mapToResponse).toList();
    }

    public ComplaintResponse assignOfficer(Long complaintId, Long officerId) {
        Complaint complaint = findById(complaintId);
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found: " + officerId));

        if (officer.getRole() != Role.OFFICER && officer.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException("User is not an OFFICER or SUPERVISOR");
        }

        complaint.setAssignedOfficer(officer);
        complaint.setStatus(Status.ASSIGNED);
        Complaint saved = complaintRepository.save(complaint);

        notificationService.notifyUser(officer, "New Complaint Assigned",
                "Complaint '" + saved.getTitle() + "' (GRV-" + saved.getId() + ") assigned to you.", saved.getId());
        
        notificationService.notifyUser(saved.getCitizen(), "Officer Assigned",
                "An officer has been assigned to your complaint '" + saved.getTitle() + "'.", saved.getId());

        emailService.sendOfficerAssigned(officer.getEmail(), officer.getName(), saved.getId(), saved.getTitle());

        auditLogService.log("OFFICER_ASSIGNED",
                "Officer " + officer.getName() + " assigned to GRV-" + saved.getId(),
                officer.getId(), officer.getName(), saved.getId(), "COMPLAINT");

        return mapToResponse(saved);
    }

    public ComplaintResponse updateStatus(Long complaintId, UpdateStatusRequest request, Long requestingOfficerId) {
        Complaint complaint = findById(complaintId);

        if (requestingOfficerId != null) {
            if (complaint.getAssignedOfficer() == null ||
                    !complaint.getAssignedOfficer().getId().equals(requestingOfficerId)) {
                throw new BadRequestException("You are not authorized to update this complaint");
            }
        }

        complaint.setStatus(request.getStatus());
        if (request.getStatus() == Status.RESOLVED || request.getStatus() == Status.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        
        Complaint saved = complaintRepository.save(complaint);

        notificationService.notifyUser(saved.getCitizen(), "Complaint Status Updated",
                "Your complaint '" + saved.getTitle() + "' is now: " + request.getStatus(), saved.getId());

        emailService.sendStatusUpdate(saved.getCitizen().getEmail(), saved.getCitizen().getName(),
                saved.getId(), saved.getTitle(), request.getStatus().name());

        auditLogService.log("STATUS_CHANGED",
                "Complaint GRV-" + saved.getId() + " status → " + request.getStatus(),
                requestingOfficerId != null ? requestingOfficerId : 0L,
                requestingOfficerId != null ? "Officer" : "Admin",
                saved.getId(), "COMPLAINT");

        return mapToResponse(saved);
    }

    public ComplaintResponse updateStatusByAdmin(Long complaintId, UpdateStatusRequest request) {
        return updateStatus(complaintId, request, null);
    }

    private Complaint findById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + id));
    }

    private int getDefaultSlaHours(Priority priority) {
        return switch (priority) {
            case URGENT -> 4;
            case HIGH   -> 24;
            case MEDIUM -> 72;
            case LOW    -> 168;
        };
    }

    public ComplaintResponse mapToResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .status(c.getStatus())
                .priority(c.getPriority())
                .category(c.getCategory())
                .citizenId(c.getCitizen().getId())
                .citizenName(c.getCitizen().getName())
                .assignedOfficerId(c.getAssignedOfficer() != null ? c.getAssignedOfficer().getId() : null)
                .assignedOfficerName(c.getAssignedOfficer() != null ? c.getAssignedOfficer().getName() : null)
                .departmentId(c.getDepartment() != null ? c.getDepartment().getId() : null)
                .departmentName(c.getDepartment() != null ? c.getDepartment().getName() : null)
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .address(c.getAddress())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .slaDeadline(c.getSlaDeadline())
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}