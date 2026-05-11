package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDate date;
    private String status;
    private String subject;
    private String remarks;
    private String markedBy;
    private LocalDateTime createdAt;
}
