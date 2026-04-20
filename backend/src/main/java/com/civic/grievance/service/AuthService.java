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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Officers require admin approval; all others are auto-approved
        boolean approved = request.getRole() != Role.OFFICER && request.getRole() != Role.SUPERVISOR;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
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