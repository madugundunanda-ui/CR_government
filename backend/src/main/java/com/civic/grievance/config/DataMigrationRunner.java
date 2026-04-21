package com.civic.grievance.config;

import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.repository.DepartmentRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataMigrationRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;

    @Override
    public void run(ApplicationArguments args) {
        migratePasswords();
        seedDepartments();
        seedDemoUsers();
    }

    private void migratePasswords() {
        int migrated = 0;
        for (User user : userRepository.findAll()) {
            String pwd = user.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$")) {
                user.setPassword(passwordEncoder.encode(pwd));
                userRepository.save(user);
                migrated++;
                log.info("Migrated password: {}", user.getEmail());
            }
        }
        if (migrated > 0) log.info("Password migration: {} user(s).", migrated);
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;
        List<String[]> depts = List.of(
            new String[]{"Roads & Infrastructure", "Potholes, road damage, footpaths, bridges"},
            new String[]{"Water & Sanitation", "Water supply, sewage, drainage issues"},
            new String[]{"Electricity", "Power outages, dangerous wiring, meter issues"},
            new String[]{"Solid Waste Management", "Garbage collection, waste disposal"},
            new String[]{"Street Lighting", "Broken streetlights, dark roads"},
            new String[]{"Health & Sanitation", "Mosquito breeding, stray animals"},
            new String[]{"Traffic & Transport", "Traffic signals, road signs, speed breakers"},
            new String[]{"Building & Town Planning", "Illegal construction, encroachments"},
            new String[]{"Parks & Recreation", "Park maintenance, public spaces"},
            new String[]{"Property Tax", "Tax assessment, billing issues"}
        );
        for (String[] d : depts) {
            departmentRepository.save(Department.builder().name(d[0]).description(d[1]).build());
        }
        log.info("Seeded {} departments.", depts.size());
    }

    /** Creates demo accounts (citizen@demo.com, officer@demo.com, admin@demo.com)
     *  with password 'demo123' if they don't already exist.
     *  These match the credentials shown on the login page. */
    private void seedDemoUsers() {
        createIfAbsent("citizen@demo.com", "Demo Citizen",     "demo123", Role.CITIZEN,  "42 MG Road, Bengaluru",    "9876540001", true);
        createIfAbsent("officer@demo.com", "Demo Officer",     "demo123", Role.OFFICER,  "BBMP Office, Bengaluru",   "9876540002", true);
        createIfAbsent("admin@demo.com",   "Demo Admin",       "demo123", Role.ADMIN,    "BBMP HQ, Bengaluru",       "9876540003", true);
    }

    private void createIfAbsent(String email, String name, String password,
                                 Role role, String address, String contact, boolean approved) {
        if (userRepository.existsByEmail(email)) return;
        User user = User.builder()
                .email(email).name(name)
                .password(passwordEncoder.encode(password))
                .role(role).address(address).contactNumber(contact)
                .approved(approved)
                .build();
        userRepository.save(user);
        log.info("Seeded demo user: {} ({})", email, role);
    }
}