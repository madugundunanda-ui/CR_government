package com.civic.grievance.repository;

import com.civic.grievance.entity.SlaConfig;
import com.civic.grievance.entity.enums.Category;
import com.civic.grievance.entity.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SlaConfigRepository extends JpaRepository<SlaConfig, Long> {
    Optional<SlaConfig> findByCategoryAndPriority(Category category, Priority priority);
}