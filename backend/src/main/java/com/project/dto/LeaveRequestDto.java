package com.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDto {
    
    @NotNull(message = "From date is required")
    private LocalDate fromDate;
    
    @NotNull(message = "To date is required")
    private LocalDate toDate;
    
    @NotBlank(message = "Leave type is required")
    private String leaveType;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}
