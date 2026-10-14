package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.AuthRequest;
import com.lmslite.dto.AuthResponse;
import com.lmslite.dto.RegisterRequest;
import com.lmslite.entity.Role;
import com.lmslite.entity.User;
import com.lmslite.repository.UserRepository;
import com.lmslite.security.JwtUtils;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getCredential(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails.getUsername());

        // Update last login
        userRepository.findById(userDetails.getId()).ifPresent(u -> {
            u.setLastLogin(LocalDateTime.now());
            userRepository.save(u);
        });

        auditLogService.log(userDetails.getId(), userDetails.getUsername(), userDetails.getRole().name(),
                "LOGIN", "Auth", "User logged in successfully", request.getRemoteAddr());

        AuthResponse response = new AuthResponse(
                jwt,
                refreshToken,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole(),
                userDetails.getFullName(),
                userDetails.getStudentId(),
                null,
                null
        );

        userRepository.findById(userDetails.getId()).ifPresent(u -> {
            response.setDepartment(u.getDepartment());
            response.setInstitutionId(u.getInstitutionId());
        });

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest, HttpServletRequest request) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: Email is already in use!"));
        }

        if (signUpRequest.getRole() == Role.STUDENT && StringUtils.hasText(signUpRequest.getStudentId())) {
            if (userRepository.existsByStudentId(signUpRequest.getStudentId())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Error: Student ID is already registered!"));
            }
        }

        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getRole(),
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getDepartment(),
                signUpRequest.getInstitutionId(),
                signUpRequest.getStudentId()
        );

        user = userRepository.save(user);

        auditLogService.log(user.getId(), user.getUsername(), user.getRole().name(),
                "REGISTER", "Auth", "User registered successfully", request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("User registered successfully! Please log in."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtUtils.blacklistToken(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
