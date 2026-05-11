package com.project.services;

import com.project.dto.LeaveActionRequest;
import com.project.dto.LeaveRequestDto;
import com.project.dto.LeaveResponse;
import com.project.exception.BadRequestException;
import com.project.exception.ResourceNotFoundException;
import com.project.models.LeaveRequest;
import com.project.models.User;
import com.project.repositories.LeaveRequestRepository;
import com.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {
    
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public LeaveResponse applyLeave(Long studentId, LeaveRequestDto request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new BadRequestException("Only students can apply for leave");
        }
        
        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new BadRequestException("From date cannot be after to date");
        }
        
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .student(student)
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .leaveType(request.getLeaveType())
                .reason(request.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();
        
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public List<LeaveResponse> getMyLeaves(Long studentId) {
        return leaveRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<LeaveResponse> getPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public LeaveResponse approveLeave(Long leaveId, LeaveActionRequest request, String approvedBy) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already processed");
        }
        
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest.setAdminRemarks(request.getAdminRemarks());
        leaveRequest.setApprovedBy(approvedBy);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        
        return mapToResponse(updated);
    }
    
    @Transactional
    public LeaveResponse rejectLeave(Long leaveId, LeaveActionRequest request, String rejectedBy) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        
        if (leaveRequest.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already processed");
        }
        
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest.setAdminRemarks(request.getAdminRemarks());
        leaveRequest.setApprovedBy(rejectedBy);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        
        return mapToResponse(updated);
    }
    
    private LeaveResponse mapToResponse(LeaveRequest leaveRequest) {
        User student = leaveRequest.getStudent();
        return LeaveResponse.builder()
                .id(leaveRequest.getId())
                .studentId(student.getId())
                .studentName(student.getName())
                .studentEmail(student.getEmail())
                .studentIdNumber(student.getStudentId())
                .department(student.getDepartment())
                .fromDate(leaveRequest.getFromDate())
                .toDate(leaveRequest.getToDate())
                .leaveType(leaveRequest.getLeaveType())
                .reason(leaveRequest.getReason())
                .status(leaveRequest.getStatus().name())
                .adminRemarks(leaveRequest.getAdminRemarks())
                .approvedBy(leaveRequest.getApprovedBy())
                .approvedAt(leaveRequest.getApprovedAt())
                .createdAt(leaveRequest.getCreatedAt())
                .updatedAt(leaveRequest.getUpdatedAt())
                .build();
    }
}
