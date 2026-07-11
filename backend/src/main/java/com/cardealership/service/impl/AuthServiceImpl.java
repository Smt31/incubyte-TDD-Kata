package com.cardealership.service.impl;

import com.cardealership.dto.LoginRequest;
import com.cardealership.dto.LoginResponse;
import com.cardealership.dto.RegisterRequest;
import com.cardealership.dto.UserResponse;
import com.cardealership.exception.EmailAlreadyExistsException;
import com.cardealership.exception.InvalidCredentialsException;
import com.cardealership.model.User;
import com.cardealership.repository.UserRepository;
import com.cardealership.security.JwtService;
import com.cardealership.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementation of AuthService.
 * Handles user registration and login business logic.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole() != null && !request.getRole().trim().isEmpty() ? request.getRole() : "USER")
                .build();

        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Find user — same generic error for missing user and wrong password (prevents enumeration)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user.getEmail());
        return buildLoginResponse(user, token);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Maps a saved User entity to a UserResponse DTO (no password exposed).
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Builds a LoginResponse combining user info with the generated JWT token.
     */
    private LoginResponse buildLoginResponse(User user, String token) {
        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
