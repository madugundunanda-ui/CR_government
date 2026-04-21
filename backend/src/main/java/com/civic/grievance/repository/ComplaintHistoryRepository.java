package com.civic.grievance.repository;

import com.civic.grievance.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {

    List<ComplaintHistory> findByComplaint_IdOrderByChangedAtAsc(Long complaintId);

    List<ComplaintHistory> findByChangedBy_IdOrderByChangedAtDesc(Long userId);
}
