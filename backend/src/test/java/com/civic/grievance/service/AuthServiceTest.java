package com.civic.grievance.service;

import com.civic.grievance.dto.AuthResponse;
import com.civic.grievance.dto.LoginRequest;
import com.civic.grievance.dto.RegisterRequest;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * Spec cases covered: 1 (register citizen), 2 (register officer pending),
 * 3 (login JWT generation), 23 (duplicate email).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private UserDetailsService userDetailsService;
    @InjectMocks private AuthService authService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void injectEncoder() throws Exception {
        // Inject the real BCrypt encoder via reflection
        var field = AuthService.class.getDeclaredField("passwordEncoder");
        field.setAccessible(true);
        field.set(authService, passwordEncoder);
    }

    // ─── Test Case 1: Register citizen successfully ──────────────────────────

    @Test
    @DisplayName("TC-01: Citizen registers and is auto-approved")
    void registerCitizen_success() {
        RegisterRequest req = citizenRequest("citizen@test.com");
        when(userRepository.existsByEmail("citizen@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder().id(1L).name(u.getName()).email(u.getEmail())
                    .password(u.getPassword()).role(u.getRole()).address(u.getAddress())
                    .contactNumber(u.getContactNumber()).approved(u.isApproved()).build();
            return u;
        });

        AuthResponse res = authService.register(req);

        assertThat(res.getUserId()).isEqualTo(1L);
        assertThat(res.getRole()).isEqualTo(Role.CITIZEN);
        assertThat(res.isApproved()).isTrue();
        assertThat(res.getMessage()).containsIgnoringCase("successful");
        verify(userRepository).save(argThat(u -> u.isApproved() && u.getRole() == Role.CITIZEN));
    }

    // ─── Test Case 2: Register officer → pending approval ───────────────────

    @Test
    @DisplayName("TC-02: Officer registers with approved=false (pending admin approval)")
    void registerOfficer_pendingApproval() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Officer Dave"); req.setEmail("officer@test.com");
        req.setPassword("secure123"); req.setRole(Role.OFFICER);
        req.setAddress("Office St"); req.setContactNumber("9999");

        when(userRepository.existsByEmail("officer@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            return User.builder().id(2L).name(u.getName()).email(u.getEmail())
                    .password(u.getPassword()).role(u.getRole()).address(u.getAddress())
                    .contactNumber(u.getContactNumber()).approved(u.isApproved()).build();
        });

        AuthResponse res = authService.register(req);

        assertThat(res.isApproved()).isFalse();
        assertThat(res.getMessage()).containsIgnoringCase("approval");
        verify(userRepository).save(argThat(u -> !u.isApproved() && u.getRole() == Role.OFFICER));
    }

    // ─── Test Case 3: Login returns JWT token ───────────────────────────────

    @Test
    @DisplayName("TC-03: Admin login returns JWT token")
    void login_returnsJwt() {
        String rawPwd = "Admin@123";
        String hashed = passwordEncoder.encode(rawPwd);
        User admin = User.builder().id(3L).email("admin@test.com").name("Admin")
                .password(hashed).role(Role.ADMIN).approved(true).address("HQ").build();

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        UserDetails ud = org.springframework.security.core.userdetails.User.builder()
                .username("admin@test.com").password(hashed)
                .authorities("ROLE_ADMIN").build();
        when(userDetailsService.loadUserByUsername("admin@test.com")).thenReturn(ud);
        when(jwtUtil.generateToken(ud)).thenReturn("mock-jwt-token");

        LoginRequest req = new LoginRequest();
        req.setEmail("admin@test.com"); req.setPassword(rawPwd);
        AuthResponse res = authService.login(req);

        assertThat(res.getToken()).isEqualTo("mock-jwt-token");
        assertThat(res.getRole()).isEqualTo(Role.ADMIN);
        assertThat(res.getMessage()).containsIgnoringCase("successful");
    }

    // ─── Test Case 23: Duplicate email registration blocked ─────────────────

    @Test
    @DisplayName("TC-23: Duplicate email throws BadRequestException")
    void register_duplicateEmail_throws() {
        RegisterRequest req = citizenRequest("duplicate@test.com");
        when(userRepository.existsByEmail("duplicate@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }

    // ─── Wrong password ──────────────────────────────────────────────────────

    @Test
    @DisplayName("Wrong password throws BadRequestException")
    void login_wrongPassword_throws() {
        User user = User.builder().id(1L).email("u@test.com").name("U")
                .password(passwordEncoder.encode("correct")).role(Role.CITIZEN)
                .approved(true).address("addr").build();
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest();
        req.setEmail("u@test.com"); req.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class);
    }

    // ─── Unapproved officer cannot login ────────────────────────────────────

    @Test
    @DisplayName("Unapproved officer login throws BadRequestException")
    void login_unapprovedOfficer_throws() {
        User officer = User.builder().id(5L).email("o@test.com").name("O")
                .password(passwordEncoder.encode("pass")).role(Role.OFFICER)
                .approved(false).address("addr").build();
        when(userRepository.findByEmail("o@test.com")).thenReturn(Optional.of(officer));

        LoginRequest req = new LoginRequest();
        req.setEmail("o@test.com"); req.setPassword("pass");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("approval");
    }

    private RegisterRequest citizenRequest(String email) {
        RegisterRequest r = new RegisterRequest();
        r.setName("Test Citizen"); r.setEmail(email); r.setPassword("password123");
        r.setRole(Role.CITIZEN); r.setAddress("123 Main St"); r.setContactNumber("9876543210");
        return r;
    }
}