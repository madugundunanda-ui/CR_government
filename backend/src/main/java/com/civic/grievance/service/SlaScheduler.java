package com.civic.grievance.service;

import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.entity.enums.Status;
import com.civic.grievance.repository.ComplaintRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlaScheduler {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    /**
     * Runs every hour. Finds unresolved complaints past SLA deadline.
     * - Sends ONE breach notification (guards with slaBreachNotified flag)
     * - Auto-escalates to department supervisor after 24h of breach
     */
    @Scheduled(fixedRate = 3_600_000) // every 1 hour
    @Transactional
    public void checkSlaBreaches() {
        LocalDateTime now = LocalDateTime.now();

        List<Complaint> breached = complaintRepository.findAll().stream()
            .filter(c -> c.getSlaDeadline() != null
                      && c.getSlaDeadline().isBefore(now)
                      && c.getStatus() != Status.RESOLVED
                      && c.getStatus() != Status.CLOSED)
            .toList();

        int notified = 0;
        int escalated = 0;

        for (Complaint c : breached) {
            // ── One-time breach notification ─────────────────────────────────────
            if (!c.isSlaBreachNotified()) {
                // Notify citizen
                notificationService.notifyUser(
                    c.getCitizen(),
                    "SLA Breach Alert",
                    "Your complaint GRV-" + c.getId() + " (" + c.getTitle() + ") has breached its SLA deadline.",
                    c.getId()
                );

                // Notify assigned officer (if any)
                if (c.getAssignedOfficer() != null) {
                    notificationService.notifyUser(
                        c.getAssignedOfficer(),
                        "⚠ SLA Breach: Action Required",
                        "Complaint GRV-" + c.getId() + " (" + c.getTitle() + ") has breached SLA. Immediate action required.",
                        c.getId()
                    );
                    emailService.sendEmail(
                        c.getAssignedOfficer().getEmail(),
                        "URGENT: SLA Breach — GRV-" + c.getId(),
                        "Complaint GRV-" + c.getId() + " has breached its SLA deadline. Please update immediately."
                    );
                }

                c.setSlaBreachNotified(true);
                complaintRepository.save(c);
                notified++;
            }

            // ── Auto-escalate after 24h of breach ───────────────────────────────
            if (!c.isEscalated()
                    && c.getSlaDeadline().isBefore(now.minusHours(24))
                    && c.getDepartment() != null) {

                // Find the department supervisor
                userRepository.findByDepartmentId(c.getDepartment().getId()).stream()
                        .filter(u -> u.getRole() == Role.SUPERVISOR)
                        .findFirst()
                        .ifPresent(supervisor -> {
                            notificationService.notifyUser(
                                supervisor,
                                "🚨 Escalation: SLA Critically Overdue",
                                "Complaint GRV-" + c.getId() + " (" + c.getTitle() +
                                        ") in your department is 24h past SLA deadline. Requires supervisor intervention.",
                                c.getId()
                            );
                            emailService.sendEmail(
                                supervisor.getEmail(),
                                "ESCALATION: SLA Critically Overdue — GRV-" + c.getId(),
                                "Complaint GRV-" + c.getId() + " in " + c.getDepartment().getName() +
                                        " department is critically overdue. Please take immediate action."
                            );
                        });

                c.setEscalated(true);
                complaintRepository.save(c);
                escalated++;
            }
        }

        if (!breached.isEmpty()) {
            log.warn("SLA check: {} complaint(s) past deadline. {} newly notified, {} escalated.",
                    breached.size(), notified, escalated);
        }
    }
}