package com.project.services;

import com.project.dto.SubjectDto;
import com.project.exception.BadRequestException;
import com.project.exception.ResourceNotFoundException;
import com.project.models.Subject;
import com.project.repositories.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {
    
    private final SubjectRepository subjectRepository;
    
    @Transactional
    public Subject createSubject(SubjectDto dto) {
        // Check if subject code already exists
        if (subjectRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BadRequestException("Subject with code " + dto.getCode() + " already exists");
        }
        
        Subject subject = Subject.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .semester(dto.getSemester())
                .department(dto.getDepartment())
                .description(dto.getDescription())
                .credits(dto.getCredits())
                .facultyName(dto.getFacultyName())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        
        return subjectRepository.save(subject);
    }
    
    @Transactional
    public Subject updateSubject(Long id, SubjectDto dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        
        // Check if code is being changed and if it already exists
        if (!subject.getCode().equals(dto.getCode())) {
            if (subjectRepository.findByCode(dto.getCode()).isPresent()) {
                throw new BadRequestException("Subject with code " + dto.getCode() + " already exists");
            }
        }
        
        subject.setName(dto.getName());
        subject.setCode(dto.getCode());
        subject.setSemester(dto.getSemester());
        subject.setDepartment(dto.getDepartment());
        subject.setDescription(dto.getDescription());
        subject.setCredits(dto.getCredits());
        subject.setFacultyName(dto.getFacultyName());
        if (dto.getIsActive() != null) {
            subject.setIsActive(dto.getIsActive());
        }
        
        return subjectRepository.save(subject);
    }
    
    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        subjectRepository.delete(subject);
    }
    
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }
    
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Subject> getSubjectsBySemester(String semester) {
        return subjectRepository.findBySemester(semester);
    }
    
    public List<Subject> getSubjectsByDepartment(String department) {
        return subjectRepository.findByDepartment(department);
    }
    
    public List<Subject> getSubjectsBySemesterAndDepartment(String semester, String department) {
        return subjectRepository.findBySemesterAndDepartment(semester, department);
    }
    
    public List<Subject> getActiveSubjects() {
        return subjectRepository.findByIsActive(true);
    }
}
