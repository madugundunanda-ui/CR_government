package com.civic.grievance.repository;

import com.civic.grievance.entity.Complaint;
import com.civic.grievance.entity.enums.Priority;
import com.civic.grievance.entity.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCitizen_Id(Long citizenId);

    List<Complaint> findByAssignedOfficer_Id(Long officerId);

    List<Complaint> findByStatus(Status status);

    List<Complaint> findByPriority(Priority priority);

    List<Complaint> findByDepartment_Id(Long departmentId);

    long countByStatus(Status status);

    long countByPriority(Priority priority);

    @Query("SELECT c FROM Complaint c WHERE c.assignedOfficer IS NULL AND c.status = 'PENDING'")
    List<Complaint> findUnassignedPendingComplaints();
}