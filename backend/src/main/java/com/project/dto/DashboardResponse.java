package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalStudents;
    private Long totalPresent;
    private Long totalAbsent;
    private Long totalLeaveRequests;
    private Long pendingLeaves;
    private Long approvedLeaves;
    private Long rejectedLeaves;
    private Double attendancePercentage;
    private Map<String, Object> chartData;
    private Map<String, Long> subjectWiseAttendance;
    
    // Admin-specific fields
    private Long todayAttendance;
    private Double overallAttendanceRate;
    private List<Map<String, Object>> attendanceTrend;
    private List<Map<String, Object>> departmentAttendance;
    private List<Map<String, Object>> recentLeaves;
    private List<Map<String, Object>> todayAttendanceBySubject;
    
    // Student-specific fields
    private List<Map<String, Object>> monthlyAttendance;
}
