package com.civic.grievance.repository;

import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndApproved(Role role, boolean approved);

    List<User> findByDepartmentId(Long departmentId);

    List<User> findByRoleIn(List<Role> roles);

    long countByRole(Role role);
}