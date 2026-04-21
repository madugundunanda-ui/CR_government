package com.civic.grievance.entity;

import com.civic.grievance.entity.enums.Category;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    private Double latitude;
    private Double longitude;

    @Column(length = 500)
    private String address;

    /** Officer's public remarks/notes saved on each status update */
    @Column(name = "officer_remarks", length = 1000)
    private String officerRemarks;

    /** Internal admin/supervisor notes (not visible to citizen) */
    @Column(name = "internal_notes", length = 1000)
    private String internalNotes;

    /** True once complaint has been auto-escalated due to SLA breach */
    @Builder.Default
    @Column(name = "escalated", nullable = false)
    private boolean escalated = false;

    /** Prevents duplicate SLA breach notifications from hourly scheduler */
    @Builder.Default
    @Column(name = "sla_breach_notified", nullable = false)
    private boolean slaBreachNotified = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime slaDeadline;

    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}