package com.project.services;

import com.project.dto.DashboardResponse;
import com.project.dto.RegisterRequest;
import com.project.dto.UserResponse;
import com.project.exception.ResourceNotFoundException;
import com.project.models.LeaveRequest;
import com.project.models.User;
import com.project.repositories.AttendanceRepository;
import com.project.repositories.LeaveRequestRepository;
import com.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DashboardResponse getStudentDashboard(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        Long totalPresent = attendanceRepository.countPresentByStudentId(studentId);
        Long totalAbsent = attendanceRepository.countAbsentByStudentId(studentId);
        Long totalClasses = attendanceRepository.countTotalByStudentId(studentId);
        
        Long totalLeaves = leaveRequestRepository.countByStudentIdAndStatus(
                studentId, LeaveRequest.LeaveStatus.PENDING) +
                leaveRequestRepository.countByStudentIdAndStatus(
                        studentId, LeaveRequest.LeaveStatus.APPROVED) +
                leaveRequestRepository.countByStudentIdAndStatus(
                        studentId, LeaveRequest.LeaveStatus.REJECTED);
        
        Long pendingLeaves = leaveRequestRepository.countByStudentIdAndStatus(
                studentId, LeaveRequest.LeaveStatus.PENDING);
        Long approvedLeaves = leaveRequestRepository.countByStudentIdAndStatus(
                studentId, LeaveRequest.LeaveStatus.APPROVED);
        Long rejectedLeaves = leaveRequestRepository.countByStudentIdAndStatus(
                studentId, LeaveRequest.LeaveStatus.REJECTED);
        
        double percentage = totalClasses > 0 
                ? (totalPresent.doubleValue() / totalClasses.doubleValue()) * 100 
                : 0.0;
        
        // Chart data for frontend
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("present", totalPresent);
        chartData.put("absent", totalAbsent);
        
        // Subject-wise attendance
        List<Object[]> subjectData = attendanceRepository.countBySubjectForStudent(studentId);
        Map<String, Long> subjectWise = new HashMap<>();
        for (Object[] data : subjectData) {
            subjectWise.put((String) data[0], (Long) data[1]);
        }
        
        return DashboardResponse.builder()
                .totalStudents(null)
                .totalPresent(totalPresent)
                .totalAbsent(totalAbsent)
                .totalLeaveRequests(totalLeaves)
                .pendingLeaves(pendingLeaves)
                .approvedLeaves(approvedLeaves)
                .rejectedLeaves(rejectedLeaves)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .monthlyAttendance(List.of())
                .chartData(chartData)
                .subjectWiseAttendance(subjectWise)
                .build();
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardResponse getAdminDashboard() {
        Long totalStudents = userRepository.countByRole(User.Role.STUDENT);
        
        // Debug: Show which students are being counted
        List<User> activeStudents = userRepository.findByRoleAndIsActive(User.Role.STUDENT, true);
        System.out.println("=========== STUDENT COUNT DEBUG ===========");
        System.out.println("Total Active Students Count: " + totalStudents);
        System.out.println("Actual Active Students:");
        for (User student : activeStudents) {
            System.out.println("  ID: " + student.getId() + 
                             " | Name: " + student.getName() + 
                             " | Email: " + student.getEmail() +
                             " | Student ID: " + student.getStudentId() +
                             " | Active: " + student.getIsActive());
        }
        System.out.println("===========================================");
        
        LocalDate today = LocalDate.now();
        // Count all attendance records across all subjects (not distinct students)
        Long totalPresentToday = attendanceRepository.countPresentByDate(today);
        Long totalAbsentToday = attendanceRepository.countAbsentByDate(today);
        Long totalAttendanceRecords = totalPresentToday + totalAbsentToday;
        
        // Debug: Get all today's attendance records to verify
        List<com.project.models.Attendance> todayRecords = attendanceRepository.findByDate(today);
        System.out.println("=========== DASHBOARD COUNTS DEBUG ===========");
        System.out.println("Date: " + today);
        System.out.println("Total Students Enrolled: " + totalStudents);
        System.out.println("Total Attendance Records Today: " + totalAttendanceRecords);
        System.out.println("Total Present Records (all subjects): " + totalPresentToday);
        System.out.println("Total Absent Records (all subjects): " + totalAbsentToday);
        System.out.println("Raw records count from findByDate: " + todayRecords.size());
        System.out.println("--- Today's Attendance Details ---");
        for (com.project.models.Attendance record : todayRecords) {
            System.out.println("  Student: " + record.getStudent().getName() + 
                             " | Subject: " + record.getSubject() + 
                             " | Status: " + record.getStatus() +
                             " | Date: " + record.getDate());
        }
        System.out.println("=============================================");
        
        Long pendingLeaves = leaveRequestRepository.countByStatus(LeaveRequest.LeaveStatus.PENDING);
        Long approvedLeaves = leaveRequestRepository.countByStatus(LeaveRequest.LeaveStatus.APPROVED);
        Long rejectedLeaves = leaveRequestRepository.countByStatus(LeaveRequest.LeaveStatus.REJECTED);
        Long totalLeaves = pendingLeaves + approvedLeaves + rejectedLeaves;
        
        // Calculate overall attendance rate based on all records
        double overallAttendanceRate = 0.0;
        if (totalAttendanceRecords > 0) {
            overallAttendanceRate = Math.round((totalPresentToday.doubleValue() / totalAttendanceRecords.doubleValue()) * 100.0 * 100.0) / 100.0;
        }
        
        // Calculate weekly attendance trend (last 7 days)
        List<Map<String, Object>> attendanceTrend = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Long presentCount = attendanceRepository.countPresentByDate(date);
            Long absentCount = attendanceRepository.countAbsentByDate(date);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("present", presentCount);
            dayData.put("absent", absentCount);
            attendanceTrend.add(dayData);
        }
        
        // Calculate department-wise attendance
        List<String> departments = List.of("Computer Science", "Information Technology", 
                                          "Electronics", "Mechanical", "Civil", "Electrical");
        List<Map<String, Object>> departmentAttendance = new java.util.ArrayList<>();
        
        for (String dept : departments) {
            Long deptStudents = userRepository.countByRoleAndDepartment(User.Role.STUDENT, dept);
            if (deptStudents > 0) {
                Long deptPresent = attendanceRepository.countPresentByDateAndDepartment(today, dept);
                double percentage = Math.round((deptPresent.doubleValue() / deptStudents.doubleValue()) * 100.0 * 100.0) / 100.0;
                
                Map<String, Object> deptData = new HashMap<>();
                deptData.put("name", dept);
                deptData.put("value", percentage);
                deptData.put("students", deptStudents);
                deptData.put("present", deptPresent);
                departmentAttendance.add(deptData);
            }
        }
        
        // Get recent leave requests (last 5)
        List<LeaveRequest> recentLeaveRequests = leaveRequestRepository.findTop5ByOrderByCreatedAtDesc();
        List<Map<String, Object>> recentLeaves = recentLeaveRequests.stream()
                .map(leave -> {
                    Map<String, Object> leaveData = new HashMap<>();
                    leaveData.put("id", leave.getId());
                    leaveData.put("studentName", leave.getStudent().getName());
                    leaveData.put("reason", leave.getReason());
                    leaveData.put("status", leave.getStatus().name());
                    leaveData.put("startDate", leave.getFromDate().toString());
                    leaveData.put("endDate", leave.getToDate().toString());
                    return leaveData;
                })
                .collect(Collectors.toList());
        
        // Get today's attendance details by subject and teacher
        System.out.println("Fetching attendance for date: " + today);
        List<Object[]> todayAttendanceDetails = attendanceRepository.findTodayAttendanceBySubjectAndTeacher(today);
        System.out.println("Found " + todayAttendanceDetails.size() + " subject attendance records for today");
        List<Map<String, Object>> todayAttendanceBySubject = todayAttendanceDetails.stream()
                .map(detail -> {
                    Map<String, Object> subjectData = new HashMap<>();
                    subjectData.put("subject", detail[0]); // subject name
                    subjectData.put("teacher", detail[1] != null ? detail[1] : "Not Specified"); // markedBy (teacher)
                    subjectData.put("present", detail[2]); // present count
                    subjectData.put("absent", detail[3]); // absent count
                    subjectData.put("total", detail[4]); // total count
                    subjectData.put("date", today.toString()); // Add date for verification
                    System.out.println("Subject: " + detail[0] + ", Teacher: " + detail[1] + ", Present: " + detail[2] + ", Absent: " + detail[3]);
                    return subjectData;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("presentToday", totalPresentToday);
        chartData.put("absentToday", totalAbsentToday);
        chartData.put("totalStudents", totalStudents);
        
        return DashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalPresent(totalPresentToday)
                .totalAbsent(totalAbsentToday)
                .totalLeaveRequests(totalLeaves)
                .pendingLeaves(pendingLeaves)
                .approvedLeaves(approvedLeaves)
                .rejectedLeaves(rejectedLeaves)
                .attendancePercentage(overallAttendanceRate)
                .todayAttendance(totalPresentToday)
                .overallAttendanceRate(overallAttendanceRate)
                .attendanceTrend(attendanceTrend)
                .departmentAttendance(departmentAttendance)
                .recentLeaves(recentLeaves)
                .todayAttendanceBySubject(todayAttendanceBySubject)
                .chartData(chartData)
                .subjectWiseAttendance(null)
                .build();
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UserResponse> getAllStudents() {
        // Return all students (both active and inactive) so admins can manage their status
        return userRepository.findByRole(User.Role.STUDENT).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return mapToUserResponse(user);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public void deleteStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new ResourceNotFoundException("User is not a student");
        }
        
        // Permanently delete the student from database
        userRepository.delete(student);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public UserResponse updateStudent(Long studentId, RegisterRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new ResourceNotFoundException("User is not a student");
        }
        
        // Update student details
        student.setName(request.getName());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setDepartment(request.getDepartment());
        student.setSemester(request.getSemester());
        
        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            student.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedStudent = userRepository.save(student);
        return mapToUserResponse(updatedStudent);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public UserResponse toggleStudentStatus(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new ResourceNotFoundException("User is not a student");
        }
        
        // Toggle active status
        student.setIsActive(!student.getIsActive());
        
        User updatedStudent = userRepository.save(student);
        return mapToUserResponse(updatedStudent);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .studentId(user.getStudentId())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .semester(user.getSemester())
                .isActive(user.getIsActive())
                .build();
    }
}
