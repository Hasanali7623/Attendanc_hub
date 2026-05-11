package com.project.services;

import com.project.dto.*;
import com.project.exception.BadRequestException;
import com.project.exception.ResourceNotFoundException;
import com.project.models.Attendance;
import com.project.models.User;
import com.project.repositories.AttendanceRepository;
import com.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request, String markedBy) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new BadRequestException("User is not a student");
        }
        
        // Check if attendance already exists for this date and subject
        if (attendanceRepository.findByStudentAndDateAndSubject(
                student, request.getDate(), request.getSubject()).isPresent()) {
            throw new BadRequestException("Attendance already marked for this date and subject");
        }
        
        Attendance attendance = Attendance.builder()
                .student(student)
                .date(request.getDate())
                .status(Attendance.AttendanceStatus.valueOf(request.getStatus().toUpperCase()))
                .subject(request.getSubject())
                .remarks(request.getRemarks())
                .markedBy(markedBy)
                .build();
        
        Attendance saved = attendanceRepository.save(attendance);
        
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendance(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        List<Attendance> attendances = attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
        
        return attendances.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public List<AttendanceResponse> markBulkAttendance(List<AttendanceRequest> requests, String markedBy) {
        return requests.stream()
                .map(request -> {
                    User student = userRepository.findById(request.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));
                    
                    if (student.getRole() != User.Role.STUDENT) {
                        throw new BadRequestException("User with ID " + request.getStudentId() + " is not a student");
                    }
                    
                    // Check if attendance already exists for this date and subject
                    if (attendanceRepository.findByStudentAndDateAndSubject(
                            student, request.getDate(), request.getSubject()).isPresent()) {
                        // Skip duplicate attendance records
                        return null;
                    }
                    
                    Attendance attendance = Attendance.builder()
                            .student(student)
                            .date(request.getDate())
                            .status(Attendance.AttendanceStatus.valueOf(request.getStatus().toUpperCase()))
                            .subject(request.getSubject())
                            .remarks(request.getRemarks())
                            .markedBy(markedBy)
                            .build();
                    
                    Attendance saved = attendanceRepository.save(attendance);
                    return mapToResponse(saved);
                })
                .filter(response -> response != null) // Filter out duplicates
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndDateBetween(
                studentId, startDate, endDate);
        
        return attendances.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStats(Long studentId) {
        Long totalPresent = attendanceRepository.countPresentByStudentId(studentId);
        Long totalAbsent = attendanceRepository.countAbsentByStudentId(studentId);
        Long totalClasses = attendanceRepository.countTotalByStudentId(studentId);
        
        double percentage = totalClasses > 0 
                ? (totalPresent.doubleValue() / totalClasses.doubleValue()) * 100 
                : 0.0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPresent", totalPresent);
        stats.put("totalAbsent", totalAbsent);
        stats.put("totalClasses", totalClasses);
        stats.put("percentage", Math.round(percentage * 100.0) / 100.0);
        
        // Subject-wise attendance
        List<Object[]> subjectData = attendanceRepository.countBySubjectForStudent(studentId);
        Map<String, Long> subjectWise = new HashMap<>();
        for (Object[] data : subjectData) {
            subjectWise.put((String) data[0], (Long) data[1]);
        }
        stats.put("subjectWise", subjectWise);
        
        return stats;
    }
    
    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request, String updatedBy) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        
        // Update only the status (and optionally remarks)
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getRemarks() != null) {
            attendance.setRemarks(request.getRemarks());
        }
        attendance.setMarkedBy(updatedBy); // Track who updated it
        
        Attendance updated = attendanceRepository.save(attendance);
        return mapToResponse(updated);
    }
    
    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getName())
                .studentEmail(attendance.getStudent().getEmail())
                .date(attendance.getDate())
                .status(attendance.getStatus().name())
                .subject(attendance.getSubject())
                .remarks(attendance.getRemarks())
                .markedBy(attendance.getMarkedBy())
                .createdAt(attendance.getCreatedAt())
                .build();
    }
}
