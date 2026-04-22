package com.civic.grievance.service;

import com.civic.grievance.dto.AuthResponse;
import com.civic.grievance.dto.LoginRequest;
import com.civic.grievance.dto.RegisterRequest;
import com.civic.grievance.entity.User;
import com.civic.grievance.entity.enums.Role;
import com.civic.grievance.exception.BadRequestException;
import com.civic.grievance.repository.UserRepository;
import com.civic.grievance.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern AADHAAR_PATTERN = Pattern.compile("^\\d{12}$");
    private static final Pattern PAN_PATTERN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$");
    private static final Pattern VOTER_ID_PATTERN = Pattern.compile("^[A-Z]{3}[0-9]{7}$");
    private static final Pattern DRIVING_LICENSE_PATTERN = Pattern.compile("^[A-Z0-9]{10,18}$");
    private static final Pattern PASSPORT_PATTERN = Pattern.compile("^[A-Z][0-9]{7}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        IdentityInfo identityInfo = validateAndNormalizeIdentity(request);

        // Officers require admin approval; all others are auto-approved
        boolean approved = request.getRole() != Role.OFFICER && request.getRole() != Role.SUPERVISOR;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
            .identityType(identityInfo.type())
            .identityNumber(identityInfo.number())
                .approved(approved)
                .build();

        User savedUser = userRepository.save(user);

        String message = approved
                ? "Registration successful. You can now log in."
                : "Registration submitted. Awaiting admin approval before you can log in.";

        return AuthResponse.builder()
                .message(message)
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .approved(savedUser.isApproved())
                .build();
    }

    private IdentityInfo validateAndNormalizeIdentity(RegisterRequest request) {
        if (request.getRole() != Role.CITIZEN) {
            return new IdentityInfo(null, null);
        }

        String rawType = request.getIdentityType();
        String rawNumber = request.getIdentityNumber();
        if (rawType == null || rawType.isBlank() || rawNumber == null || rawNumber.isBlank()) {
            throw new BadRequestException("Identity type and identity number are required for citizen registration");
        }

        String type = rawType.trim().toUpperCase(Locale.ROOT);
        String number = rawNumber.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", "");

        boolean valid = switch (type) {
            case "AADHAAR" -> AADHAAR_PATTERN.matcher(number).matches();
            case "PAN" -> PAN_PATTERN.matcher(number).matches();
            case "VOTER_ID" -> VOTER_ID_PATTERN.matcher(number).matches();
            case "DRIVING_LICENSE" -> DRIVING_LICENSE_PATTERN.matcher(number).matches();
            case "PASSPORT" -> PASSPORT_PATTERN.matcher(number).matches();
            default -> throw new BadRequestException("Unsupported identity type: " + rawType);
        };

        if (!valid) {
            throw new BadRequestException("Invalid identity number format for " + type);
        }
        return new IdentityInfo(type, number);
    }

    private record IdentityInfo(String type, String number) {}

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (!user.isApproved()) {
            throw new BadRequestException("Your account is pending admin approval. Please wait.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(user.isApproved())
                .build();
    }
}