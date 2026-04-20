package com.civic.grievance.entity;

import com.civic.grievance.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String contactNumber;

    @Column(nullable = false)
    private String address;

    // false for OFFICER accounts until admin approves; true for all others
    @Builder.Default
    @Column(name = "approved", columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1")
    private boolean approved = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        // Officers must be approved by admin before they can log in
        if (role == Role.OFFICER || role == Role.SUPERVISOR) {
            // Keep whatever was set (false by default via builder)
        } else {
            this.approved = true;
        }
    }
}