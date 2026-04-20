package com.civic.grievance.config;

import com.civic.grievance.entity.Department;
import com.civic.grievance.entity.User;
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
    }

    private void migratePasswords() {
        List<User> users = userRepository.findAll();
        int migrated = 0;
        for (User user : users) {
            String pwd = user.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$")) {
                user.setPassword(passwordEncoder.encode(pwd));
                userRepository.save(user);
                migrated++;
                log.info("Migrated password for user: {}", user.getEmail());
            }
        }
        if (migrated > 0) log.info("Password migration complete. {} user(s) migrated.", migrated);
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;

        List<String[]> defaults = List.of(
            new String[]{"Roads & Infrastructure", "Potholes, road damage, footpaths, bridges"},
            new String[]{"Water & Sanitation", "Water supply, sewage, drainage issues"},
            new String[]{"Electricity", "Power outages, dangerous wiring, meter issues"},
            new String[]{"Solid Waste Management", "Garbage collection, waste disposal, recycling"},
            new String[]{"Street Lighting", "Broken streetlights, dark roads"},
            new String[]{"Health & Sanitation", "Mosquito breeding, stray animals, sanitation"},
            new String[]{"Traffic & Transport", "Traffic signals, road signs, speed breakers"},
            new String[]{"Building & Town Planning", "Illegal construction, encroachments"},
            new String[]{"Parks & Recreation", "Park maintenance, public spaces"},
            new String[]{"Property Tax", "Tax assessment, billing issues"}
        );

        for (String[] d : defaults) {
            Department dept = Department.builder()
                .name(d[0])
                .description(d[1])
                .build();
            departmentRepository.save(dept);
        }
        log.info("Seeded {} default departments.", defaults.size());
    }
}
