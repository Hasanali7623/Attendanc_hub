package com.project.controllers;

import com.project.dto.ApiResponse;
import com.project.dto.SubjectDto;
import com.project.models.Subject;
import com.project.services.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SubjectController {
    
    private final SubjectService subjectService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Subject>> createSubject(@Valid @RequestBody SubjectDto dto) {
        Subject subject = subjectService.createSubject(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully", subject));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectDto dto) {
        Subject subject = subjectService.updateSubject(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", subject));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable Long id) {
        Subject subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully", subject));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
    }
    
    @GetMapping("/semester/{semester}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsBySemester(@PathVariable String semester) {
        List<Subject> subjects = subjectService.getSubjectsBySemester(semester);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByDepartment(@PathVariable String department) {
        List<Subject> subjects = subjectService.getSubjectsByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Subject>>> getActiveSubjects() {
        List<Subject> subjects = subjectService.getActiveSubjects();
        return ResponseEntity.ok(ApiResponse.success("Active subjects retrieved successfully", subjects));
    }
}
