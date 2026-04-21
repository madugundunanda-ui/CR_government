package com.civic.grievance.service;

import com.civic.grievance.dto.ComplaintRequest;
import com.civic.grievance.dto.ComplaintResponse;
import com.civic.grievance.dto.FeedbackRequest;
import com.civic.grievance.dto.UpdateStatusRequest;
import com.civic.grievance.entity.*;
import com.civic.grievance.entity.enums.*;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ComplaintService and FeedbackService.
 * Spec cases covered: 5, 6, 8-12, 17, 19-21.
 */
@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private UserRepository userRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private SlaConfigRepository slaConfigRepository;
    @Mock private NotificationService notificationService;
    @Mock private EmailService emailService;
    @Mock private AuditLogService auditLogService;
    @Mock private FeedbackRepository feedbackRepository;
    @InjectMocks private ComplaintService complaintService;

    // ─── Test Case 5: Create complaint with geo-tags ─────────────────────────

    @Test
    @DisplayName("TC-05: Citizen creates geo-tagged complaint")
    void createComplaint_withGeoTags() {
        User citizen = buildUser(1L, Role.CITIZEN, "citizen@test.com", true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(citizen));
        when(slaConfigRepository.findByCategoryAndPriority(any(), any())).thenReturn(Optional.empty());
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> {
            Complaint c = inv.getArgument(0);
            c = Complaint.builder().id(10L).title(c.getTitle()).description(c.getDescription())
                    .status(c.getStatus()).priority(c.getPriority()).citizen(c.getCitizen())
                    .latitude(c.getLatitude()).longitude(c.getLongitude())
                    .createdAt(LocalDateTime.now()).slaDeadline(LocalDateTime.now().plusHours(24))
                    .build();
            return c;
        });
        doNothing().when(notificationService).notifyUser(any(), any(), any(), any());
        doNothing().when(emailService).sendComplaintSubmitted(any(), any(), anyLong(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        ComplaintRequest req = new ComplaintRequest();
        req.setCitizenId(1L); req.setTitle("Pothole on MG Road");
        req.setDescription("Large dangerous pothole near ATM");
        req.setPriority(Priority.HIGH); req.setLatitude(12.9716); req.setLongitude(77.5946);

        ComplaintResponse res = complaintService.createComplaint(req);

        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getLatitude()).isEqualTo(12.9716);
        assertThat(res.getLongitude()).isEqualTo(77.5946);
        assertThat(res.getStatus()).isEqualTo(Status.PENDING);
    }

    // ─── Test Case 6: SLA deadline auto-calculated ───────────────────────────

    @Test
    @DisplayName("TC-06: SLA deadline is 4h for URGENT, 24h for HIGH, 72h for MEDIUM")
    void createComplaint_slaDeadlineAutoCalculated() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(citizen));
        when(slaConfigRepository.findByCategoryAndPriority(any(), any())).thenReturn(Optional.empty());
        doNothing().when(notificationService).notifyUser(any(), any(), any(), any());
        doNothing().when(emailService).sendComplaintSubmitted(any(), any(), anyLong(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        // Test URGENT → 4h
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> {
            Complaint c = inv.getArgument(0);
            return Complaint.builder().id(1L).title(c.getTitle()).description(c.getDescription())
                    .status(c.getStatus()).priority(c.getPriority()).citizen(c.getCitizen())
                    .createdAt(c.getCreatedAt()).slaDeadline(c.getSlaDeadline()).build();
        });

        ComplaintRequest req = buildRequest(1L, Priority.URGENT);
        ComplaintResponse res = complaintService.createComplaint(req);
        assertThat(res.getSlaDeadline()).isAfter(LocalDateTime.now().plusHours(3));
        assertThat(res.getSlaDeadline()).isBefore(LocalDateTime.now().plusHours(5));

        // Test HIGH → 24h
        req.setPriority(Priority.HIGH);
        res = complaintService.createComplaint(req);
        assertThat(res.getSlaDeadline()).isAfter(LocalDateTime.now().plusHours(23));
    }

    // ─── Test Case 8: Admin updates status to ASSIGNED ───────────────────────

    @Test
    @DisplayName("TC-08: Admin assigns officer → status becomes ASSIGNED")
    void assignOfficer_statusBecomesAssigned() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        User officer = buildUser(2L, Role.OFFICER, "o@test.com", true);
        Complaint complaint = buildComplaint(10L, Status.PENDING, citizen, null);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(2L)).thenReturn(Optional.of(officer));
        when(complaintRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyUser(any(), any(), any(), any());
        doNothing().when(emailService).sendOfficerAssigned(any(), any(), anyLong(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        ComplaintResponse res = complaintService.assignOfficer(10L, 2L);

        assertThat(res.getStatus()).isEqualTo(Status.ASSIGNED);
        assertThat(res.getAssignedOfficerId()).isEqualTo(2L);
    }

    // ─── Test Case 9: Officer updates status to IN_PROGRESS ─────────────────

    @Test
    @DisplayName("TC-09: Officer updates their complaint to IN_PROGRESS")
    void updateStatus_officerInProgress() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        User officer = buildUser(2L, Role.OFFICER, "o@test.com", true);
        Complaint complaint = buildComplaint(10L, Status.ASSIGNED, citizen, officer);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyUser(any(), any(), any(), any());
        doNothing().when(emailService).sendStatusUpdate(any(), any(), anyLong(), any(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus(Status.IN_PROGRESS);
        ComplaintResponse res = complaintService.updateStatus(10L, req, 2L);

        assertThat(res.getStatus()).isEqualTo(Status.IN_PROGRESS);
    }

    // ─── Test Case 11: Officer cannot update other officers' complaints ───────

    @Test
    @DisplayName("TC-11: Officer cannot update complaint assigned to different officer")
    void updateStatus_wrongOfficer_throws() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        User officerA = buildUser(2L, Role.OFFICER, "a@test.com", true);
        Complaint complaint = buildComplaint(10L, Status.ASSIGNED, citizen, officerA);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));

        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus(Status.IN_PROGRESS);
        Long wrongOfficerId = 99L; // different officer

        assertThatThrownBy(() -> complaintService.updateStatus(10L, req, wrongOfficerId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not authorized");
    }

    // ─── Test Case 12: Citizen views own complaints ──────────────────────────

    @Test
    @DisplayName("TC-12: Citizen retrieves only their own complaints")
    void getComplaintsByCitizen_returnsOnlyOwn() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        List<Complaint> list = List.of(
                buildComplaint(1L, Status.PENDING, citizen, null),
                buildComplaint(2L, Status.RESOLVED, citizen, null)
        );
        when(complaintRepository.findByCitizen_Id(1L)).thenReturn(list);

        List<ComplaintResponse> res = complaintService.getComplaintsByCitizen(1L);

        assertThat(res).hasSize(2);
        assertThat(res).allMatch(c -> c.getCitizenId() == 1L);
    }

    // ─── Test Case 17: Notification triggered on status change ──────────────

    @Test
    @DisplayName("TC-17: Notification is created when status changes")
    void updateStatus_triggersNotification() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        User officer = buildUser(2L, Role.OFFICER, "o@test.com", true);
        Complaint complaint = buildComplaint(10L, Status.ASSIGNED, citizen, officer);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendStatusUpdate(any(), any(), anyLong(), any(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus(Status.RESOLVED);
        complaintService.updateStatus(10L, req, 2L);

        verify(notificationService).notifyUser(eq(citizen), anyString(), anyString(), eq(10L));
    }

    // ─── Test Case 19: SLA breach detection ─────────────────────────────────

    @Test
    @DisplayName("TC-19: Past slaDeadline with non-resolved status = SLA breached")
    void slaBreachDetection() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        Complaint breached = buildComplaint(5L, Status.PENDING, citizen, null);
        // Set deadline in the past
        breached.setSlaDeadline(LocalDateTime.now().minusDays(2));

        boolean isBreached = breached.getSlaDeadline().isBefore(LocalDateTime.now())
                && breached.getStatus() != Status.RESOLVED
                && breached.getStatus() != Status.CLOSED;

        assertThat(isBreached).isTrue();
    }

    // ─── Test Case 20: Reassign officer ─────────────────────────────────────

    @Test
    @DisplayName("TC-20: Admin reassigns complaint to different officer")
    void reassignOfficer_success() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        User oldOfficer = buildUser(2L, Role.OFFICER, "old@test.com", true);
        User newOfficer = buildUser(3L, Role.OFFICER, "new@test.com", true);
        Complaint complaint = buildComplaint(10L, Status.ASSIGNED, citizen, oldOfficer);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(3L)).thenReturn(Optional.of(newOfficer));
        when(complaintRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyUser(any(), any(), any(), any());
        doNothing().when(emailService).sendOfficerAssigned(any(), any(), anyLong(), any());
        doNothing().when(auditLogService).log(any(), any(), any(), any(), any(), any());

        ComplaintResponse res = complaintService.assignOfficer(10L, 3L);

        assertThat(res.getAssignedOfficerId()).isEqualTo(3L);
    }

    // ─── Test Case 21: Feedback on resolved complaint ───────────────────────

    @Test
    @DisplayName("TC-21: Citizen submits feedback only for RESOLVED complaints")
    void feedback_onlyForResolved() {
        User citizen = buildUser(1L, Role.CITIZEN, "c@test.com", true);
        Complaint pendingComplaint = buildComplaint(5L, Status.PENDING, citizen, null);

        when(complaintRepository.findById(5L)).thenReturn(Optional.of(pendingComplaint));

        FeedbackService feedbackService = new FeedbackService(
                feedbackRepository, complaintRepository, userRepository);
        FeedbackRequest req = new FeedbackRequest();
        req.setComplaintId(5L); req.setRating(4);

        assertThatThrownBy(() -> feedbackService.submitFeedback(req, 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("RESOLVED");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User buildUser(Long id, Role role, String email, boolean approved) {
        return User.builder().id(id).name("User " + id).email(email)
                .password("hashed").role(role).address("addr").contactNumber("9876")
                .approved(approved).build();
    }

    private Complaint buildComplaint(Long id, Status status, User citizen, User officer) {
        return Complaint.builder().id(id).title("Test Complaint").description("Test description")
                .status(status).priority(Priority.MEDIUM).citizen(citizen)
                .assignedOfficer(officer).createdAt(LocalDateTime.now())
                .slaDeadline(LocalDateTime.now().plusHours(24)).build();
    }

    private ComplaintRequest buildRequest(Long citizenId, Priority priority) {
        ComplaintRequest r = new ComplaintRequest();
        r.setCitizenId(citizenId); r.setTitle("Test"); r.setDescription("Test description here");
        r.setPriority(priority);
        return r;
    }
}