package com.project.controllers;

import com.project.dto.ApiResponse;
import com.project.dto.LeaveActionRequest;
import com.project.dto.LeaveRequestDto;
import com.project.dto.LeaveResponse;
import com.project.services.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LeaveController {
    
    private final LeaveService leaveService;
    
    // Student endpoints
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            @Valid @RequestBody LeaveRequestDto request,
            @RequestParam Long studentId) {
        LeaveResponse response = leaveService.applyLeave(studentId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", response));
    }
    
    @GetMapping("/my-leaves")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getMyLeaves(
            @RequestParam Long studentId) {
        List<LeaveResponse> response = leaveService.getMyLeaves(studentId);
        return ResponseEntity.ok(ApiResponse.success("Leave requests retrieved successfully", response));
    }
    
    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllLeaves() {
        List<LeaveResponse> response = leaveService.getAllLeaves();
        return ResponseEntity.ok(ApiResponse.success("All leave requests retrieved successfully", response));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getPendingLeaves() {
        List<LeaveResponse> response = leaveService.getPendingLeaves();
        return ResponseEntity.ok(ApiResponse.success("Pending leave requests retrieved successfully", response));
    }
    
    @PutMapping("/{leaveId}/approve")
    public ResponseEntity<ApiResponse<LeaveResponse>> approveLeave(
            @PathVariable Long leaveId,
            @RequestBody(required = false) LeaveActionRequest request,
            Authentication authentication) {
        String approvedBy = authentication != null ? authentication.getName() : "Admin";
        LeaveActionRequest actionRequest = request != null ? request : new LeaveActionRequest();
        LeaveResponse response = leaveService.approveLeave(leaveId, actionRequest, approvedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved successfully", response));
    }
    
    @PutMapping("/{leaveId}/reject")
    public ResponseEntity<ApiResponse<LeaveResponse>> rejectLeave(
            @PathVariable Long leaveId,
            @RequestBody(required = false) LeaveActionRequest request,
            Authentication authentication) {
        String rejectedBy = authentication != null ? authentication.getName() : "Admin";
        LeaveActionRequest actionRequest = request != null ? request : new LeaveActionRequest();
        LeaveResponse response = leaveService.rejectLeave(leaveId, actionRequest, rejectedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected successfully", response));
    }
    
    @PutMapping("/bulk/approve")
    public ResponseEntity<ApiResponse<String>> bulkApproveLeaves(
            @RequestBody List<Long> leaveIds,
            Authentication authentication) {
        String approvedBy = authentication != null ? authentication.getName() : "Admin";
        int count = 0;
        for (Long leaveId : leaveIds) {
            try {
                leaveService.approveLeave(leaveId, new LeaveActionRequest(), approvedBy);
                count++;
            } catch (Exception e) {
                // Continue with next leave
            }
        }
        return ResponseEntity.ok(ApiResponse.success(count + " leave request(s) approved successfully", null));
    }
    
    @PutMapping("/bulk/reject")
    public ResponseEntity<ApiResponse<String>> bulkRejectLeaves(
            @RequestBody List<Long> leaveIds,
            Authentication authentication) {
        String rejectedBy = authentication != null ? authentication.getName() : "Admin";
        int count = 0;
        for (Long leaveId : leaveIds) {
            try {
                leaveService.rejectLeave(leaveId, new LeaveActionRequest(), rejectedBy);
                count++;
            } catch (Exception e) {
                // Continue with next leave
            }
        }
        return ResponseEntity.ok(ApiResponse.success(count + " leave request(s) rejected successfully", null));
    }
}
