package com.civic.grievance.controller;

import com.civic.grievance.config.TestSecurityConfig;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base class for controller integration tests.
 * Uses H2 in-memory DB (application-test.properties).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
public abstract class IntegrationTestBase {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected UserRepository userRepository;
    @Autowired protected PasswordEncoder passwordEncoder;
    @Autowired protected JwtUtil jwtUtil;
    @Autowired protected UserDetailsService userDetailsService;

    protected String adminToken;
    protected String citizenToken;
    protected String officerToken;
    protected User adminUser;
    protected User citizenUser;
    protected User officerUser;

    @BeforeEach
    void setUpUsers() {
        userRepository.deleteAll();

        adminUser   = createUser("admin@test.com",   "Admin",   "admin123",   Role.ADMIN,   true);
        citizenUser = createUser("citizen@test.com", "Citizen", "citizen123", Role.CITIZEN, true);
        officerUser = createUser("officer@test.com", "Officer", "officer123", Role.OFFICER, true);

        adminToken   = generateToken("admin@test.com");
        citizenToken = generateToken("citizen@test.com");
        officerToken = generateToken("officer@test.com");
    }

    protected User createUser(String email, String name, String password, Role role, boolean approved) {
        User u = User.builder().email(email).name(name)
                .password(passwordEncoder.encode(password))
                .role(role).address("Test Address").contactNumber("9876543210")
                .approved(approved).build();
        return userRepository.save(u);
    }

    protected String generateToken(String email) {
        var ud = userDetailsService.loadUserByUsername(email);
        return jwtUtil.generateToken(ud);
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }
}