package com.civic.grievance.config;

import com.civic.grievance.entity.*;
import com.civic.grievance.entity.enums.*;
import com.civic.grievance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataMigrationRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final FeedbackRepository feedbackRepository;
    private final SlaConfigRepository slaConfigRepository;

    @Override
    public void run(ApplicationArguments args) {
        migratePasswords();
        seedDepartments();
        seedSlaConfigs();
        seedDemoUsers();
        seedComplaints();
    }

    // ─── Password migration ────────────────────────────────────────────────────
    private void migratePasswords() {
        int migrated = 0;
        for (User user : userRepository.findAll()) {
            String pwd = user.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$")) {
                user.setPassword(passwordEncoder.encode(pwd));
                userRepository.save(user);
                migrated++;
            }
        }
        if (migrated > 0) log.info("Password migration: {} user(s).", migrated);
    }

    // ─── Departments ──────────────────────────────────────────────────────────
    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;
        List<String[]> depts = List.of(
            new String[]{"Roads & Infrastructure",    "Potholes, road damage, footpaths, bridges",        "roads@bbmp.gov.in"},
            new String[]{"Water & Sanitation",        "Water supply, sewage, drainage issues",             "water@bbmp.gov.in"},
            new String[]{"Electricity",               "Power outages, dangerous wiring, meter issues",     "electricity@bbmp.gov.in"},
            new String[]{"Solid Waste Management",    "Garbage collection, waste disposal",                "waste@bbmp.gov.in"},
            new String[]{"Street Lighting",           "Broken streetlights, dark roads",                   "lights@bbmp.gov.in"},
            new String[]{"Health & Sanitation",       "Mosquito breeding, stray animals",                  "health@bbmp.gov.in"},
            new String[]{"Traffic & Transport",       "Traffic signals, road signs, speed breakers",       "traffic@bbmp.gov.in"},
            new String[]{"Building & Town Planning",  "Illegal construction, encroachments",               "planning@bbmp.gov.in"},
            new String[]{"Parks & Recreation",        "Park maintenance, public spaces",                   "parks@bbmp.gov.in"},
            new String[]{"Property Tax",              "Tax assessment, billing issues",                    "tax@bbmp.gov.in"}
        );
        for (String[] d : depts) {
            departmentRepository.save(Department.builder()
                .name(d[0]).description(d[1]).contactEmail(d[2]).build());
        }
        log.info("Seeded {} departments.", depts.size());
    }

    // ─── SLA Configs ──────────────────────────────────────────────────────────
    private void seedSlaConfigs() {
        if (slaConfigRepository.count() > 0) return;
        // Hours by category (URGENT/HIGH/MEDIUM/LOW)
        Map<Category, int[]> slaMap = Map.of(
            Category.ROADS,       new int[]{4,  24,  72,  168},
            Category.WATER,       new int[]{4,  12,  48,  120},
            Category.ELECTRICITY, new int[]{2,   8,  24,   72},
            Category.WASTE,       new int[]{8,  24,  72,  168},
            Category.STREET_LIGHT,new int[]{8,  24,  72,  168},
            Category.HEALTH,      new int[]{4,  12,  48,  120},
            Category.TRAFFIC,     new int[]{4,  24,  72,  168},
            Category.BUILDING,    new int[]{8,  48, 120,  240},
            Category.PARKS,       new int[]{12, 48, 120,  240},
            Category.OTHERS,      new int[]{8,  24,  72,  168}
        );
        Priority[] prios = {Priority.URGENT, Priority.HIGH, Priority.MEDIUM, Priority.LOW};
        for (var entry : slaMap.entrySet()) {
            for (int i = 0; i < prios.length; i++) {
                slaConfigRepository.save(SlaConfig.builder()
                    .category(entry.getKey()).priority(prios[i])
                    .resolutionTimeHours(entry.getValue()[i]).build());
            }
        }
        log.info("Seeded {} SLA configs.", slaConfigRepository.count());
    }

    // ─── Demo Users ───────────────────────────────────────────────────────────
    private void seedDemoUsers() {
        // Admin
        createIfAbsent("admin@demo.com",  "Demo Admin",  "demo123", Role.ADMIN,    null, "BBMP HQ, Bengaluru",         "9876540003", true);

        // Citizens
        createIfAbsent("citizen@demo.com",  "Ramesh Kumar",    "demo123", Role.CITIZEN, null, "42 MG Road, Bengaluru",         "9876540001", true);
        createIfAbsent("citizen2@demo.com", "Priya Sharma",    "demo123", Role.CITIZEN, null, "18 Koramangala 4th Block",      "9876540010", true);
        createIfAbsent("citizen3@demo.com", "Arun Nair",       "demo123", Role.CITIZEN, null, "7 Indiranagar 100 Feet Road",   "9876540011", true);
        createIfAbsent("citizen4@demo.com", "Meera Patel",     "demo123", Role.CITIZEN, null, "33 Jayanagar 9th Block",        "9876540012", true);
        createIfAbsent("citizen5@demo.com", "Suresh Reddy",    "demo123", Role.CITIZEN, null, "12 Whitefield Main Road",       "9876540013", true);

        // Supervisors (department heads)
        Long roads = deptId("Roads & Infrastructure");
        Long water = deptId("Water & Sanitation");

        createIfAbsent("supervisor.roads@demo.com", "Kiran Hegde",  "demo123", Role.SUPERVISOR, roads, "BBMP Roads Division",       "9876540020", true);
        createIfAbsent("supervisor.water@demo.com", "Sunita Rao",   "demo123", Role.SUPERVISOR, water, "BBMP Water Division",       "9876540021", true);

        // Set department heads
        assignHead(roads, "supervisor.roads@demo.com");
        assignHead(water, "supervisor.water@demo.com");

        // Officers
        createIfAbsent("officer@demo.com",  "Demo Officer",    "demo123", Role.OFFICER, roads, "BBMP Office, Bengaluru",       "9876540002", true);
        createIfAbsent("officer2@demo.com", "Ravi Shankar",    "demo123", Role.OFFICER, roads, "BBMP Roads Office, Bengaluru", "9876540030", true);
        createIfAbsent("officer3@demo.com", "Deepa Menon",     "demo123", Role.OFFICER, water, "BBMP Water Office",            "9876540031", true);
        createIfAbsent("officer4@demo.com", "Vikram Singh",    "demo123", Role.OFFICER, deptId("Electricity"),         "BESCOM Office, Bengaluru",   "9876540032", true);
        createIfAbsent("officer5@demo.com", "Anjali Verma",    "demo123", Role.OFFICER, deptId("Solid Waste Management"), "BBMP Waste Office",        "9876540033", true);
        createIfAbsent("officer6@demo.com", "Mohan Das",       "demo123", Role.OFFICER, deptId("Health & Sanitation"), "BBMP Health Office",         "9876540034", true);
    }

    private Long deptId(String name) {
        return departmentRepository.findByName(name).map(Department::getId).orElse(null);
    }

    private void assignHead(Long deptId, String email) {
        if (deptId == null) return;
        userRepository.findByEmail(email).ifPresent(u -> {
            departmentRepository.findById(deptId).ifPresent(d -> {
                d.setHeadId(u.getId());
                d.setHeadName(u.getName());
                departmentRepository.save(d);
                u.setDepartmentId(deptId);
                userRepository.save(u);
            });
        });
    }

    private void createIfAbsent(String email, String name, String password,
                                 Role role, Long deptId, String address, String contact, boolean approved) {
        if (userRepository.existsByEmail(email)) return;
        User user = User.builder()
                .email(email).name(name)
                .password(passwordEncoder.encode(password))
                .role(role).address(address).contactNumber(contact)
                .departmentId(deptId).approved(approved)
                .build();
        userRepository.save(user);
        log.info("Seeded demo user: {} ({})", email, role);
    }

    // ─── Complaints ───────────────────────────────────────────────────────────
    private void seedComplaints() {
        if (complaintRepository.count() > 0) return;

        User c1 = userRepository.findByEmail("citizen@demo.com").orElse(null);
        User c2 = userRepository.findByEmail("citizen2@demo.com").orElse(null);
        User c3 = userRepository.findByEmail("citizen3@demo.com").orElse(null);
        User c4 = userRepository.findByEmail("citizen4@demo.com").orElse(null);
        User c5 = userRepository.findByEmail("citizen5@demo.com").orElse(null);

        User o1 = userRepository.findByEmail("officer@demo.com").orElse(null);
        User o2 = userRepository.findByEmail("officer2@demo.com").orElse(null);
        User o3 = userRepository.findByEmail("officer3@demo.com").orElse(null);
        User o4 = userRepository.findByEmail("officer4@demo.com").orElse(null);
        User o5 = userRepository.findByEmail("officer5@demo.com").orElse(null);
        User o6 = userRepository.findByEmail("officer6@demo.com").orElse(null);

        if (c1 == null || o1 == null) return;

        Department roads  = departmentRepository.findByName("Roads & Infrastructure").orElse(null);
        Department water  = departmentRepository.findByName("Water & Sanitation").orElse(null);
        Department elec   = departmentRepository.findByName("Electricity").orElse(null);
        Department waste  = departmentRepository.findByName("Solid Waste Management").orElse(null);
        Department health = departmentRepository.findByName("Health & Sanitation").orElse(null);
        Department lights = departmentRepository.findByName("Street Lighting").orElse(null);

        LocalDateTime now = LocalDateTime.now();

        // Resolved complaints (older, with officer remarks)
        Complaint r1 = saveComplaint(c1, o1, roads, "Large pothole on MG Road near SBI ATM",
            "A deep pothole has formed outside SBI ATM, MG Road. Vehicles are swerving dangerously.",
            Status.RESOLVED, Priority.HIGH, Category.ROADS, "42 MG Road, Bengaluru",
            now.minusDays(20), now.minusDays(17), "Pothole filled with bituminous concrete. Road surface levelled.");

        Complaint r2 = saveComplaint(c2, o3, water, "No water supply for 3 days in Koramangala",
            "Our entire street has had no piped water for 72 hours. Residents are struggling.",
            Status.RESOLVED, Priority.URGENT, Category.WATER, "18 Koramangala 4th Block",
            now.minusDays(18), now.minusDays(16), "Main valve repaired. Water supply restored to the locality.");

        Complaint r3 = saveComplaint(c3, o4, elec, "Frequent power cuts in Indiranagar",
            "Power cuts happening every day from 2-5 PM for the past week. No prior notice given.",
            Status.CLOSED, Priority.HIGH, Category.ELECTRICITY, "7 Indiranagar 100 Feet Road",
            now.minusDays(15), now.minusDays(12), "Overloaded transformer replaced. Load balancing done.");

        Complaint r4 = saveComplaint(c4, o5, waste, "Overflowing garbage bin near Jayanagar Market",
            "The garbage bin at the corner of 9th Block market hasn't been cleared in a week. Stench is unbearable.",
            Status.RESOLVED, Priority.MEDIUM, Category.WASTE, "33 Jayanagar 9th Block",
            now.minusDays(14), now.minusDays(11), "Garbage cleared. Collection schedule updated for this zone.");

        Complaint r5 = saveComplaint(c5, o6, health, "Stagnant water causing mosquito breeding",
            "Water logging in the vacant plot next to our house is breeding mosquitoes. Dengue risk.",
            Status.RESOLVED, Priority.HIGH, Category.HEALTH, "12 Whitefield Main Road",
            now.minusDays(12), now.minusDays(9), "Anti-larval spray done. Plot owner notified to fill the pit.");

        // In-progress complaints
        saveComplaint(c1, o1, roads, "Road cave-in at Silk Board Junction approach",
            "Part of the road has caved in near Silk Board junction causing major traffic delays.",
            Status.IN_PROGRESS, Priority.URGENT, Category.ROADS, "Silk Board Junction, Bengaluru",
            now.minusDays(5), null, "Temporary barricading done. Permanent repair work scheduled.");

        saveComplaint(c2, o3, water, "Broken water main flooding street in Koramangala",
            "A water main pipe has burst near Koramangala 5th Block. Street is flooded.",
            Status.IN_PROGRESS, Priority.URGENT, Category.WATER, "Koramangala 5th Block",
            now.minusDays(3), null, "Emergency crew deployed. Pipe isolation in progress.");

        saveComplaint(c3, o4, elec, "Dangling live wire on JP Nagar street",
            "A live electrical wire is hanging dangerously low after the storm last night.",
            Status.IN_PROGRESS, Priority.URGENT, Category.ELECTRICITY, "JP Nagar 3rd Phase",
            now.minusDays(2), null, "BESCOM crew on site. Wire being made safe.");

        saveComplaint(c4, o2, roads, "Footpath encroachment by shop owners in Jayanagar",
            "Multiple shops have extended their establishments onto the footpath. Pedestrians forced onto road.",
            Status.IN_PROGRESS, Priority.MEDIUM, Category.ROADS, "Jayanagar 4th Block Main Road",
            now.minusDays(7), null, "Notice issued to encroachers. Eviction scheduled.");

        saveComplaint(c5, o5, waste, "Illegal dumping site formed near Whitefield",
            "Builders are illegally dumping construction debris on the roadside near our colony entrance.",
            Status.IN_PROGRESS, Priority.HIGH, Category.WASTE, "Whitefield Colony Entrance",
            now.minusDays(4), null, "FIR filed against contractor. Debris removal in progress.");

        // Assigned complaints
        saveComplaint(c1, o6, health, "Stray dogs attacking residents in BBMP zone",
            "Pack of stray dogs has become aggressive. Three people bitten in last week.",
            Status.ASSIGNED, Priority.HIGH, Category.HEALTH, "HSR Layout Sector 2",
            now.minusDays(3), null, null);

        saveComplaint(c2, o1, roads, "Potholes making road impassable during rain",
            "Multiple large potholes on this stretch. During rain it becomes a pond. Vehicles damaged.",
            Status.ASSIGNED, Priority.HIGH, Category.ROADS, "Sarjapur Road, Bengaluru",
            now.minusDays(2), null, null);

        saveComplaint(c3, o2, lights, "Street lights not working for 2 weeks",
            "The entire stretch of street lights from the main road to our colony is non-functional.",
            Status.ASSIGNED, Priority.MEDIUM, Category.STREET_LIGHT, "Ramamurthy Nagar Main Road",
            now.minusDays(4), null, null);

        saveComplaint(c4, o3, water, "Contaminated water supply with foul smell",
            "The water from the tap has a strong foul smell and brownish colour. Not safe for drinking.",
            Status.ASSIGNED, Priority.HIGH, Category.WATER, "BTM Layout 2nd Stage",
            now.minusDays(1), null, null);

        saveComplaint(c5, o4, elec, "Electricity meter tampering by neighbour",
            "Neighbour has illegally connected to my meter. BESCOM bill has doubled in 2 months.",
            Status.ASSIGNED, Priority.MEDIUM, Category.ELECTRICITY, "Electronic City Phase 1",
            now.minusDays(2), null, null);

        // Pending complaints (unassigned)
        saveComplaint(c1, null, roads, "Speed breaker required near school",
            "Children crossing the road near St. Josephs School are at risk. Vehicles speed dangerously.",
            Status.PENDING, Priority.HIGH, Category.ROADS, "St. Josephs School, Bengaluru",
            now.minusDays(1), null, null);

        saveComplaint(c2, null, null, "Park benches broken in Koramangala park",
            "All benches in the park are broken and have sharp metal edges. Dangerous for children.",
            Status.PENDING, Priority.LOW, Category.PARKS, "Koramangala Park, Bengaluru",
            now.minusHours(18), null, null);

        saveComplaint(c3, null, null, "Noise pollution from construction at night",
            "Construction work is happening 24/7 near our residential area. Violating noise norms.",
            Status.PENDING, Priority.MEDIUM, Category.BUILDING, "Indiranagar 12th Main",
            now.minusHours(12), null, null);

        saveComplaint(c4, null, null, "Overgrown trees blocking road visibility",
            "Trees on MG Road have grown into the road. Large branches obstruct visibility at junction.",
            Status.PENDING, Priority.MEDIUM, Category.ROADS, "MG Road Junction, Bengaluru",
            now.minusHours(8), null, null);

        saveComplaint(c5, null, null, "Property tax assessment error",
            "My property tax assessment seems incorrect. The built-up area listed is wrong.",
            Status.PENDING, Priority.LOW, Category.OTHERS, "Whitefield, Bengaluru",
            now.minusHours(4), null, null);

        log.info("Seeded {} complaints.", complaintRepository.count());

        // Add feedback for resolved/closed complaints
        seedFeedback(r1, c1, 5, "Excellent service! Fixed within 3 days. Thank you BBMP.");
        seedFeedback(r2, c2, 4, "Water restored but took 2 days. Could be faster for urgent cases.");
        seedFeedback(r3, c3, 3, "Power is back but we needed faster resolution for urgent category.");
        seedFeedback(r4, c4, 5, "Garbage cleared promptly. The officer was very professional.");
        seedFeedback(r5, c5, 4, "Good response but wish they had acted before residents complained.");

        log.info("Seeded feedback for resolved complaints.");
    }

    private Complaint saveComplaint(User citizen, User officer, Department dept,
                                    String title, String description, Status status,
                                    Priority priority, Category category, String address,
                                    LocalDateTime createdAt, LocalDateTime resolvedAt,
                                    String officerRemarks) {
        int slaHours = switch (priority) {
            case URGENT -> 4; case HIGH -> 24; case MEDIUM -> 72; case LOW -> 168;
        };
        Complaint c = Complaint.builder()
                .title(title).description(description).status(status)
                .priority(priority).category(category)
                .citizen(citizen).assignedOfficer(officer).department(dept)
                .address(address).latitude(12.9716 + Math.random() * 0.2)
                .longitude(77.5946 + Math.random() * 0.2)
                .createdAt(createdAt).updatedAt(createdAt)
                .slaDeadline(createdAt.plusHours(slaHours))
                .resolvedAt(resolvedAt)
                .officerRemarks(officerRemarks)
                .slaBreachNotified(false).escalated(false)
                .build();
        return complaintRepository.save(c);
    }

    private void seedFeedback(Complaint complaint, User citizen, int rating, String comments) {
        if (complaint == null || citizen == null) return;
        if (feedbackRepository.existsByComplaint_Id(complaint.getId())) return;
        feedbackRepository.save(Feedback.builder()
                .complaint(complaint).citizen(citizen)
                .rating(rating).comments(comments).build());
    }
}