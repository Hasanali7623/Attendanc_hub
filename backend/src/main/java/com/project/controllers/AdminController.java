package com.project.controllers;

import com.project.dto.*;
import com.project.services.AttendanceService;
import com.project.services.DashboardService;
import com.project.services.LeaveService;
import com.project.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final DashboardService dashboardService;
    private final AttendanceService attendanceService;
    private final LeaveService leaveService;
    private final AuthService authService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {
        DashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", response));
    }
    
    @GetMapping("/attendance/all")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAllAttendance() {
        List<AttendanceResponse> response = attendanceService.getAllAttendance();
        return ResponseEntity.ok(ApiResponse.success("All attendance retrieved successfully", response));
    }
    
    @GetMapping("/leaves/pending")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getPendingLeaves() {
        List<LeaveResponse> response = leaveService.getPendingLeaves();
        return ResponseEntity.ok(ApiResponse.success("Pending leaves retrieved successfully", response));
    }
    
    @GetMapping("/leaves/all")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllLeaves() {
        List<LeaveResponse> response = leaveService.getAllLeaves();
        return ResponseEntity.ok(ApiResponse.success("All leaves retrieved successfully", response));
    }
    
    @PutMapping("/leave/approve/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> approveLeave(
            @PathVariable Long id,
            @RequestBody LeaveActionRequest request,
            Authentication authentication) {
        String approvedBy = authentication.getName();
        LeaveResponse response = leaveService.approveLeave(id, request, approvedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave approved successfully", response));
    }
    
    @PutMapping("/leave/reject/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> rejectLeave(
            @PathVariable Long id,
            @RequestBody LeaveActionRequest request,
            Authentication authentication) {
        String rejectedBy = authentication.getName();
        LeaveResponse response = leaveService.rejectLeave(id, request, rejectedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave rejected successfully", response));
    }
    
    @PostMapping("/student/create")
    public ResponseEntity<ApiResponse<AuthResponse>> createStudent(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Student created successfully", response));
    }
    
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllStudents() {
        List<UserResponse> response = dashboardService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", response));
    }
    
    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        dashboardService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted permanently", null));
    }
    
    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {
        UserResponse response = dashboardService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", response));
    }
    
    @PatchMapping("/students/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleStudentStatus(@PathVariable Long id) {
        UserResponse response = dashboardService.toggleStudentStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Student status updated successfully", response));
    }
}
