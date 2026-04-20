package com.civic.grievance.entity;

import com.civic.grievance.entity.enums.Category;
import com.civic.grievance.entity.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sla_configs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"category", "priority"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private int resolutionTimeHours;
}