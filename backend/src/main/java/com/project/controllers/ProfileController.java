package com.project.controllers;

import com.project.dto.ApiResponse;
import com.project.dto.ChangePasswordRequest;
import com.project.dto.UpdateProfileRequest;
import com.project.dto.UserResponse;
import com.project.services.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ProfileController {
    
    private final ProfileService profileService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserResponse response = profileService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }
    
    @PutMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        UserResponse response = profileService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
    
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        profileService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
    
    @PostMapping("/photo")
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("photo") MultipartFile file) {
        String email = authentication.getName();
        UserResponse response = profileService.uploadProfilePhoto(email, file);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", response));
    }
}
