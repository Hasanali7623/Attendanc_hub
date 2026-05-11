package com.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    
    @NotBlank(message = "Subject name is required")
    private String name;
    
    @NotBlank(message = "Subject code is required")
    private String code;
    
    @NotBlank(message = "Semester is required")
    private String semester;
    
    @NotBlank(message = "Department is required")
    private String department;
    
    private String description;
    
    private Integer credits;
    
    private String facultyName;
    
    private Boolean isActive;
}
