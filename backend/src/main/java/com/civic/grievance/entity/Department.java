package com.civic.grievance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    /** The user ID of the SUPERVISOR who heads this department. Nullable until assigned. */
    @Column(name = "head_id")
    private Long headId;

    /** Name of the department head — denormalised for display performance */
    @Column(name = "head_name")
    private String headName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}