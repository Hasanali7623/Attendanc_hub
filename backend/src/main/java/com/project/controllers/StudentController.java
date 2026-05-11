package com.project.controllers;

import com.project.dto.ApiResponse;
import com.project.dto.DashboardResponse;
import com.project.dto.UserResponse;
import com.project.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StudentController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStudentDashboard(
            @RequestParam Long studentId) {
        DashboardResponse response = dashboardService.getStudentDashboard(studentId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", response));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@RequestParam Long userId) {
        UserResponse response = dashboardService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }
}
