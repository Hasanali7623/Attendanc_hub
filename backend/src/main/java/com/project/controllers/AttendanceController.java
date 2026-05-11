package com.project.controllers;

import com.project.dto.ApiResponse;
import com.project.dto.AttendanceRequest;
import com.project.dto.AttendanceResponse;
import com.project.services.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {
        String markedBy = authentication.getName();
        AttendanceResponse response = attendanceService.markAttendance(request, markedBy);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", response));
    }
    
    @GetMapping("/my-attendance")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyAttendance(
            @RequestParam Long studentId) {
        List<AttendanceResponse> response = attendanceService.getMyAttendance(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", response));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStats(
            @RequestParam Long studentId) {
        Map<String, Object> stats = attendanceService.getAttendanceStats(studentId);
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved successfully", stats));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByDateRange(
            @RequestParam Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> response = attendanceService.getAttendanceByDateRange(
                studentId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", response));
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAllAttendance() {
        List<AttendanceResponse> response = attendanceService.getAllAttendance();
        return ResponseEntity.ok(ApiResponse.success("All attendance records retrieved successfully", response));
    }
    
    @PostMapping("/mark-bulk")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> markBulkAttendance(
            @Valid @RequestBody List<AttendanceRequest> requests,
            Authentication authentication) {
        String markedBy = authentication.getName();
        List<AttendanceResponse> response = attendanceService.markBulkAttendance(requests, markedBy);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance marked successfully", response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {
        String updatedBy = authentication.getName();
        AttendanceResponse response = attendanceService.updateAttendance(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", response));
    }
}
