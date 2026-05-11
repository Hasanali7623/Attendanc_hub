package com.project.services;

import com.project.dto.*;
import com.project.exception.BadRequestException;
import com.project.exception.UnauthorizedException;
import com.project.models.User;
import com.project.repositories.UserRepository;
import com.project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        String studentId = null;
        
        // Auto-generate student ID for students
        if ("STUDENT".equalsIgnoreCase(request.getRole())) {
            studentId = generateStudentId(request.getDepartment());
        }
        
        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .studentId(studentId)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .semester(request.getSemester())
                .assignedSemester(request.getAssignedSemester())
                .profileImage(request.getProfileImage())
                .isActive(true)
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .profileImage(savedUser.getProfileImage())
                .studentId(savedUser.getStudentId())
                .assignedSemester(savedUser.getAssignedSemester())
                .build();
    }
    
    private String generateStudentId(String department) {
        // Get current year (last 2 digits)
        int year = java.time.Year.now().getValue() % 100;
        
        // Map department to course code
        String courseCode = getCourseCode(department);
        
        // Find the last student ID with the same year and course code
        String prefix = "R" + year + courseCode;
        String lastStudentId = userRepository.findTopByStudentIdStartingWithOrderByStudentIdDesc(prefix)
                .map(User::getStudentId)
                .orElse(null);
        
        int nextNumber = 1;
        if (lastStudentId != null && lastStudentId.length() >= prefix.length() + 3) {
            try {
                String numberPart = lastStudentId.substring(prefix.length());
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                // If parsing fails, start from 1
                nextNumber = 1;
            }
        }
        
        // Format: R{YY}{COURSE}{XXX}
        return String.format("%s%03d", prefix, nextNumber);
    }
    
    private String getCourseCode(String department) {
        if (department == null) {
            return "GN"; // General
        }
        
        String dept = department.toUpperCase();
        
        // Map common department names to 2-letter codes
        if (dept.contains("COMPUTER") || dept.contains("CS")) {
            return "CS";
        } else if (dept.contains("DATA") || dept.contains("DE")) {
            return "DE";
        } else if (dept.contains("INFORMATION") || dept.contains("IT")) {
            return "IT";
        } else if (dept.contains("MECHANICAL") || dept.contains("ME")) {
            return "ME";
        } else if (dept.contains("CIVIL") || dept.contains("CE")) {
            return "CE";
        } else if (dept.contains("ELECTRICAL") || dept.contains("EE")) {
            return "EE";
        } else if (dept.contains("ELECTRONICS") || dept.contains("EC")) {
            return "EC";
        } else {
            // Use first 2 letters of department as fallback
            return dept.length() >= 2 ? dept.substring(0, 2) : "GN";
        }
    }
    
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        // Get user details
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .studentId(user.getStudentId())
                .assignedSemester(user.getAssignedSemester())
                .build();
    }
}
